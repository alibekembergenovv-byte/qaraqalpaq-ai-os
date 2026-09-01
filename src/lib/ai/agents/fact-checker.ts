import { getGeminiModel } from "../gemini";

export interface FactCheckResult {
  status: "PASS" | "WARNING" | "FAIL";
  confidenceScore: number;
  details: string;
}

export async function runFactChecker(
  title: string,
  summary: string
): Promise<FactCheckResult | null> {
  try {
    const model = getGeminiModel("gemini-2.5-flash"); // Flash is fast enough for fact-checking known facts usually

    const prompt = `
You are the AI Fact Checker for the "Qaraqalpaq AI Content OS".
Analyze the following news for potential fake news, unsupported claims, exaggerated headlines, or incorrect model/company names.

News Title: "${title}"
News Summary: "${summary}"

Return ONLY a JSON object exactly matching this schema:
{
  "status": "PASS" | "WARNING" | "FAIL",
  "confidenceScore": number (0-100),
  "details": "Explanation of any warnings or failures, or why it passes."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as FactCheckResult;
    }
    
    return null;
  } catch (error) {
    console.error("Agent 3 (Fact Checker) failed:", error);
    return null;
  }
}
