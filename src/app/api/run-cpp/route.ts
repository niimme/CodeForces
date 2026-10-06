import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { execFile, spawn } from 'child_process';
import { TestCase } from '@/types';
import { normalizeOutput, TestResult, ExecutionSummary } from '@/lib/codeRunner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let tempDir: string | null = null;
  const startTimeTotal = performance.now();

  try {
    const body = await req.json();
    const { code, testCases } = body as { code: string; testCases: TestCase[] };

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing code' }, { status: 400 });
    }
    if (!testCases || !Array.isArray(testCases)) {
      return NextResponse.json({ error: 'Invalid or missing test cases' }, { status: 400 });
    }

    // 1. Create unique temporary sandbox directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cf-cpp-'));
    const srcFile = path.join(tempDir, 'solution.cpp');
    const binFile = path.join(tempDir, 'solution');

    await fs.writeFile(srcFile, code, 'utf8');

    // 2. Compile with clang++ (C++20, -O2)
    const compileResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
      execFile(
        '/usr/bin/clang++',
        ['-std=c++20', '-O2', '-pipe', srcFile, '-o', binFile],
        { timeout: 9000 },
        (err, _stdout, stderr) => {
          if (err) {
            // Clean up paths from compiler output to keep line numbers readable
            const cleanErr = (stderr || err.message).replace(new RegExp(tempDir + '/', 'g'), '');
            return resolve({ ok: false, error: cleanErr });
          }
          resolve({ ok: true });
        }
      );
    });

    if (!compileResult.ok) {
      const compilationError = compileResult.error || 'Compilation failed';
      const results: TestResult[] = testCases.map((tc) => ({
        testCaseId: tc.id,
        title: tc.title,
        passed: false,
        actualOutput: `[COMPILATION ERROR]\n${compilationError}`,
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        executionTimeMs: 0,
        logs: [compilationError],
        error: 'Compilation Error',
      }));

      const summary: ExecutionSummary = {
        allPassed: false,
        passedCount: 0,
        totalCount: testCases.length,
        totalTimeMs: Math.round((performance.now() - startTimeTotal) * 100) / 100,
        results,
        capturedLogs: [`[COMPILATION ERROR]\n${compilationError}`],
      };

      return NextResponse.json(summary);
    }

    // 3. Execute compiled binary against each testcase
    const results: TestResult[] = [];
    const allLogs: string[] = [];
    let passedCount = 0;

    for (const tc of testCases) {
      const testStartTime = performance.now();
      let actualOutput = '';
      let testLogs: string[] = [];
      let error: string | undefined;

      const runOutcome = await new Promise<{
        stdout: string;
        stderr: string;
        code: number | null;
        signal: NodeJS.Signals | null;
        timedOut: boolean;
      }>((resolve) => {
        const child = spawn(binFile, [], { cwd: tempDir as string });
        let stdout = '';
        let stderr = '';
        let timedOut = false;

        const timer = setTimeout(() => {
          timedOut = true;
          try {
            child.kill('SIGKILL');
          } catch (e) {
            // ignore
          }
        }, 2500);

        child.stdout.on('data', (d) => {
          stdout += d.toString();
        });

        child.stderr.on('data', (d) => {
          stderr += d.toString();
        });

        child.on('error', (err) => {
          clearTimeout(timer);
          resolve({ stdout, stderr: stderr + '\n' + err.message, code: 1, signal: null, timedOut: false });
        });

        child.on('close', (code, signal) => {
          clearTimeout(timer);
          resolve({ stdout, stderr, code, signal, timedOut });
        });

        // Send test input to stdin
        if (tc.input !== undefined && tc.input !== null) {
          child.stdin.write(tc.input.endsWith('\n') ? tc.input : tc.input + '\n');
        }
        child.stdin.end();
      });

      const testEndTime = performance.now();
      const executionTimeMs = Math.round((testEndTime - testStartTime) * 100) / 100;

      if (runOutcome.stderr.trim()) {
        const logLines = runOutcome.stderr.trim().split('\n');
        testLogs = logLines;
        for (const line of logLines) {
          allLogs.push(`[Test ${tc.id}] ${line}`);
        }
      }

      if (runOutcome.timedOut) {
        error = 'Time Limit Exceeded (> 2500ms). Check for infinite loops!';
        actualOutput = error;
      } else if (runOutcome.signal) {
        error = `Runtime Error: Process terminated by signal ${runOutcome.signal}`;
        actualOutput = error;
      } else if (runOutcome.code !== 0 && runOutcome.code !== null) {
        error = `Runtime Error: Exited with code ${runOutcome.code}`;
        actualOutput = error;
      } else {
        actualOutput = runOutcome.stdout;
      }

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
        logs: testLogs,
        error,
      });
    }

    const totalTimeMs = Math.round((performance.now() - startTimeTotal) * 100) / 100;

    const summary: ExecutionSummary = {
      allPassed: passedCount === testCases.length,
      passedCount,
      totalCount: testCases.length,
      totalTimeMs,
      results,
      capturedLogs: allLogs,
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    console.error('API /api/run-cpp error:', err);
    return NextResponse.json(
      {
        allPassed: false,
        passedCount: 0,
        totalCount: 0,
        totalTimeMs: 0,
        results: [],
        capturedLogs: [err.message || String(err)],
        error: err.message || 'Execution error',
      },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {
        // ignore cleanup error
      }
    }
  }
}
