import { DIFFICULTY_CONFIG, Difficulty } from '../config/index.js';

export interface ScoreBreakdown {
  basePoints: number;
  cluePoints: number;
  hintPenalty: number;
  total: number;
}

export function calculateScore(
  difficulty: Difficulty,
  isCorrect: boolean,
  discoveredClueCount: number,
  hintsUsed: number
): ScoreBreakdown {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const basePoints = isCorrect ? cfg.basePoints : 0;
  const cluePoints = discoveredClueCount * 5;
  const hintPenalty = hintsUsed * 10;
  const total = Math.max(0, basePoints + cluePoints - hintPenalty);

  return { basePoints, cluePoints, hintPenalty, total };
}
