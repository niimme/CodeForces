import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import { execFile, spawn } from 'child_process';
import { TestCase } from '@/types';
import { normalizeOutput, TestResult, ExecutionSummary } from '@/lib/codeRunner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function resolveBinary(candidates: string[]): string {
  for (const p of candidates) {
    if (p.startsWith('/') && fsSync.existsSync(p)) {
      return p;
    }
  }
  return candidates[candidates.length - 1];
}

export async function POST(req: NextRequest) {
  let tempDir: string | null = null;
  const startTimeTotal = performance.now();

  try {
    const body = await req.json();
    const { code, testCases, language = 'cpp' } = body as {
      code: string;
      testCases: TestCase[];
      language?: string;
    };

    if (code === undefined || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing code' }, { status: 400 });
    }
    if (!testCases || !Array.isArray(testCases)) {
      return NextResponse.json({ error: 'Invalid or missing test cases' }, { status: 400 });
    }

    const normLang = (language || 'cpp').toLowerCase();

    // 1. Create temporary sandbox directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `cf-${normLang}-`));

    let runCommand: string = '';
    let runArgs: string[] = [];

    // 2. Compilation / setup based on language
    if (normLang === 'c') {
      const srcFile = path.join(tempDir, 'solution.c');
      const binFile = path.join(tempDir, 'solution');
      await fs.writeFile(srcFile, code, 'utf8');

      const cCompiler = resolveBinary([
        '/usr/bin/clang',
        '/usr/local/bin/clang',
        '/opt/homebrew/bin/clang',
        '/usr/bin/gcc',
        'clang',
        'gcc',
      ]);

      const compileResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
        execFile(
          cCompiler,
          ['-O2', '-pipe', srcFile, '-o', binFile, '-lm'],
          { timeout: 10000 },
          (err, _stdout, stderr) => {
            if (err) {
              const cleanErr = (stderr || err.message).replace(new RegExp(tempDir + '/', 'g'), '');
              return resolve({ ok: false, error: cleanErr });
            }
            resolve({ ok: true });
          }
        );
      });

      if (!compileResult.ok) {
        return handleCompileError(compileResult.error || 'C compilation failed', testCases, startTimeTotal);
      }
      runCommand = binFile;
      runArgs = [];

    } else if (normLang === 'kotlin' || normLang === 'kt') {
      const srcFile = path.join(tempDir, 'Solution.kt');
      const jarFile = path.join(tempDir, 'solution.jar');
      await fs.writeFile(srcFile, code, 'utf8');

      const kotlincBin = resolveBinary([
        '/opt/homebrew/bin/kotlinc',
        '/usr/bin/kotlinc',
        '/opt/kotlinc/bin/kotlinc',
        '/usr/local/bin/kotlinc',
        'kotlinc',
      ]);

      const compileResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
        execFile(
          kotlincBin,
          [srcFile, '-include-runtime', '-d', jarFile],
          { timeout: 20000 },
          (err, _stdout, stderr) => {
            if (err) {
              const cleanErr = (stderr || err.message).replace(new RegExp(tempDir + '/', 'g'), '');
              return resolve({ ok: false, error: cleanErr });
            }
            resolve({ ok: true });
          }
        );
      });

      if (!compileResult.ok) {
        return handleCompileError(compileResult.error || 'Kotlin compilation failed', testCases, startTimeTotal);
      }

      const javaBin = resolveBinary([
        '/opt/homebrew/bin/java',
        '/usr/bin/java',
        '/usr/local/bin/java',
        'java',
      ]);

      runCommand = javaBin;
      runArgs = ['-jar', jarFile];

    } else if (normLang === 'python' || normLang === 'py') {
      const srcFile = path.join(tempDir, 'solution.py');
      await fs.writeFile(srcFile, code, 'utf8');

      const pyBin = resolveBinary([
        '/usr/bin/python3',
        '/Library/Frameworks/Python.framework/Versions/3.14/bin/python3',
        '/opt/homebrew/bin/python3',
        '/usr/local/bin/python3',
        'python3',
      ]);

      runCommand = pyBin;
      runArgs = [srcFile];

    } else if (normLang === 'java') {
      let className = 'Solution';
      const publicClassMatch = code.match(/public\s+(?:final\s+)?class\s+([A-Za-z0-9_$]+)/);
      if (publicClassMatch) {
        className = publicClassMatch[1];
      } else {
        const mainClassMatch = code.match(/class\s+([A-Za-z0-9_$]+)[\s\S]*?public\s+static\s+void\s+main/);
        if (mainClassMatch) {
          className = mainClassMatch[1];
        } else {
          const anyClassMatch = code.match(/class\s+([A-Za-z0-9_$]+)/);
          if (anyClassMatch) {
            className = anyClassMatch[1];
          }
        }
      }

      const srcFile = path.join(tempDir, `${className}.java`);
      await fs.writeFile(srcFile, code, 'utf8');

      const javacBin = resolveBinary([
        '/opt/homebrew/bin/javac',
        '/usr/bin/javac',
        '/usr/local/bin/javac',
        'javac',
      ]);

      const compileResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
        execFile(
          javacBin,
          ['-encoding', 'UTF-8', '-d', tempDir as string, srcFile],
          { timeout: 15000 },
          (err, _stdout, stderr) => {
            if (err) {
              const cleanErr = (stderr || err.message).replaceAll(tempDir + '/', '');
              return resolve({ ok: false, error: cleanErr });
            }
            resolve({ ok: true });
          }
        );
      });

      if (!compileResult.ok) {
        return handleCompileError(compileResult.error || 'Java compilation failed', testCases, startTimeTotal);
      }

      const javaBin = resolveBinary([
        '/opt/homebrew/bin/java',
        '/usr/bin/java',
        '/usr/local/bin/java',
        'java',
      ]);

      const pkgMatch = code.match(/^\s*package\s+([a-zA-Z0-9_.]+)\s*;/m);
      const targetClass = pkgMatch ? `${pkgMatch[1]}.${className}` : className;

      runCommand = javaBin;
      runArgs = ['-cp', tempDir, targetClass];

    } else {
      // Default: C++
      const srcFile = path.join(tempDir, 'solution.cpp');
      const binFile = path.join(tempDir, 'solution');
      await fs.writeFile(srcFile, code, 'utf8');

      const cppCompiler = resolveBinary([
        '/usr/bin/clang++',
        '/usr/local/bin/clang++',
        '/opt/homebrew/bin/clang++',
        '/usr/bin/g++',
        'clang++',
        'g++',
      ]);

      const compileResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
        execFile(
          cppCompiler,
          ['-std=c++20', '-O2', '-pipe', srcFile, '-o', binFile],
          { timeout: 10000 },
          (err, _stdout, stderr) => {
            if (err) {
              const cleanErr = (stderr || err.message).replace(new RegExp(tempDir + '/', 'g'), '');
              return resolve({ ok: false, error: cleanErr });
            }
            resolve({ ok: true });
          }
        );
      });

      if (!compileResult.ok) {
        return handleCompileError(compileResult.error || 'C++ compilation failed', testCases, startTimeTotal);
      }
      runCommand = binFile;
      runArgs = [];
    }

    // 3. Execute binary / interpreter against each test case
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
        const child = spawn(runCommand, runArgs, { cwd: tempDir as string });
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

        child.on('close', (exitCode, signal) => {
          clearTimeout(timer);
          resolve({ stdout, stderr, code: exitCode, signal, timedOut });
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
    console.error('API /api/run-code error:', err);
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

function handleCompileError(compilationError: string, testCases: TestCase[], startTimeTotal: number) {
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
