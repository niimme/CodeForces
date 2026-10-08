'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  problemEmoji?: string;
  problemTitle?: string;
  onResetCode?: () => void;
  nextProblemId?: string | null;
}

export const TestRunnerConsole: React.FC<TestRunnerConsoleProps> = ({
  testCases = [],
  selectedTestIndex,
  onSelectTest,
  onRunCode,
  isRunning,
  executionSummary,
  isMaximized = false,
  onToggleMaximize,
  isMinimized = false,
  onToggleMinimize,
  problemEmoji = '🍉',
  problemTitle = 'Code Challenge',
  onResetCode,
  nextProblemId,
}) => {
  const currentTest = testCases[selectedTestIndex] || testCases[0];
  const currentResult: TestResult | undefined = executionSummary?.results?.[selectedTestIndex];
  const hasCompilationError = !!executionSummary?.compilationError;
  const allPassed = !!executionSummary?.allPassed;

  // Auto-play iteration state for scrubbing through tests
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-playback stepping
  useEffect(() => {
    if (isPlaying && testCases.length > 1) {
      playTimerRef.current = setInterval(() => {
        onSelectTest((selectedTestIndex + 1) % testCases.length);
      }, 1400);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, selectedTestIndex, testCases.length, onSelectTest]);

  const handlePrevTest = () => {
    setIsPlaying(false);
    const prev = selectedTestIndex === 0 ? testCases.length - 1 : selectedTestIndex - 1;
    onSelectTest(prev);
  };

  const handleNextTest = () => {
    setIsPlaying(false);
    const next = (selectedTestIndex + 1) % testCases.length;
    onSelectTest(next);
  };

  // Determine global run status
  const hasRun = !!executionSummary;
  const statusLineColor = hasCompilationError
    ? '#ef4444'
    : hasRun
    ? allPassed
      ? '#22c55e'
      : '#ef4444'
    : '#cbd5e1';

  return (
    <div
      className={`minimal-test-console ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* 1. Top Minimalist Header */}
      <div
        className="minimal-console-header"
        style={{
          height: '50px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          flexShrink: 0,
        }}
      >
        {/* Left: Test Case Dots with Downward Indicator Caret */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {testCases.map((tc, idx) => {
              const res = executionSummary?.results?.[idx];
              const isSelected = selectedTestIndex === idx;

              let dotColor = '#cbd5e1'; // neutral pending
              if (hasCompilationError) {
                dotColor = '#ef4444';
              } else if (res) {
                dotColor = res.passed ? '#22c55e' : '#ef4444';
              }

              return (
                <div
                  key={tc.id || idx}
                  style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      onSelectTest(idx);
                    }}
                    title={`Test ${idx + 1}: ${tc.title || 'Case ' + (idx + 1)}`}
                    style={{
                      width: isSelected ? '22px' : '20px',
                      height: isSelected ? '22px' : '20px',
                      borderRadius: '50%',
                      backgroundColor: dotColor,
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? `0 0 0 3px rgba(37, 99, 235, 0.18)` : 'none',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    }}
                    id={`minimal-test-dot-${idx + 1}`}
                    aria-label={`Select test ${idx + 1}`}
                  />

                  {/* Downward Caret Triangle under the selected dot (exact screenshot match) */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: `6px solid ${dotColor}`,
                        zIndex: 2,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {executionSummary && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: allPassed ? '#16a34a' : '#dc2626',
                marginLeft: '8px',
              }}
            >
              {allPassed
                ? `✓ All ${executionSummary.totalCount} Passed (${executionSummary.totalTimeMs}ms)`
                : hasCompilationError
                ? '⚠️ Error'
                : `${executionSummary.passedCount}/${executionSummary.totalCount} Passed`}
            </span>
          )}
        </div>

        {/* Right: Reset Button & Run Code Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onResetCode && (
            <button
              type="button"
              onClick={onResetCode}
              title="Reset starter template code"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.15s ease',
              }}
              id="btn-minimal-reset"
              aria-label="Reset Code"
            >
              ↺
            </button>
          )}

          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              title={isMinimized ? 'Expand Console' : 'Collapse Console'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '13px',
              }}
              id="btn-minimal-minimize"
            >
              {isMinimized ? '▲' : '▼'}
            </button>
          )}

          <button
            type="button"
            className="minimal-run-code-btn"
            onClick={onRunCode}
            disabled={isRunning}
            id="btn-minimal-run-code"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.28)',
              transition: 'all 0.15s ease',
              opacity: isRunning ? 0.7 : 1,
            }}
          >
            {isRunning ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                <span>Running...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '13px' }}>▷</span>
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Horizontal Colored Separator Bar matching test status */}
      <div
        style={{
          height: '2.5px',
          backgroundColor: statusLineColor,
          width: '100%',
          flexShrink: 0,
          transition: 'background-color 0.2s ease',
        }}
      />

      {/* 3. Main Console Body (Split View matching screenshot) */}
      {!isMinimized && (
        <div
          className="minimal-console-body"
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)',
            height: 'calc(100% - 53px)',
            overflow: 'hidden',
          }}
        >
          {/* Left Column: Test Case Status, Diagnostic & Iteration Stepper */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              borderRight: '1px solid #f1f5f9',
            }}
          >
            {/* Upper Content Area */}
            <div
              style={{
                padding: '20px 24px 14px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {/* Test Title & Subtitle */}
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#1e293b',
                  margin: '0 0 4px',
                  letterSpacing: '-0.01em',
                }}
              >
                {currentTest?.title || `Test ${selectedTestIndex + 1}`}
              </h2>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748b',
                  margin: '0 0 16px',
                  lineHeight: 1.4,
                }}
              >
                {currentTest?.description || `A bit of everything across test case #${selectedTestIndex + 1}.`}
              </p>

              {/* Compilation Error Alert */}
              {hasCompilationError && executionSummary?.compilationError && (
                <div
                  style={{
                    backgroundColor: '#fff1f2',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '14px',
                    border: '1px solid #fecdd3',
                  }}
                >
                  <span
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '5px',
                      display: 'inline-block',
                      letterSpacing: '0.04em',
                      marginBottom: '8px',
                    }}
                  >
                    ERROR
                  </span>
                  <div
                    style={{
                      color: '#b91c1c',
                      fontSize: '12.5px',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.4,
                    }}
                  >
                    {executionSummary.compilationError.slice(0, 300)}
                  </div>
                </div>
              )}

              {/* Status Box matching screenshot */}
              <div
                style={{
                  backgroundColor: !hasRun
                    ? '#f8fafc'
                    : currentResult?.passed
                    ? '#f0fdf4'
                    : '#fff1f2',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Status Badge */}
                <div style={{ marginBottom: '8px' }}>
                  <span
                    style={{
                      backgroundColor: !hasRun
                        ? '#64748b'
                        : currentResult?.passed
                        ? '#22c55e'
                        : '#ef4444',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2.5px 8px',
                      borderRadius: '5px',
                      display: 'inline-block',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {!hasRun ? 'READY' : currentResult?.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                {/* Status Message Text */}
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: !hasRun
                      ? '#475569'
                      : currentResult?.passed
                      ? '#15803d'
                      : '#b91c1c',
                    lineHeight: 1.4,
                  }}
                >
                  {!hasRun
                    ? 'Click Run Code above to compile and evaluate this test case.'
                    : currentResult?.passed
                    ? `Output matched expected output! (${currentResult.executionTimeMs}ms)`
                    : currentResult
                    ? `Day ${selectedTestIndex + 1}'s output isn't right. Expected "${currentTest?.expectedOutput?.trim()}", but got "${currentResult.actualOutput?.trim() || '(empty)'}".`
                    : 'Execution failed.'}
                </div>
              </div>

              {/* Minimalist Input & Output Drawer Toggle */}
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{showFullDetails ? '▾ Hide I/O Details' : '▸ Show Test I/O Details'}</span>
                </button>

                {showFullDetails && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Input: </span>
                      <code style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                        {currentTest?.input?.trim() || '(none)'}
                      </code>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Expected Output: </span>
                      <code style={{ fontFamily: 'var(--font-mono)', color: '#16a34a' }}>
                        {currentTest?.expectedOutput?.trim() || '(none)'}
                      </code>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Your Output: </span>
                      <code
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: currentResult?.passed ? '#16a34a' : currentResult ? '#dc2626' : '#94a3b8',
                        }}
                      >
                        {currentResult?.actualOutput?.trim() || '(not run yet)'}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Scrubber & Iteration Bar (Matching screenshot bottom controls) */}
            <div
              className="minimal-scrubber-bar"
              style={{
                height: '52px',
                padding: '0 18px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#ffffff',
                flexShrink: 0,
              }}
            >
              {/* Play / Pause button */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause Auto-stepping' : 'Iterate / Step Through Test Cases'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: isPlaying ? '#bfdbfe' : '#dbeafe',
                  color: '#2563eb',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                id="btn-scrubber-play"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              {/* Slider Timeline Scrubber */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, testCases.length - 1)}
                  value={selectedTestIndex}
                  onChange={e => {
                    setIsPlaying(false);
                    onSelectTest(parseInt(e.target.value, 10));
                  }}
                  style={{
                    width: '100%',
                    accentColor: '#3b82f6',
                    cursor: 'pointer',
                    height: '6px',
                  }}
                  id="scrubber-range-slider"
                  aria-label="Scrub through test iterations"
                />
              </div>

              {/* Step Back button */}
              <button
                type="button"
                onClick={handlePrevTest}
                title="Step backward (previous test)"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: '1.5px solid #93c5fd',
                  backgroundColor: '#ffffff',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
                id="btn-step-prev"
                aria-label="Previous test step"
              >
                ‹
              </button>

              {/* Step Forward button */}
              <button
                type="button"
                onClick={handleNextTest}
                title="Step forward (next test)"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: '1.5px solid #93c5fd',
                  backgroundColor: '#ffffff',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
                id="btn-step-next"
                aria-label="Next test step"
              >
                ›
              </button>

              {/* Toggle switch for iterating/auto-loop */}
              <button
                type="button"
                onClick={() => setShowFullDetails(!showFullDetails)}
                title="Toggle I/O detail view"
                style={{
                  width: '38px',
                  height: '22px',
                  borderRadius: '11px',
                  backgroundColor: showFullDetails ? '#3b82f6' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '2px',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0,
                }}
                id="toggle-details-switch"
                aria-label="Toggle details"
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    transform: showFullDetails ? 'translateX(16px)' : 'translateX(0px)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Right Column: Minimalist White Square with the Problem Emoji */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              overflow: 'hidden',
              height: '100%',
              position: 'relative',
            }}
          >
            {/* The Crisp White Square from the screenshot */}
            <div
              className="emoji-white-square"
              style={{
                width: '100%',
                maxWidth: '380px',
                aspectRatio: '1 / 1',
                maxHeight: '380px',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 6px 25px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Large Problem Emoji */}
              <div
                style={{
                  fontSize: '84px',
                  lineHeight: 1,
                  filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.08))',
                  userSelect: 'none',
                  animation: allPassed ? 'pulse 2s infinite' : 'none',
                  marginBottom: '14px',
                }}
                aria-label={problemTitle}
              >
                {problemEmoji}
              </div>

              {/* Dynamic Status / Iteration Indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  {problemTitle}
                </span>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '3px 12px',
                    borderRadius: '20px',
                    backgroundColor: !hasRun
                      ? '#f1f5f9'
                      : currentResult?.passed
                      ? '#dcfce7'
                      : '#fee2e2',
                    color: !hasRun
                      ? '#64748b'
                      : currentResult?.passed
                      ? '#15803d'
                      : '#b91c1c',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {!hasRun
                    ? `Iteration ${selectedTestIndex + 1} of ${testCases.length}`
                    : currentResult?.passed
                    ? `✓ Test ${selectedTestIndex + 1} Passed`
                    : `✕ Test ${selectedTestIndex + 1} Failed`}
                </span>

                {/* If all passed: celebration & action to iterate */}
                {allPassed && (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a' }}>
                      All {testCases.length} Tests Passed! 🎉
                    </span>
                    {nextProblemId && (
                      <a
                        href={`/problem/${nextProblemId}`}
                        style={{
                          fontSize: '12px',
                          color: '#2563eb',
                          fontWeight: 700,
                          textDecoration: 'none',
                          marginTop: '4px',
                          background: '#eff6ff',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        Iterate Next Challenge &rarr;
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
