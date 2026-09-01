import { getGeminiModel } from "../gemini";

const contentFormats = [
  "BREAKING AI NEWS",
  "AI NEWS EXPLAINED",
  "NEW AI TOOL",
  "HOW TO USE",
  "AI FOR BUSINESS",
  "AI FOR CONTENT CREATORS",
  "AI FOR STUDENTS",
  "AI TIP",
  "PROMPT OF THE DAY",
  "AI CASE STUDY",
  "AI VS HUMAN",
  "AI MYTH",
  "AI TERMINOLOGY",
  "WEEKLY AI SUMMARY",
  "PERSONAL OPINION / ANALYSIS"
];

export async function runContentStrategist(
  title: string,
  summary: string
): Promise<string | null> {
  try {
    const model = getGeminiModel("gemini-2.5-flash");

    const prompt = `
You are the AI Content Strategist (Agent 5).
Analyze the following news and select the single BEST format for publishing on Telegram.

Available Formats:
${contentFormats.join("\n")}

News Title: "${title}"
News Summary: "${summary}"

Return ONLY a JSON object exactly matching this schema:
{
  "selectedFormat": "One of the available formats exactly as written",
  "reasoning": "Why this format is best"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.selectedFormat;
    }
    
    return null;
  } catch (error) {
    console.error("Agent 5 (Strategist) failed:", error);
    return null;
  }
}
