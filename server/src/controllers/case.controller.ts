import { Request, Response, NextFunction } from 'express';
import { Case } from '../models/Case.js';
import { CreateCaseRequestSchema, AccuseRequestSchema } from '../schemas/index.js';
import { generateMystery } from '../services/case-generator.service.js';
import { calculateScore } from '../services/scoring.service.js';
import { serializeCasePublic, serializeCaseResult } from '../utils/serializers.js';
import { getSessionToken } from '../middleware/session.js';
import { ApiError } from '../middleware/errorHandler.js';
import { DIFFICULTY_CONFIG, Difficulty } from '../config/index.js';
import mongoose from 'mongoose';

/** POST /api/cases — Generate and save a new mystery */
export async function createCase(req: Request, res: Response, next: NextFunction) {
  try {
    const { premise, difficulty } = CreateCaseRequestSchema.parse(req.body);
    const sessionToken = getSessionToken(req);

    const mystery = await generateMystery(premise, difficulty as Difficulty);

    const newCase = await Case.create({
      title: mystery.title,
      premise,
      story: mystery.story,
      difficulty: mystery.difficulty,
      status: 'active',
      sessionToken,
      suspects: mystery.suspects,
      clues: mystery.clues,
      hints: mystery.hints,
      solution: mystery.solution,
      progress: {
        discoveredClueIds: [],
        hintsUsed: 0,
        nextHintIndex: 0,
      },
    });

    return res.status(201).json({ case: serializeCasePublic(newCase) });
  } catch (err: any) {
    if (err.name === 'ZodError') return next(err);
    if (err.message?.includes('Schema validation') || err.message?.includes('Semantic validation')) {
      return next(new ApiError(502, 'AI_GENERATION_FAILED', 'Failed to generate a valid mystery. Please try again.'));
    }
    return next(err);
  }
}

/** GET /api/cases/:id — Retrieve current public case state */
export async function getCase(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'INVALID_CASE_ID', 'Invalid case ID format.');
    }

    const caseDoc = await Case.findById(id);
    if (!caseDoc) {
      throw new ApiError(404, 'CASE_NOT_FOUND', 'Case not found.');
    }

    const sessionToken = getSessionToken(req);
    if (caseDoc.sessionToken !== sessionToken) {
      throw new ApiError(403, 'CASE_ACCESS_DENIED', 'You do not have access to this case.');
    }

    return res.json({ case: serializeCasePublic(caseDoc) });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/cases/:id/clues/:clueId/discover — Discover a clue */
