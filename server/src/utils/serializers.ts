import { ICase } from '../models/Case.js';

/** Public case DTO — never includes solution, culpritId, or clue content for undiscovered clues */
export function serializeCasePublic(caseDoc: ICase) {
  return {
    id: caseDoc._id.toString(),
    title: caseDoc.title,
    story: caseDoc.story,
    difficulty: caseDoc.difficulty,
    status: caseDoc.status,
    suspects: caseDoc.suspects.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      motive: s.motive,
      alibi: s.alibi,
    })),
    clueSummaries: caseDoc.clues.map((c) => {
      const discovered = caseDoc.progress.discoveredClueIds.includes(c.id);
      return {
        id: c.id,
        title: c.title,
        location: c.location,
        discovered,
        ...(discovered ? { content: c.content, relevance: c.relevance } : {}),
      };
    }),
    progress: {
      discoveredClueCount: caseDoc.progress.discoveredClueIds.length,
      totalClues: caseDoc.clues.length,
      hintsUsed: caseDoc.progress.hintsUsed,
      hintsAvailable: caseDoc.hints.length - caseDoc.progress.hintsUsed,
    },
    createdAt: caseDoc.createdAt,
  };
}

/** Result DTO — only revealed after case is completed */
export function serializeCaseResult(caseDoc: ICase) {
  if (caseDoc.status !== 'completed' || !caseDoc.result || !caseDoc.accusation) {
    return null;
  }
  const culprit = caseDoc.suspects.find((s) => s.id === caseDoc.solution.culpritId);
  return {
    isCorrect: caseDoc.result.isCorrect,
    accusedSuspectId: caseDoc.accusation.suspectId,
    culprit: culprit
      ? {
          id: culprit.id,
          name: culprit.name,
          description: culprit.description,
          motive: culprit.motive,
          alibi: culprit.alibi,
        }
      : null,
    explanation: caseDoc.solution.explanation,
    keyClueIds: caseDoc.solution.keyClueIds,
    score: caseDoc.result.score,
    scoreBreakdown: caseDoc.result.scoreBreakdown,
    completedAt: caseDoc.completedAt,
  };
}
