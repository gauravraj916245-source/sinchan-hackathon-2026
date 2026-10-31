import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // AI Studio requires the dev server to run strictly on port 3000
  port: process.env.NODE_ENV === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: 'gemini-3.8-flash',
  userAgent: 'aistudio-build',
  isProduction: process.env.NODE_ENV === 'production',
};
