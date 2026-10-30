import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'change_me_in_production',
};

export const DIFFICULTY_CONFIG = {
  easy: { suspects: 3, clues: 5, hints: 2, basePoints: 100 },
  medium: { suspects: 4, clues: 7, hints: 3, basePoints: 150 },
  hard: { suspects: 5, clues: 9, hints: 3, basePoints: 200 },
} as const;

export type Difficulty = keyof typeof DIFFICULTY_CONFIG;
