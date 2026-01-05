// lib/langchain.ts
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// Initialize OpenAI model
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.2,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// ==========================================
// VALIDATION SCHEMAS (Structured Output)
// ==========================================

const ValidationIssueSchema = z.object({
  rule: z.string().describe("The compliance rule being checked"),
  status: z.enum(["pass", "fail", "warning"]).describe("Validation status"),
  message: z.string().describe("Explanation of the issue or success"),
  suggestion: z
    .string()
    .describe("Suggestion to fix (use empty string if not applicable)"),
});

const ValidationResponseSchema = z.object({
  passed: z.boolean().describe("Whether all rules passed"),
  issues: z.array(ValidationIssueSchema).describe("List of validation issues"),
});

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type ValidationResponse = z.infer<typeof ValidationResponseSchema>;

// ==========================================
// AUTO-FIX TYPES (Manual Parsing)
// ==========================================

export interface AutoFixChange {
  element: string;
  issue: string;
  fix: string;
  success: boolean;
}

export interface UnfixableIssue {
  rule: string;
  reason: string;
}

export interface AutoFixResponse {
  fixed: boolean;
  canvasData: any;
  changesMade: AutoFixChange[];
  unfixableIssues: UnfixableIssue[];
}

// ==========================================
// VALIDATION FUNCTION (Structured Output)
// ==========================================

export async function validateCanvasCompliance(
  complianceRules: string,
  canvasData: any,
  canvasScreenshot?: string
): Promise<ValidationResponse> {
  try {
    const modelWithStructure = model.withStructuredOutput(
      ValidationResponseSchema
    );

    const systemPrompt = `You are a design compliance validator. Analyze the canvas and check each compliance rule.

Rules for validation:
- status "pass" = rule is followed correctly
- status "fail" = rule is violated (critical issue)
- status "warning" = rule might be violated (minor issue)
- Be specific in messages
- ALWAYS provide a suggestion field (use empty string "" if no suggestion needed)`;

    const userPrompt = `Compliance Rules:
${complianceRules}

Canvas Data:
${JSON.stringify(canvasData, null, 2)}

${
  canvasScreenshot
    ? "Canvas Screenshot: [Image attached]"
    : "No screenshot provided"
}

Validate the canvas against these rules. For each issue, provide a suggestion (or empty string if not applicable).`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: canvasScreenshot
          ? [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: canvasScreenshot } },
            ]
          : userPrompt,
      },
    ];

    const result = await modelWithStructure.invoke(messages);
    return result as ValidationResponse;
  } catch (error) {
    console.error("LangChain validation error:", error);
    throw error;
  }
}

// ==========================================
// AUTO-FIX FUNCTION (Manual JSON Parsing)
// ==========================================

export async function autoFixCanvasCompliance(
  complianceRules: string,
  canvasData: any,
  canvasScreenshot?: string
): Promise<AutoFixResponse> {
  try {
    // ✅ Use regular model (no structured output for auto-fix)
    const systemPrompt = `You are a design auto-fix AI. Your job is to automatically fix canvas designs to comply with given rules.

CRITICAL INSTRUCTIONS:
1. Analyze the compliance rules and current canvas data
2. Fix EVERY issue that is technically possible to fix
3. For issues you CAN'T fix (like "add logo" when no logo exists), add to unfixableIssues
4. Return the COMPLETE corrected canvas JSON in Fabric.js format
5. Preserve all elements that don't need changes
6. Be precise with measurements (px, colors, positions)

Canvas JSON Structure (Fabric.js):
{
  "version": "string",
  "objects": [
    {
      "type": "text" | "textbox" | "rect" | "circle" | "image",
      "left": number,
      "top": number,
      "width": number,
      "height": number,
      "fill": string,
      "fontSize": number (for text),
      "text": string (for text),
      ...other properties
    }
  ],
  "background": "color string",
  "width": number,
  "height": number
}

What you CAN fix:
✅ Resize text (fontSize)
✅ Move elements (left, top)
✅ Change colors (fill, stroke, background)
✅ Adjust spacing/margins
✅ Modify dimensions
✅ Change text content
✅ Adjust opacity, borders, shadows

What you CANNOT fix:
❌ Add new images/logos
❌ Generate new content from scratch
❌ Add elements requiring external assets

RESPONSE FORMAT (MUST BE VALID JSON ONLY):
{
  "fixed": boolean,
  "canvasData": {
    "version": "string",
    "objects": [...],
    "background": "string",
    "width": number,
    "height": number
  },
  "changesMade": [
    {
      "element": "string",
      "issue": "string",
      "fix": "string",
      "success": boolean
    }
  ],
  "unfixableIssues": [
    {
      "rule": "string",
      "reason": "string"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.`;

    const userPrompt = `Compliance Rules:
${complianceRules}

Current Canvas Data:
${JSON.stringify(canvasData, null, 2)}

${
  canvasScreenshot
    ? "Canvas Screenshot: [Image attached]"
    : "No screenshot provided"
}

Fix all possible compliance issues and return the corrected canvas in the JSON format specified.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: canvasScreenshot
          ? [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: canvasScreenshot } },
            ]
          : userPrompt,
      },
    ];

    console.log("🔧 Calling LLM for auto-fix...");

    // Call model without structured output
    const response = await model.invoke(messages);

    // Parse response manually
    let result: AutoFixResponse;
    try {
      let cleanedResponse = response.content.toString().trim();

      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, "");
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
      cleanedResponse = cleanedResponse.trim();

      result = JSON.parse(cleanedResponse);

      // Validate response structure
      if (typeof result.fixed !== "boolean" || !result.canvasData) {
        throw new Error("Invalid response structure");
      }
    } catch (parseError) {
      console.error("Failed to parse LLM response:", response.content);
      throw new Error(`Invalid JSON response from LLM: ${parseError}`);
    }

    console.log("✅ Auto-fix complete:", {
      fixed: result.fixed,
      changesCount: result.changesMade?.length || 0,
      unfixableCount: result.unfixableIssues?.length || 0,
    });

    return result;
  } catch (error) {
    console.error("LangChain auto-fix error:", error);
    throw error;
  }
}

export async function testLangChain(): Promise<string> {
  try {
    const response = await model.invoke([
      { role: "user", content: "Say 'LangChain is working!'" },
    ]);
    return response.content.toString();
  } catch (error) {
    throw new Error(`LangChain test failed: ${error}`);
  }
}
