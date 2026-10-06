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
 * Runs C++ code through the backend compiler & execution sandbox (/api/run-cpp).
 */
export async function runCppTestCases(
  userCode: string,
  testCases: TestCase[]
): Promise<ExecutionSummary> {
  try {
    const res = await fetch('/api/run-cpp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: userCode, testCases }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server runner returned status ${res.status}`);
    }

    return (await res.json()) as ExecutionSummary;
  } catch (err: any) {
    console.error('C++ execution error:', err);
    return {
      allPassed: false,
      passedCount: 0,
      totalCount: testCases.length,
      totalTimeMs: 0,
      compilationError: err.message || 'Failed to connect to C++ runner',
      results: testCases.map(tc => ({
        testCaseId: tc.id,
        title: tc.title,
        passed: false,
        actualOutput: `Error executing C++ program: ${err.message || String(err)}`,
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

/**
 * Safely runs JavaScript in the browser sandbox.
 */
export async function runJsTestCases(
  userCode: string,
  testCases: TestCase[]
): Promise<ExecutionSummary> {
  const results: TestResult[] = [];
  const allLogs: string[] = [];
  let passedCount = 0;
  const startTimeTotal = performance.now();

  for (const tc of testCases) {
    const logs: string[] = [];
    let actualOutput = '';
    let error: string | undefined;
    const testStartTime = performance.now();

    try {
      const customConsole = {
        log: (...args: any[]) => {
          const str = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
          logs.push(str);
          allLogs.push(`[Test ${tc.id}] ${str}`);
        },
        warn: (...args: any[]) => {
          const str = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
          logs.push(`[WARN] ${str}`);
          allLogs.push(`[Test ${tc.id} WARN] ${str}`);
        },
        error: (...args: any[]) => {
          const str = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
          logs.push(`[ERROR] ${str}`);
          allLogs.push(`[Test ${tc.id} ERROR] ${str}`);
        }
      };

      const runnerPromise = new Promise<{ output: string }>((resolve, reject) => {
        try {
          const wrappedCode = `
            ${userCode}

            if (typeof solve === 'function') {
              return solve(__input__);
            } else {
              throw new Error("No function named 'solve' was found. Please define 'function solve(input) { ... }'");
            }
          `;

          const runnerFn = new Function('__input__', 'console', wrappedCode);
          const rawResult = runnerFn(tc.input, customConsole);

          if (rawResult !== undefined && rawResult !== null) {
            resolve({ output: String(rawResult) });
          } else if (logs.length > 0) {
            resolve({ output: logs.join('\n') });
          } else {
            resolve({ output: '' });
          }
        } catch (err: any) {
          reject(err);
        }
      });

      const timeoutPromise = new Promise<{ output: string }>((_, reject) => {
        setTimeout(() => reject(new Error('Time Limit Exceeded (> 2500ms). Check for infinite loops!')), 2500);
      });

      const outcome = await Promise.race([runnerPromise, timeoutPromise]);
      actualOutput = outcome.output;
    } catch (err: any) {
      error = err.message || String(err);
      actualOutput = `Error: ${error}`;
    }

    const testEndTime = performance.now();
    const executionTimeMs = Math.round((testEndTime - testStartTime) * 100) / 100;

    const normActual = normalizeOutput(actualOutput);
    const normExpected = normalizeOutput(tc.expectedOutput);
    const passed = !error && normActual === normExpected;

    if (passed) passedCount++;

    results.push({
      testCaseId: tc.id,
      title: tc.title,
      passed,
      actualOutput,
      expectedOutput: tc.expectedOutput,
      input: tc.input,
      executionTimeMs,
      logs,
      error,
    });
  }

  const totalTimeMs = Math.round((performance.now() - startTimeTotal) * 100) / 100;

  return {
    allPassed: passedCount === testCases.length,
    passedCount,
    totalCount: testCases.length,
    totalTimeMs,
    results,
    capturedLogs: allLogs,
  };
}

/**
 * Universal runner dispatching to C++ (default) or JavaScript.
 */
export async function runTestCases(
  userCode: string,
  testCases: TestCase[],
  language: string = 'cpp'
): Promise<ExecutionSummary> {
  const normLang = language.toLowerCase();
  if (normLang.includes('js') || normLang.includes('javascript')) {
    return runJsTestCases(userCode, testCases);
  }
  // Default to C++
  return runCppTestCases(userCode, testCases);
}
