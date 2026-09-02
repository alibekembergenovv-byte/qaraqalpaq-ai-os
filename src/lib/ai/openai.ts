import OpenAI from "openai";

// Klient soraw kelgende ǵana jaratıladı.
// Búrın ol fayl júklengende jaratılatuǵın hám gilt joq bolsa build qulaytuǵın edi.
export function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
}