export async function discoverClue(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, clueId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'INVALID_CASE_ID', 'Invalid case ID format.');
    }

    const caseDoc = await Case.findById(id);
    if (!caseDoc) throw new ApiError(404, 'CASE_OR_CLUE_NOT_FOUND', 'Case not found.');

    const sessionToken = getSessionToken(req);
    if (caseDoc.sessionToken !== sessionToken) {
      throw new ApiError(403, 'CASE_ACCESS_DENIED', 'You do not have access to this case.');
    }

    if (caseDoc.status === 'completed') {
      throw new ApiError(409, 'CASE_COMPLETED', 'This case is already completed.');
    }

    const clue = caseDoc.clues.find((c) => c.id === clueId);
    if (!clue) throw new ApiError(404, 'CASE_OR_CLUE_NOT_FOUND', 'Clue not found in this case.');

    // Idempotent: if already discovered, return clue without awarding again
    const alreadyDiscovered = caseDoc.progress.discoveredClueIds.includes(clueId);
    if (!alreadyDiscovered) {
      caseDoc.progress.discoveredClueIds.push(clueId);
      await caseDoc.save();
    }

    return res.json({
      clue: {
        id: clue.id,
        title: clue.title,
        content: clue.content,
        location: clue.location,
      },
      progress: {
        discoveredClueCount: caseDoc.progress.discoveredClueIds.length,
        totalClues: caseDoc.clues.length,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/cases/:id/hints — Return the next available hint */
export async function requestHint(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'INVALID_CASE_ID', 'Invalid case ID format.');
    }

    const caseDoc = await Case.findById(id);
    if (!caseDoc) throw new ApiError(404, 'CASE_NOT_FOUND', 'Case not found.');

    const sessionToken = getSessionToken(req);
    if (caseDoc.sessionToken !== sessionToken) {
      throw new ApiError(403, 'CASE_ACCESS_DENIED', 'You do not have access to this case.');
    }

    if (caseDoc.status === 'completed') {
      throw new ApiError(409, 'CASE_COMPLETED', 'This case is already completed.');
    }

    const cfg = DIFFICULTY_CONFIG[caseDoc.difficulty as Difficulty];
    if (caseDoc.progress.hintsUsed >= cfg.hints) {
      throw new ApiError(409, 'NO_HINTS_REMAINING', 'No hints remaining for this case.');
    }

    const hintIndex = caseDoc.progress.nextHintIndex;
    const hint = caseDoc.hints[hintIndex];
    if (!hint) {
      throw new ApiError(409, 'NO_HINTS_REMAINING', 'No hints remaining for this case.');
    }

    // Atomically update to prevent concurrent duplicate hint delivery
    const updated = await Case.findOneAndUpdate(
      {
        _id: id,
        status: 'active',
        'progress.nextHintIndex': hintIndex,
      },
      {
        $inc: { 'progress.hintsUsed': 1, 'progress.nextHintIndex': 1 },
      },
      { new: true }
    );

    if (!updated) {
      // Race condition: another request beat us — re-read current state
      const refreshed = await Case.findById(id);
      return res.json({
        hint: { id: hint.id, content: hint.content },
        progress: {
          hintsUsed: refreshed?.progress.hintsUsed || caseDoc.progress.hintsUsed + 1,
          hintsAvailable: cfg.hints - (refreshed?.progress.hintsUsed || caseDoc.progress.hintsUsed + 1),
        },
      });
    }

    return res.json({
      hint: { id: hint.id, content: hint.content },
      progress: {
        hintsUsed: updated.progress.hintsUsed,
        hintsAvailable: cfg.hints - updated.progress.hintsUsed,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/cases/:id/accuse — Submit final accusation */
export async function accuse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'INVALID_CASE_ID', 'Invalid case ID format.');
    }

    const { suspectId } = AccuseRequestSchema.parse(req.body);
    const sessionToken = getSessionToken(req);

    // Use findOneAndUpdate with status: active to atomically transition
    const caseDoc = await Case.findOne({ _id: id, status: 'active' });
    if (!caseDoc) {
      // Check if it exists at all
      const existing = await Case.findById(id);
      if (!existing) throw new ApiError(404, 'CASE_NOT_FOUND', 'Case not found.');
      if (existing.sessionToken !== sessionToken) {
        throw new ApiError(403, 'CASE_ACCESS_DENIED', 'You do not have access to this case.');
      }
      if (existing.status === 'completed' && existing.result) {
        // Idempotent: return existing result
        return res.json({ result: { ...existing.result.toObject(), completedAt: existing.completedAt } });
      }
      throw new ApiError(409, 'CASE_ALREADY_COMPLETED', 'This case has already been completed.');
    }

    if (caseDoc.sessionToken !== sessionToken) {
      throw new ApiError(403, 'CASE_ACCESS_DENIED', 'You do not have access to this case.');
    }

    // Validate suspect belongs to case
    const suspectExists = caseDoc.suspects.some((s) => s.id === suspectId);
    if (!suspectExists) {
      throw new ApiError(400, 'INVALID_SUSPECT', 'The suspect ID does not belong to this case.');
    }

    // Evaluate
    const isCorrect = caseDoc.solution.culpritId === suspectId;
    const scoreBreakdown = calculateScore(
      caseDoc.difficulty as Difficulty,
      isCorrect,
      caseDoc.progress.discoveredClueIds.length,
      caseDoc.progress.hintsUsed
    );

    const now = new Date();

    // Atomic update
    const updated = await Case.findOneAndUpdate(
      { _id: id, status: 'active' },
      {
        $set: {
          status: 'completed',
          accusation: { suspectId, accusedAt: now },
          result: {
            isCorrect,
            score: scoreBreakdown.total,
            scoreBreakdown,
          },
          completedAt: now,
        },
      },
      { new: true }
    );

    if (!updated) {
      throw new ApiError(409, 'CASE_ALREADY_COMPLETED', 'This case has already been completed.');
    }

    return res.json({
      result: {
        isCorrect,
        score: scoreBreakdown.total,
        scoreBreakdown,
        completedAt: now,
      },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') return next(err);
    return next(err);
  }
}

/** GET /api/cases/:id/result — Get full result after completion */
export async function getResult(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'INVALID_CASE_ID', 'Invalid case ID format.');
    }

    const caseDoc = await Case.findById(id);
    if (!caseDoc) throw new ApiError(404, 'CASE_NOT_FOUND', 'Case not found.');

    const sessionToken = getSessionToken(req);
    if (caseDoc.sessionToken !== sessionToken) {
      throw new ApiError(403, 'CASE_ACCESS_DENIED', 'You do not have access to this case.');
    }

    if (caseDoc.status !== 'completed') {
      throw new ApiError(409, 'CASE_NOT_COMPLETED', 'This case has not been completed yet.');
    }

    const result = serializeCaseResult(caseDoc);
    if (!result) {
      throw new ApiError(500, 'INTERNAL_ERROR', 'Could not retrieve result.');
    }

    return res.json({ result });
  } catch (err) {
    return next(err);
  }
}
