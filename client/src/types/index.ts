/* ---------- Shared Types ---------- */

export interface Suspect {
  id: string;
  name: string;
  description: string;
  motive: string;
  alibi: string;
}

export interface ClueSummary {
  id: string;
  title: string;
  location: string;
  discovered: boolean;
  content?: string;
  relevance?: string;
}

export interface CaseProgress {
  discoveredClueCount: number;
  totalClues: number;
  hintsUsed: number;
  hintsAvailable: number;
}

export interface CasePublic {
  id: string;
  title: string;
  story: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'completed' | 'generation_failed';
  suspects: Suspect[];
  clueSummaries: ClueSummary[];
  progress: CaseProgress;
  createdAt: string;
}

export interface ScoreBreakdown {
  basePoints: number;
  cluePoints: number;
  hintPenalty: number;
  total: number;
}

export interface AccusationResult {
  isCorrect: boolean;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  completedAt: string;
}

export interface CaseResult {
  isCorrect: boolean;
  accusedSuspectId: string;
  culprit: Suspect | null;
  explanation: string;
  keyClueIds: string[];
  score: number;
  scoreBreakdown: ScoreBreakdown;
  completedAt: string;
}

export interface DiscoveredClue {
  id: string;
  title: string;
  content: string;
  location: string;
}

export interface HintResponse {
  hint: { id: string; content: string };
  progress: { hintsUsed: number; hintsAvailable: number };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
