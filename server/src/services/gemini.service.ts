import { GoogleGenAI } from '@google/genai';
import { config } from '../config/index.js';

let genAIInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAIInstance = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return genAIInstance;
}

export async function generateText(prompt: string): Promise<string> {
  const genai = getGenAI();
  const response = await genai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });
  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}
