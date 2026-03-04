import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    return new GoogleGenAI({ apiKey });
}

export function getGeminiModel(): string {
    return process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
}
