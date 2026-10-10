'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TestCase } from '../../types';
import { ExecutionSummary, TestResult } from '../../lib/codeRunner';
import { TraceStep } from '../../lib/codeTracer';

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
  traceSteps?: TraceStep[];
  activeTraceStepIndex?: number;
  onSelectTraceStep?: (stepIndex: number) => void;
  showTracePopover?: boolean;
  onToggleTracePopover?: () => void;
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
  traceSteps = [],
  activeTraceStepIndex = 0,
  onSelectTraceStep,
  showTracePopover = false,
  onToggleTracePopover,
}) => {
  const currentTest = testCases[selectedTestIndex] || testCases[0];
  const currentResult: TestResult | undefined = executionSummary?.results?.[selectedTestIndex];
  const hasCompilationError = !!executionSummary?.compilationError;
  const allPassed = !!executionSummary?.allPassed;

  // Auto-play state for stepping through code execution trace
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = Math.max(1, traceSteps.length);

  // Auto-stepping through line-by-line code execution
  useEffect(() => {
    if (isPlaying && traceSteps.length > 1 && onSelectTraceStep) {
      playTimerRef.current = setInterval(() => {
        onSelectTraceStep((activeTraceStepIndex + 1) % traceSteps.length);
      }, 1500);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, activeTraceStepIndex, traceSteps.length, onSelectTraceStep]);

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (onSelectTraceStep) {
      const prev = activeTraceStepIndex <= 0 ? traceSteps.length - 1 : activeTraceStepIndex - 1;
      onSelectTraceStep(prev);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (onSelectTraceStep) {
      const next = (activeTraceStepIndex + 1) % traceSteps.length;
      onSelectTraceStep(next);
    }
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
          height: '52px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          flexShrink: 0,
        }}
      >
        {/* Left: Test Case Dots with Concentric Halo Outline Glow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {testCases.map((tc, idx) => {
              const res = executionSummary?.results?.[idx];
              const isSelected = selectedTestIndex === idx;

              let dotColor = '#cbd5e1'; // neutral pending
              let haloColor = 'rgba(203, 213, 225, 0.55)'; // light surrounding glow

              if (hasCompilationError) {
                dotColor = '#ef4444';
                haloColor = 'rgba(248, 113, 113, 0.45)';
              } else if (res) {
                if (res.passed) {
                  dotColor = '#10b981';
                  haloColor = 'rgba(52, 211, 153, 0.45)'; // exact light green glow from screenshot
                } else {
                  dotColor = '#ef4444';
                  haloColor = 'rgba(248, 113, 113, 0.45)'; // light red glow
                }
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
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: dotColor,
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.18s ease',
                      // Exact concentric outline glow of a lighter shade surrounding the dot
                      boxShadow: isSelected ? `0 0 0 5px ${haloColor}` : 'none',
                    }}
                    id={`minimal-test-dot-${idx + 1}`}
                    aria-label={`Select test ${idx + 1}`}
                  />

                  {/* Downward Caret Triangle under the active dot */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-14px',
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

          {/* Star circle badge matching screenshot */}
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#ec4899',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              boxShadow: '0 1px 3px rgba(236, 72, 153, 0.4)',
              cursor: 'default',
              flexShrink: 0,
            }}
            title="Challenge star test"
            aria-label="Star test"
          >
            ★
          </div>
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

      {/* 3. Main Console Body (Full width matching screenshot) */}
      {!isMinimized && (
        <div
          className="minimal-console-body"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 'calc(100% - 55px)',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* Upper Content Area spanning 100% width */}
          <div
            style={{
              padding: '18px 24px 14px',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {/* Test Header & Status Icon matching screenshot */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#1e293b',
                    margin: '0 0 4px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {currentTest?.title || `Test Case ${selectedTestIndex + 1}`}
                </h2>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {currentTest?.description || `Verification across test case #${selectedTestIndex + 1}.`}
                </p>
              </div>

              {/* Status Indicator Icon (Green Checkmark from screenshot) */}
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  color: currentResult && !currentResult.passed ? '#dc2626' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  border: `1.5px solid ${currentResult && !currentResult.passed ? '#fca5a5' : '#86efac'}`,
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
                title={currentResult?.passed ? 'Test Passed' : 'Test Status'}
              >
                {currentResult && !currentResult.passed ? '✕' : '✓'}
              </div>
            </div>

            {/* Compilation Error Alert */}
            {hasCompilationError && executionSummary?.compilationError && (
              <div
                style={{
                  backgroundColor: '#fff1f2',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginTop: '12px',
                  marginBottom: '12px',
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
                    marginBottom: '6px',
                  }}
                >
                  ERROR
                </span>
                <div
                  style={{
                    color: '#b91c1c',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.4,
                  }}
                >
                  {executionSummary.compilationError.slice(0, 300)}
                </div>
              </div>
            )}

            {/* Clean Table matching screenshot: Code run, Expected, Actual */}
            <div
              style={{
                marginTop: '14px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '13px',
                }}
              >
                <span style={{ width: '100px', fontWeight: 700, color: '#334155' }}>Code run</span>
                <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '13px' }}>
                  <span style={{ color: '#c026d3' }}>
                    {currentTest?.title?.toLowerCase().includes('digital') ? 'digitalRoot' : 'run'}
                  </span>
                  <span style={{ color: '#0f172a' }}>(</span>
                  <span style={{ color: '#ea580c' }}>
                    {currentTest?.input?.trim().replace(/\n/g, ', ') || '39'}
                  </span>
                  <span style={{ color: '#0f172a' }}>)</span>
                </code>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '13px',
                }}
              >
                <span style={{ width: '100px', fontWeight: 700, color: '#334155' }}>Expected</span>
                <code style={{ color: '#16a34a', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '13px' }}>
                  {currentTest?.expectedOutput?.trim() || '(none)'}
                </code>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  fontSize: '13px',
                }}
              >
                <span style={{ width: '100px', fontWeight: 700, color: '#334155' }}>Actual</span>
                <code
                  style={{
                    color: currentResult?.passed ? '#16a34a' : currentResult ? '#dc2626' : '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {currentResult?.actualOutput?.trim() || (hasRun ? '(none)' : '(not run yet)')}
                </code>
              </div>
            </div>

            {/* Active Step Line Indicator */}
            {traceSteps.length > 0 && traceSteps[activeTraceStepIndex] && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  Line {traceSteps[activeTraceStepIndex].lineNumber}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Step {activeTraceStepIndex + 1} of {traceSteps.length}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Scrubber & Line-by-Line Iteration Bar (Full-width matching screenshot) */}
          <div
            className="minimal-scrubber-bar"
            style={{
              height: '52px',
              padding: '0 24px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              backgroundColor: '#ffffff',
              flexShrink: 0,
            }}
          >
            {/* Play / Pause button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause playback' : 'Step line-by-line through code'}
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
                max={Math.max(0, traceSteps.length - 1)}
                value={activeTraceStepIndex}
                onChange={e => {
                  setIsPlaying(false);
                  if (onSelectTraceStep) {
                    onSelectTraceStep(parseInt(e.target.value, 10));
                  }
                  if (!showTracePopover && onToggleTracePopover) {
                    onToggleTracePopover();
                  }
                }}
                style={{
                  width: '100%',
                  accentColor: '#3b82f6',
                  cursor: 'pointer',
                  height: '6px',
                }}
                id="scrubber-range-slider"
                aria-label="Scrub through code lines"
              />
            </div>

            {/* Step Back button */}
            <button
              type="button"
              onClick={() => {
                handlePrevStep();
                if (!showTracePopover && onToggleTracePopover) {
                  onToggleTracePopover();
                }
              }}
              title="Step backward one line"
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
              aria-label="Previous step"
            >
              ‹
            </button>

            {/* Step Forward button */}
            <button
              type="button"
              onClick={() => {
                handleNextStep();
                if (!showTracePopover && onToggleTracePopover) {
                  onToggleTracePopover();
                }
              }}
              title="Step forward one line"
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
              aria-label="Next step"
            >
              ›
            </button>

            {/* Toggle switch for What Happened explanation popover */}
            {onToggleTracePopover && (
              <button
                type="button"
                onClick={onToggleTracePopover}
                title={showTracePopover ? 'Hide "What happened" explanation' : 'Show "What happened" explanation'}
                style={{
                  width: '38px',
                  height: '22px',
                  borderRadius: '11px',
                  backgroundColor: showTracePopover ? '#3b82f6' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '2px',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0,
                }}
                id="toggle-details-switch"
                aria-label="Toggle explanation popover"
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    transform: showTracePopover ? 'translateX(16px)' : 'translateX(0px)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
