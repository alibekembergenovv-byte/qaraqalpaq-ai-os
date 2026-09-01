import { getGeminiModel } from "../gemini";

export interface CuratorResult {
  relevanceScore: number;
  noveltyScore: number;
  usefulnessScore: number;
  qaraqalpaqAudienceScore: number;
  businessValueScore: number;
  viralPotentialScore: number;
  credibilityScore: number;
  totalScore: number;
  reasoning: string;
}

export async function runContentCurator(
  title: string,
  summary: string,
  sourceCredibility: number
): Promise<CuratorResult | null> {
  try {
    const model = getGeminiModel("gemini-2.5-flash");

    const prompt = `
You are the AI Content Curator for the "Qaraqalpaq AI Content OS" platform.
Your task is to analyze the following tech/AI news and score it out of 100 based on its relevance, novelty, usefulness, business value, viral potential, and appeal to a Qaraqalpaqstan audience (entrepreneurs, students, IT specialists).

News Title: "${title}"
News Summary: "${summary}"
Source Credibility (out of 100): ${sourceCredibility}

Evaluate and return ONLY a valid JSON object exactly matching this schema:
{
  "relevanceScore": number (0-100),
  "noveltyScore": number (0-100),
  "usefulnessScore": number (0-100),
  "qaraqalpaqAudienceScore": number (0-100),
  "businessValueScore": number (0-100),
  "viralPotentialScore": number (0-100),
  "credibilityScore": number (0-100),
  "totalScore": number (0-100, calculate the weighted average based on your metrics),
  "reasoning": "string explaining why this news is good or bad for the target audience"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON block in case model wrapped it in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as CuratorResult;
    }
    
    return null;
  } catch (error) {
    console.error("Agent 2 (Curator) failed:", error);
    return null;
  }
}
