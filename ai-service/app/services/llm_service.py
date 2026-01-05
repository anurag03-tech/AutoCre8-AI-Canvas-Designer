
import json
import re
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings
from app.schemas import HTMLOutput, ResizeOutput, Asset, ChatMessage, FabricOutput, BrandContext

class LLMService:
    def __init__(self):
        # 1. OpenAI for Precision (Canvas -> HTML)
        self.openai = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=0,  
            max_retries=1,
            request_timeout=30
        )
        
        # 2. Gemini for Vision & Chat (Assets/Screenshots)
        self.gemini = ChatGoogleGenerativeAI(
            model=settings.GOOGLE_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=1,  
            convert_system_message_to_human=True
        )

    def _clean_html(self, raw_html: str) -> str:
        """Removes markdown backticks if Gemini adds them"""
        if not raw_html:
            return ""
        clean = re.sub(r"```html", "", raw_html)
        clean = re.sub(r"```", "", clean)
        return clean.strip()

    # 1. INITIAL GENERATION (fabric to HTML) (OpenAI)
    async def generate_from_canvas(self, canvas_data: dict) -> str:
        width = canvas_data.get("width", 800)
        height = canvas_data.get("height", 600)
        background = canvas_data.get("background", "#ffffff")
        
        # Send COMPLETE objects 
        objects = canvas_data.get("objects", [])

        if not objects:
            return f'<div style="position:relative;width:{width}px;height:{height}px;background:{background};"></div>'

        structured_llm = self.openai.with_structured_output(HTMLOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at converting Fabric.js canvas JSON to HTML/CSS.

RULES:
1. Create container div with position:relative and exact width/height
2. Each object becomes HTML element with position:absolute
3. Preserve EXACT positions (left, top), sizes (width*scaleX, height*scaleY), colors, opacity
4. Handle types: rect, circle, text/textbox/i-text, image
5. For text: use exact text, fontSize*scaleY, fontFamily, fill as color
6. For images: use <img> with src
7. Apply rotation using transform:rotate(angle deg) if angle exists
8. Return clean HTML only
9. Use everything at exact same position as canvas"""),
            
            ("human", """Convert this Fabric.js canvas to HTML:

Canvas size: {width}x{height}
Background: {background}

Objects:
{objects_json}""")
        ])

        chain = prompt | structured_llm

        try:
            result = await chain.ainvoke({
                "width": width,
                "height": height,
                "background": background if isinstance(background, str) else "#ffffff",
                "objects_json": json.dumps(objects, indent=2)
            })
            return result.html
        except Exception as e:
            print(f"[OPENAI ERROR]: {str(e)}")
            raise e


    # 2. RESIZING (HTML TO HTML) (Gemini)

    async def generate_resize_variations(self, current_html: str, target_width: int, target_height: int) -> ResizeOutput:
        structured_llm = self.gemini.with_structured_output(ResizeOutput)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an intelligent visual layout engine.
            TASK: Adapt the HTML to a new canvas size.
            RULES:
            - Container must be exactly {target_width}px × {target_height}px
            - position:absolute ONLY
            - Background images must cover full canvas
            - dont disturb aspect ratio of images and elements
            - Reposition elements intelligently to fit the new aspect ratio"""),
            
            ("human", """
            CURRENT HTML: {current_html}
            TARGET SIZE: {target_width}x{target_height}
            """)
        ])

        chain = prompt | structured_llm

        result = await chain.ainvoke({
            "current_html": current_html,
            "target_width": target_width,
            "target_height": target_height
        })
        
        # Clean outputs (Gemini sometimes adds markdown)
        result.variation_1_html = self._clean_html(result.variation_1_html)
        result.variation_2_html = self._clean_html(result.variation_2_html)
        return result

    
    # ==========================================
    # 3. CHAT Assistance (Gemini Multimodal)
    # ==========================================
    async def edit_design_multimodal(
        self, 
        current_html: str, 
        user_prompt: str, 
        chat_history: list[ChatMessage], 
        assets: list[Asset], 
        screenshot: str | None,
        brand_context: BrandContext | None = None
    ) -> HTMLOutput:
        
        structured_llm = self.gemini.with_structured_output(HTMLOutput)
        
        
        # Base Persona & Principles
        system_instruction = """
    You are a Senior Creative Technologist and UI/UX Designer. 
    You transform user requests into pixel-perfect, high-fidelity visual compositions.

    UNIVERSAL DESIGN PRINCIPLES:
    1. COMPOSITION: Treat the main container as a 'Stage'. Use 'position: relative' for the parent and 'position: absolute' for high-impact graphics (posters/thumbnails) or 'Flex/Grid' for functional layouts (UIs).
    2. VISUAL HIERARCHY: Every design may have ONE clear focal point (large text or a hero image).
    3. MODERN AESTHETICS: Use modern CSS techniques: 
       - Gradients (linear and radial) for depth.
       - 'backdrop-filter: blur()' for glassmorphism effects.
       - 'filter: drop-shadow()' for objects to pop off the background.
       - Rounded corners (border-radius) for a premium feel.
    4. IMAGE HANDLING (CRITICAL):
       - Always provide explicit 'width' and 'height' for <img> tags.
       - Use 'object-fit: cover' to prevent image distortion.
    5. COLOR THEORY: Use high contrast for readability. Never put dark text on a dark background.
    """

        if brand_context:
            system_instruction += f"""
    
    ---------------------------------------------------
    🚨 STRICT BRAND GUIDELINES ENFORCEMENT ONLY IF REQUIRED MAIN FOCUS SHOULD BE BASED ON USER PROMPT🚨
    You are designing specifically for the brand: "{brand_context.name}".
    You MUST adhere to the following identity rules:

    1. BRAND DESCRIPTION (Context): 
       {brand_context.description or "No specific description provided."}

    2. VISUAL IDENTITY & VIBE: 
       {brand_context.identity or "Professional, Modern, and Clean."} 
       (Reflect this mood in your layout and styling choices).

    3. TYPOGRAPHY / FONTS: 
       Preference: "{brand_context.fontPreferences or "System Sans-Serif"}".
       - Use this font stack for headings and body text. 
       - If a specific Google Font is named, import it or use a web-safe alternative.

    4. COLOR PALETTE: 
       Theme: "{brand_context.colorTheme or "High Contrast & Harmonious"}".
       - Prioritize these colors for backgrounds, buttons, and accents.
       - Do NOT use colors that clash with this theme.
    """
            # Specific Asset Handling (Logo & Background)
            if brand_context.logoUrl:
                system_instruction += f'\n    5. LOGO PLACEMENT:\n       - You MUST include the brand logo if appropriate.\n       - URL: "{brand_context.logoUrl}"\n       - Place it strategically (e.g., top corner or bottom signature).'
            
            if brand_context.backgroundUrl:
                 system_instruction += f'\n    6. MANDATORY BACKGROUND:\n       - The user has a fixed brand background.\n       - You MUST use this image as the main background.\n       - URL: "{brand_context.backgroundUrl}"'

            system_instruction += "\n    ---------------------------------------------------\n"

        # Technical Constraints
        system_instruction += """
    TECHNICAL CONSTRAINTS:
    - Use INLINE CSS for all styles.
    - If the user provides a screenshot, analyze it to fix alignment, spacing, or color mismatches.
    - If images (ASSETS) are provided, use their EXACT URL string. Do not use placeholders if real assets exist.
    """

        # Create the Message List
        messages = [SystemMessage(content=system_instruction)]

        # 2. ADD CHAT HISTORY
        for msg in chat_history:
            messages.append(HumanMessage(content=f"[{msg.role.upper()}]: {msg.content}"))

        # 3. CONSTRUCT MULTIMODAL MESSAGE (Text + Images)
        content_parts = []
        
        # A. Context
        content_parts.append({
            "type": "text",
            "text": f"CURRENT HTML:\n{current_html}\n\nUSER REQUEST:\n{user_prompt}"
        })

        # B. Screenshot (Correction Loop)
        if screenshot:
            content_parts.append({
                "type": "text", "text": "CONTEXT: Screenshot of current render (Analyze for layout/color bugs):"
            })
            content_parts.append({
                "type": "image_url", "image_url": {"url": screenshot}
            })

        # C. Assets
        if assets:
            content_parts.append({
                "type": "text", "text": "AVAILABLE ASSETS (Analyze visual + Use URL):"
            })
            for asset in assets:
                # Send Image Data (for Vision)
                content_parts.append({
                    "type": "image_url", "image_url": {"url": asset.url}
                })
                # Send Text URL (for Code)
                content_parts.append({
                    "type": "text", "text": f"URL for image above: {asset.url}"
                })

        messages.append(HumanMessage(content=content_parts))

        result = await structured_llm.ainvoke(messages)
        
        # Clean Gemini output (safety net for markdown)
        result.html = self._clean_html(result.html)
        return result



    async def convert_html_to_fabric(self, html_content: str, canvas_width: int, canvas_height: int) -> FabricOutput:
        """
        Translates HTML/CSS back into a Fabric.js JSON object
        so the frontend can load it as editable objects.
        """
        
        llm_with_json = self.openai.bind(response_format={"type": "json_object"})
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a Fabric.js 6.0 expert. Convert HTML/CSS to valid Fabric.js canvas JSON.

    POSITIONING CALCULATION RULES:

    CRITICAL BACKGROUND RULE:
    - The top-level "background" property MUST only be a hex color string (e.g., "#ffffff").
    - If the HTML background is a GRADIENT or IMAGE, you MUST create a "rect" object as the FIRST element in the "objects" array.
    - This background rectangle must have: "left": 0, "top": 0, "width": {canvas_width}, "height": {canvas_height}, "selectable": false, "evented": false.

    GRADIENT FORMAT (MANDATORY):
    Gradients MUST follow this exact structure inside the "fill" property:
    {{
        "type": "linear",
        "coords": {{"x1": 0, "y1": 0, "x2": 0, "y2": height_of_object}},
        "colorStops": [
            {{"offset": 0, "color": "#start"}},
            {{"offset": 1, "color": "#end"}}
        ]
    }}

    For radial gradients:
    {{
        "type": "radial", 
        "coords": {{"x1": cx, "y1": cy, "r1": 0, "x2": cx, "y2": cy, "r2": radius}},
        "colorStops": [
            {{"offset": 0, "color": "#start"}},
            {{"offset": 1, "color": "#end"}}
        ]
    }}

    SHADOW FORMAT (Fabric.js 6.0):
    Do NOT use filters for shadows. Use the shadow property with this structure:
    {{
        "shadow": {{
            "color": "rgba(0,0,0,0.3)",
            "blur": 10,
            "offsetX": 5,
            "offsetY": 5
        }}
    }}

    FILTERS:
    Only use filters for: Brightness, Contrast, Saturate, and HueRotation using standard Fabric.js 6.0 format.

    IMPORTANT CONSTRAINTS:
    - Never set charSpacing lower than -100
    - When using clipPath for images, always set absolutePositioned: true and match the clipPath 'left' and 'top' to the parent object's 'left' and 'top'

    POSITIONING RULES:
    1. When HTML has "left: 50%" or "transform: translate(-50%, -50%)":
    - Calculate center position: canvas_width ÷ 2 for left, canvas_height ÷ 2 for top
    - Set "originX": "center" and "originY": "center"

    2. For {canvas_width}x{canvas_height} canvas:
    - Horizontal center: "left": {canvas_width}/2
    - Vertical center: "top": {canvas_height}/2

    3. Examples:
    - 1080px wide canvas → centered object: "left": 540
    - 1920px tall canvas → centered object: "top": 960

    TEXT HANDLING:
    - Use "i-text" for short text (single line or minimal wrapping)
    - Use "textbox" with "width" property for paragraphs and multi-line text
    - Analyze HTML container width to determine optimal text width
    - Insert "\\n" for line breaks at natural language boundaries
    - Common text object properties:
    {{
        "type": "i-text" or "textbox",
        "left": x,
        "top": y,
        "text": "content",
        "fontSize": 24,
        "fontFamily": "Arial",
        "fill": "#000000",
        "fontWeight": "normal",
        "fontStyle": "normal",
        "textAlign": "left",
        "lineHeight": 1.16
    }}

    IMAGE HANDLING:
    - Image objects MUST include "crossOrigin": "anonymous"
    - Example structure:
    {{
        "type": "image",
        "left": x,
        "top": y,
        "width": w,
        "height": h,
        "src": "url",
        "crossOrigin": "anonymous"
    }}

    RETURN FORMAT (Fabric.js 6.0):
    {{
        "version": "6.0.2",
        "width": {canvas_width},
        "height": {canvas_height},
        "background": "#ffffff",
        "objects": [...]
    }}

    CRITICAL: The "background" property should be a simple color string. For gradient backgrounds, create a rectangle object as the first item in objects array."""),
            
            ("human", """Convert this HTML to Fabric.js 6.0 JSON.

    Canvas dimensions: {canvas_width}px × {canvas_height}px
    Horizontal center position: {center_x}px
    Vertical center position: {center_y}px

    HTML:
    {html_content}""")
        ])
        
        chain = prompt | llm_with_json
        
        try:
            # Calculate center positions explicitly
            center_x = canvas_width // 2
            center_y = canvas_height // 2
            
            result = await chain.ainvoke({
                "html_content": html_content,
                "canvas_width": canvas_width,
                "canvas_height": canvas_height,
                "center_x": center_x,
                "center_y": center_y
            })
            
            import json
            data = json.loads(result.content)
            
            # Ensure version is 6.0.2
            version = data.get("version", "6.0.2")
            if version.startswith("7"):
                version = "6.0.2"
            
            return FabricOutput(
                version=version,
                width=data.get("width", canvas_width),
                height=data.get("height", canvas_height),
                background=data.get("background", "#ffffff"),
                objects=data.get("objects", [])
            )
            
        except Exception as e:
            print(f"[CONVERSION ERROR] {e}")
            if 'result' in locals():
                print(f"[RAW RESPONSE] {result.content}")
            raise e

