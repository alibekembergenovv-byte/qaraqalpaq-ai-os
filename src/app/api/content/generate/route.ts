import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/ai/openai";

export async function POST(req: Request) {
  try {
    const { newsItemId } = await req.json();

    const news = await prisma.newsItem.findUnique({
      where: { id: newsItemId }
    });

    if (!news) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prompt = `You are an expert Qaraqalpaq Prompt Engineer and AI Creator running a niche Telegram channel.
Your audience consists of AI creators, prompt engineers, and people deeply interested in Artificial Intelligence.
Translate and adapt the following English content into a highly engaging, professional Qaraqalpaq Telegram post.

CRITICAL INSTRUCTION: Your response MUST be under 800 characters long! Telegram captions have strict limits.

Focus heavily on practical AI usage, prompting techniques, or creator tools. Discard generic tech/crypto jargon.
Tone: Innovative, practical, inspiring.
Use modern internet terminology but avoid excessive Russian loanwords (use Qaraqalpaq where natural).
Format: Use markdown (bold, bullet points, emojis).
Add a clear Call-to-Action at the end.

Title: ${news.title}
Summary: ${news.summary}
Source URL: ${news.url}`;

    let text = "";
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a specialized Qaraqalpaq AI and Prompt Engineering expert. Keep outputs under 800 characters." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });
      text = response.choices[0].message.content || "";
    } catch (apiError) {
      console.error("OpenAI API Error:", apiError);
      text = `🤖 **${news.title}**\n\nBul avtomatlastırılǵan (fallback) tekst, sebebi OpenAI API-de tóseneqeleslik júz berdi.\n\n[Tolıq oqıw](${news.url})`;
    }

    // Generate AI Image automatically using Pollinations (Free AI Image generator)
    const cleanTitle = news.title.replace(/[^a-zA-Z0-9 ]/g, " ");
    const imagePrompt = encodeURIComponent(`${cleanTitle}, prompt engineering, generative AI creator, high tech, futuristic, cyber, 8k resolution, photorealistic`);
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1024&height=1024&nologo=true`;

    const content = await prisma.content.create({
      data: {
        newsItem: { connect: { id: news.id } },
        title: news.title,
        body: text,
        imageUrl: imageUrl, 
        format: "NEWS",
        status: "NEEDS_REVIEW"
      }
    });

    await prisma.newsItem.update({
      where: { id: news.id },
      data: { status: "CURATED" }
    });

    return NextResponse.json({ success: true, contentId: content.id });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ success: false, error: "AI Generation failed" }, { status: 500 });
  }
}
