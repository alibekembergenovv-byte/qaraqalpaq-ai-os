import { getGeminiModel } from "../gemini";

export interface QualityScore {
  overallScore: number;
  accuracy: number;
  usefulness: number;
  originality: number;
  qaraqalpaqQuality: number;
  hookQuality: number;
  brandAlignment: number;
}

export async function runQualityScorer(
  originalTitle: string,
  originalSummary: string,
  generatedContent: string,
  brandVoice: string
): Promise<QualityScore | null> {
  try {
    const model = getGeminiModel("gemini-2.5-pro");

    const prompt = `
You are the AI Quality Scorer for the "Qaraqalpaq AI Content OS".
Evaluate the generated Qaraqalpaq Telegram post against the original news.

Original News Title: "${originalTitle}"
Original Summary: "${originalSummary}"
Brand Voice Goal: "${brandVoice}"

Generated Content:
"""
${generatedContent}
"""

Score the content from 0 to 100 on the following metrics:
1. Accuracy: Does it faithfully represent the original news without making false claims?
2. Usefulness: Is it practical and helpful for the target audience?
3. Originality: Does it add value, or is it a generic copy?
4. Qaraqalpaq Quality: Is the grammar correct, natural, and properly using the Latin alphabet?
5. Hook Quality: Does the first sentence grab attention?
6. Brand Alignment: Does it match the desired brand voice?

Then calculate the overall score using these weights:
Accuracy: 25%
Usefulness: 20%
Originality: 15%
Qaraqalpaq Quality: 20%
Hook Quality: 10%
Brand Alignment: 10%

Return ONLY a JSON object exactly matching this schema:
{
  "accuracy": number,
  "usefulness": number,
  "originality": number,
  "qaraqalpaqQuality": number,
  "hookQuality": number,
  "brandAlignment": number,
  "overallScore": number (calculated based on weights)
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as QualityScore;
    }
    
    return null;
  } catch (error) {
    console.error("Quality Scorer failed:", error);
    return null;
  }
}
