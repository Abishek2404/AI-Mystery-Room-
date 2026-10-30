import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  title: string;
  premise: string;
  story: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'completed' | 'generation_failed';
  sessionToken: string;
  suspects: Array<{
    id: string;
    name: string;
    description: string;
    motive: string;
    alibi: string;
  }>;
  clues: Array<{
    id: string;
    title: string;
    content: string;
    location: string;
    relevance: string;
  }>;
  hints: Array<{
    id: string;
    content: string;
  }>;
  solution: {
    culpritId: string;
    explanation: string;
    keyClueIds: string[];
  };
  progress: {
    discoveredClueIds: string[];
    hintsUsed: number;
    nextHintIndex: number;
  };
  accusation?: {
    suspectId: string;
    accusedAt: Date;
  };
  result?: {
    isCorrect: boolean;
    score: number;
    scoreBreakdown: {
      basePoints: number;
      cluePoints: number;
      hintPenalty: number;
      total: number;
    };
  };
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SuspectSubSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    motive: { type: String, required: true },
    alibi: { type: String, required: true },
  },
  { _id: false }
);

const ClueSubSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    location: { type: String, required: true },
    relevance: { type: String, required: true },
  },
  { _id: false }
);

const HintSubSchema = new Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const CaseSchema = new Schema<ICase>(
  {
    title: { type: String, required: true, maxlength: 200 },
    premise: { type: String, required: true, maxlength: 500 },
    story: { type: String, required: true, maxlength: 3000 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'generation_failed'],
      default: 'active',
    },
    sessionToken: { type: String, required: true, index: true },
    suspects: [SuspectSubSchema],
    clues: [ClueSubSchema],
    hints: [HintSubSchema],
    solution: {
      culpritId: { type: String, required: true },
      explanation: { type: String, required: true },
      keyClueIds: [{ type: String }],
    },
    progress: {
      discoveredClueIds: [{ type: String }],
      hintsUsed: { type: Number, default: 0 },
      nextHintIndex: { type: Number, default: 0 },
    },
    accusation: {
      suspectId: { type: String },
      accusedAt: { type: Date },
    },
    result: {
      isCorrect: { type: Boolean },
      score: { type: Number },
      scoreBreakdown: {
        basePoints: { type: Number },
        cluePoints: { type: Number },
        hintPenalty: { type: Number },
        total: { type: Number },
      },
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

CaseSchema.index({ status: 1, createdAt: -1 });
CaseSchema.index({ sessionToken: 1, status: 1 });

export const Case = mongoose.model<ICase>('Case', CaseSchema);
