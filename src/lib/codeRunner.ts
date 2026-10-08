import { TestCase } from '../types';

export interface TestResult {
  testCaseId: number;
  title: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  input: string;
  executionTimeMs: number;
  logs: string[];
  error?: string;
}

export interface ExecutionSummary {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  totalTimeMs: number;
  results: TestResult[];
  capturedLogs: string[];
  compilationError?: string;
}

/**
 * Normalizes text output for fair comparison:
 * Handles Windows \r\n vs Unix \n, removes trailing line spaces, trims leading/trailing blanks.
 */
export function normalizeOutput(output: string): string {
  if (typeof output !== 'string') {
    output = String(output ?? '');
  }
  return output
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Runs code through the backend compilation & execution sandbox (/api/run-code).
 * Supports C++, C, Java, Kotlin, and Python.
 */
export async function runBackendTestCases(
  userCode: string,
  testCases: TestCase[],
  language: string = 'cpp'
): Promise<ExecutionSummary> {
  try {
    const res = await fetch('/api/run-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: userCode, testCases, language }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server runner returned status ${res.status}`);
    }

    return (await res.json()) as ExecutionSummary;
  } catch (err: any) {
    console.error(`${language} execution error:`, err);
    return {
      allPassed: false,
      passedCount: 0,
      totalCount: testCases.length,
      totalTimeMs: 0,
      compilationError: err.message || `Failed to connect to ${language} runner`,
      results: testCases.map(tc => ({
        testCaseId: tc.id,
        title: tc.title,
        passed: false,
        actualOutput: `Error executing ${language.toUpperCase()} program: ${err.message || String(err)}`,
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        executionTimeMs: 0,
        logs: [],
        error: err.message || 'Network / runner error',
      })),
      capturedLogs: [`[Runner Error] ${err.message || String(err)}`],
    };
  }
}

// Backward-compatibility aliases
export const runCppTestCases = (userCode: string, testCases: TestCase[]) =>
  runBackendTestCases(userCode, testCases, 'cpp');

export const runJavaTestCases = (userCode: string, testCases: TestCase[]) =>
  runBackendTestCases(userCode, testCases, 'java');

/**
 * Universal runner dispatching C++, C, Java, Kotlin, and Python.
 */
export async function runTestCases(
  userCode: string,
  testCases: TestCase[],
  language: string = 'cpp'
): Promise<ExecutionSummary> {
  const normLang = language.toLowerCase();
  return runBackendTestCases(userCode, testCases, normLang);
}

