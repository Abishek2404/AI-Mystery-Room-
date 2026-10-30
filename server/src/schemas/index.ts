import { z } from 'zod';

export const SuspectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  motive: z.string().min(1).max(500),
  alibi: z.string().min(1).max(500),
});

export const ClueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(1000),
  location: z.string().min(1).max(200),
  relevance: z.string().min(1).max(500),
});

export const HintSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1).max(500),
});

export const SolutionSchema = z.object({
  culpritId: z.string().min(1),
  explanation: z.string().min(1).max(2000),
  keyClueIds: z.array(z.string()).min(1),
});

export const GeneratedMysterySchema = z.object({
  title: z.string().min(1).max(200),
  story: z.string().min(1).max(3000),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  suspects: z.array(SuspectSchema),
  clues: z.array(ClueSchema),
  hints: z.array(HintSchema),
  solution: SolutionSchema,
});

export type GeneratedMystery = z.infer<typeof GeneratedMysterySchema>;
export type Suspect = z.infer<typeof SuspectSchema>;
export type Clue = z.infer<typeof ClueSchema>;
export type Hint = z.infer<typeof HintSchema>;
export type Solution = z.infer<typeof SolutionSchema>;

export const CreateCaseRequestSchema = z.object({
  premise: z
    .string()
    .min(20, 'Premise must be at least 20 characters')
    .max(500, 'Premise must be at most 500 characters')
    .transform((s) => s.trim()),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Difficulty must be easy, medium, or hard' }),
  }),
});

export const AccuseRequestSchema = z.object({
  suspectId: z.string().min(1, 'Suspect ID is required'),
});
