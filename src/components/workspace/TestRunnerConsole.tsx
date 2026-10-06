'use client';

import React from 'react';
import { TestCase } from '../../types';
import { ExecutionSummary, TestResult } from '../../lib/codeRunner';

interface TestRunnerConsoleProps {
  testCases: TestCase[];
  selectedTestIndex: number;
  onSelectTest: (index: number) => void;
  onRunCode: () => void;
  isRunning: boolean;
  executionSummary: ExecutionSummary | null;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const TestRunnerConsole: React.FC<TestRunnerConsoleProps> = ({
  testCases,
  selectedTestIndex,
  onSelectTest,
  onRunCode,
  isRunning,
  executionSummary,
  isMaximized = false,
  onToggleMaximize,
  isMinimized = false,
  onToggleMinimize,
}) => {
  const currentTest = testCases[selectedTestIndex] || testCases[0];
  const currentResult: TestResult | undefined = executionSummary?.results?.[selectedTestIndex];
  const hasCompilationError = !!executionSummary?.compilationError;

  return (
    <div
      className={`test-runner-console ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      {/* Runner Header */}
      <div className="runner-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Test Cases:
          </span>

          <div className="dots-selector">
            {testCases.map((tc, idx) => {
              const res = executionSummary?.results?.[idx];
              let statusClass = '';
              let symbol = idx + 1;

              if (hasCompilationError) {
                statusClass = 'failed';
              } else if (res) {
                statusClass = res.passed ? 'passed' : 'failed';
              }

              return (
                <button
                  key={tc.id}
                  className={`test-dot ${statusClass} ${selectedTestIndex === idx ? 'selected' : ''}`}
                  onClick={() => onSelectTest(idx)}
                  title={`Test ${idx + 1}: ${tc.title}`}
                  id={`test-dot-${idx + 1}`}
                >
                  {hasCompilationError ? '!' : res ? (res.passed ? '✓' : '✕') : symbol}
                </button>
              );
            })}
          </div>

          {executionSummary && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: hasCompilationError
                  ? '#dc2626'
                  : executionSummary.allPassed
                  ? '#3fb950'
                  : '#f85149',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {hasCompilationError ? (
                <span>⚠️ Compilation Error</span>
              ) : executionSummary.allPassed ? (
                <>
                  <span>🎉 All {executionSummary.totalCount} Passed!</span>
                  <span style={{ color: '#8b949e', fontWeight: 400 }}>({executionSummary.totalTimeMs}ms)</span>
                </>
              ) : (
                <>
                  <span>{executionSummary.passedCount} / {executionSummary.totalCount} Passed</span>
                  <span style={{ color: '#8b949e', fontWeight: 400 }}>({executionSummary.totalTimeMs}ms)</span>
                </>
              )}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleMinimize && (
            <button
              className="console-window-btn"
              onClick={onToggleMinimize}
              title={isMinimized ? 'Expand Test Console' : 'Minimize Test Console'}
              id="btn-minimize-console"
            >
              <span>{isMinimized ? '▲ Expand' : '▼ Collapse'}</span>
            </button>
          )}

          {onToggleMaximize && (
            <button
              className="console-window-btn"
              onClick={onToggleMaximize}
              title={isMaximized ? 'Restore Console Height' : 'Maximize Console Height'}
              id="btn-maximize-console"
            >
              <span>{isMaximized ? '🗗 Restore' : '⛶ Maximize'}</span>
            </button>
          )}

          <button
            className="run-code-btn"
            onClick={onRunCode}
            disabled={isRunning}
            id="btn-run-code"
          >
            {isRunning ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                <span>Compiling & Running...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Runner Content showing Active Test Comparison or Compilation Error */}
      {!isMinimized && (
        <div className="runner-content" style={{ flex: 1, overflowY: 'auto' }}>
          {hasCompilationError && executionSummary?.compilationError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '14px',
              }}
            >
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '13px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span>
                <span>C++ Compilation Diagnostic</span>
              </div>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  color: '#991b1b',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.5,
                }}
              >
                {executionSummary.compilationError}
              </pre>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                Test {selectedTestIndex + 1}: {currentTest?.title}
              </span>
              {currentResult && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: currentResult.passed ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                    color: currentResult.passed ? '#2ea043' : '#dc2626',
                    border: `1px solid ${currentResult.passed ? '#2ea043' : '#f85149'}`,
                  }}
                >
                  {currentResult.passed ? 'PASSED' : 'FAILED'}
                </span>
              )}
            </div>

            {currentResult && (
              <span style={{ color: '#64748b', fontSize: '11.5px' }}>
                Time: {currentResult.executionTimeMs} ms
              </span>
            )}
          </div>

          {currentTest?.description && (
            <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
              {currentTest.description}
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <div className="test-box-title">Input (Standard Input / cin)</div>
            <div className="test-box" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{currentTest?.input}</pre>
            </div>
          </div>

          <div className="test-comparison-grid">
            <div className="test-box">
              <div className="test-box-title">Expected Output</div>
              <pre className="test-box-content" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {currentTest?.expectedOutput}
              </pre>
            </div>

            <div className="test-box">
              <div className="test-box-title">
                Your Output (Standard Output / cout) {currentResult?.passed ? '✓' : currentResult ? '✕' : '(Click Run Code)'}
              </div>
              <pre
                className={`test-box-content ${
                  currentResult?.passed
                    ? 'passed-text'
                    : currentResult
                    ? 'failed-text'
                    : ''
                }`}
                style={{ margin: 0, whiteSpace: 'pre-wrap' }}
              >
                {currentResult ? currentResult.actualOutput : '(Not run yet)'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
