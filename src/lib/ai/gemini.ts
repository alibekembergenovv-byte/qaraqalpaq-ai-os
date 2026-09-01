import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI SDK
// The API key is stored in environment variables securely
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = (modelName: string = "gemini-2.5-pro") => {
  return genAI.getGenerativeModel({ model: modelName });
};
