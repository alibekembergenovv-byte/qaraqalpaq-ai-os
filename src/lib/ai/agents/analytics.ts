import { getGeminiModel } from "../gemini";

export interface StrategyRecommendation {
  insightType: "TIMING" | "FORMAT" | "CATEGORY" | "HOOK" | "GENERAL";
  title: string;
  description: string;
  confidence: number;
}

export async function generateAiStrategyRecommendations(
  recentAnalyticsData: string // JSON string of recent performance
): Promise<StrategyRecommendation[] | null> {
  try {
    const model = getGeminiModel("gemini-2.5-pro");

    const prompt = `
You are the AI Strategy Analyst for the "Qaraqalpaq AI Content OS".
Analyze the following recent Telegram channel performance data and provide 3-5 actionable strategy recommendations to improve views, engagement, and subscriber growth.

Performance Data:
${recentAnalyticsData}

Return ONLY a JSON array of objects exactly matching this schema:
[
  {
    "insightType": "TIMING" | "FORMAT" | "CATEGORY" | "HOOK" | "GENERAL",
    "title": "Short catchy title of insight",
    "description": "Detailed explanation of what the data shows and what action the admin should take.",
    "confidence": number (0-100, how confident you are in this insight)
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as StrategyRecommendation[];
    }
    
    return null;
  } catch (error) {
    console.error("Agent Analyst failed:", error);
    return null;
  }
}
