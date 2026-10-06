import problemsData from '../data/problems.json';
import { ProblemMetadata } from '../types';

export function getAllProblems(): ProblemMetadata[] {
  return problemsData as ProblemMetadata[];
}

export function getProblemById(id: string): ProblemMetadata | undefined {
  const normId = id.toUpperCase().trim();
  return (problemsData as ProblemMetadata[]).find(
    p => p.id.toUpperCase() === normId || `${p.contestId}${p.index}`.toUpperCase() === normId
  );
}

export async function fetchLiveCFProblemset(): Promise<any[]> {
  try {
    const res = await fetch('https://codeforces.com/api/problemset.problems', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('CF API HTTP ' + res.status);
    const data = await res.json();
    if (data.status === 'OK') {
      return data.result.problems;
    }
  } catch (err) {
    console.warn('Could not fetch live Codeforces API, falling back to local dataset:', err);
  }
  return [];
}
