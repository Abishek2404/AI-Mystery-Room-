import axios from 'axios';
import type {
  CasePublic,
  DiscoveredClue,
  HintResponse,
  AccusationResult,
  CaseResult,
} from '../types/index';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export async function createCase(premise: string, difficulty: string): Promise<CasePublic> {
  const res = await api.post('/cases', { premise, difficulty });
  return res.data.case;
}

export async function getCase(id: string): Promise<CasePublic> {
  const res = await api.get(`/cases/${id}`);
  return res.data.case;
}

export async function discoverClue(
  caseId: string,
  clueId: string
): Promise<{ clue: DiscoveredClue; progress: { discoveredClueCount: number; totalClues: number } }> {
  const res = await api.post(`/cases/${caseId}/clues/${clueId}/discover`, {});
  return res.data;
}

export async function requestHint(caseId: string): Promise<HintResponse> {
  const res = await api.post(`/cases/${caseId}/hints`, {});
  return res.data;
}

export async function accuse(caseId: string, suspectId: string): Promise<AccusationResult> {
  const res = await api.post(`/cases/${caseId}/accuse`, { suspectId });
  return res.data.result;
}

export async function getCaseResult(caseId: string): Promise<CaseResult> {
  const res = await api.get(`/cases/${caseId}/result`);
  return res.data.result;
}
