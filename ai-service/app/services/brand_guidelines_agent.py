# app/services/brand_guidelines_agent.py
import os
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.models.brand_guidelines import BrandGuidelines

# Initialize LLM with structured output
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY")
).with_structured_output(BrandGuidelines)  

async def generate_brand_guidelines(
    brand_name: str,
    logo_url: str,
    tagline: Optional[str] = None,
    description: Optional[str] = None,
    industry: Optional[str] = None,
    keywords: Optional[List[str]] = None,
    values: Optional[List[str]] = None,
) -> BrandGuidelines:
    """
    Use LangChain + GPT-4 Vision with structured output.
    """
    
    print(f"🤖 Analyzing brand: {brand_name}")
    
    # System prompt
    system_prompt = """You are an expert brand identity designer and strategist.
Analyze the brand logo and information to create comprehensive brand guidelines.

Focus on:
- Logo color extraction (exact hex codes)
- Complete color palette (primary, secondary, accent, neutrals, gradients)
- Typography that matches the brand style
- Brand personality and mood
- Clear design dos and don'ts
- Design tokens (spacing, border radius)
- Enhanced brand messaging

Be specific, professional, and ensure cohesive recommendations."""

    # User prompt with brand details
    user_prompt = """Analyze this brand:

Brand Name: {brand_name}
Tagline: {tagline}
Description: {description}
Industry: {industry}
Keywords: {keywords}
Values: {values}

Logo Image: Analyze the logo carefully for colors, style, and visual elements.

Generate comprehensive brand guidelines including all required fields."""

    # Create prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", [
            {"type": "text", "text": user_prompt},
            {
                "type": "image_url",
                "image_url": {
                    "url": "{logo_url}",
                    "detail": "high"
                }
            }
        ])
    ])
    
    # Create chain
    chain = prompt | llm
    
    try:
        print("📡 Calling GPT-4 Vision with structured output...")
        
        # Invoke and get structured Pydantic object directly
        guidelines = await chain.ainvoke({
            "brand_name": brand_name,
            "logo_url": logo_url,
            "tagline": tagline or "Not provided",
            "description": description or "Not provided",
            "industry": industry or "General",
            "keywords": ", ".join(keywords) if keywords else "Not provided",
            "values": ", ".join(values) if values else "Not provided",
        })
        
        print("\n" + "="*60)
        print("✅ GUIDELINES GENERATED:")
        print("="*60)
        print(f"Logo Description: {guidelines.logoDescription[:80]}...")
        print(f"Logo Style: {guidelines.logoStyle}")
        print(f"Colors: {guidelines.colors.primary}, {guidelines.colors.secondary}")
        print(f"Personality: {', '.join(guidelines.personality[:3])}")
        print(f"Fonts: {guidelines.fonts.heading}, {guidelines.fonts.body}")
        print("="*60 + "\n")
        
        return guidelines
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
        return get_fallback_guidelines(brand_name, industry)
