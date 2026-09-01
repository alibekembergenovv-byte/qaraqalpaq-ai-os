import { getGeminiModel } from "../gemini";

export interface GeneratedContent {
  format: string;
  title: string;
  body: string; // The generated Qaraqalpaq text
}

export async function runQaraqalpaqWriter(
  title: string,
  summary: string,
  format: string, // determined by strategist
  terminologyRules: string, // Pulled from DB
  brandVoice: string // Pulled from DB settings
): Promise<GeneratedContent | null> {
  try {
    const model = getGeminiModel("gemini-2.5-pro"); // Pro is better for complex translation and creative writing

    const prompt = `
You are the "Qaraqalpaq AI Writer" (Agent 4) for Qaraqalpaq AI Content OS.
Your job is to transform the provided AI/Tech news into natural, modern, and engaging Qaraqalpaq language, without doing a literal word-by-word translation.

Brand Voice:
${brandVoice}

Terminology Rules & Preferences:
${terminologyRules}

News Title: "${title}"
News Summary: "${summary}"
Content Format: "${format}"

Requirements:
- Target audience: entrepreneurs, students, IT specialists, creators.
- Use Qaraqalpaq Latin alphabet.
- Keep technical terms in English when appropriate but explain them briefly in Qaraqalpaq if needed.
- Post Structure (adjust based on format): HOOK, WHAT HAPPENED, WHAT DOES IT MEAN, WHY SHOULD YOU CARE, HOW CAN YOU USE IT, CTA.
- Do not overuse emojis (max 3-5).
- Use short paragraphs and bullet points for readability.

Return ONLY a JSON object exactly matching this schema:
{
  "format": "${format}",
  "title": "Qaraqalpaq translated/adapted title",
  "body": "The full Telegram post content in Qaraqalpaq (Markdown supported)"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as GeneratedContent;
    }
    
    return null;
  } catch (error) {
    console.error("Agent 4 (Qaraqalpaq Writer) failed:", error);
    return null;
  }
}
