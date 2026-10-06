'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { getProblemById, getAllProblems } from '@/lib/cfScraper';
import { runTestCases, ExecutionSummary } from '@/lib/codeRunner';
import { markProblemCompleted } from '@/lib/userProgress';
import { ProblemMetadata } from '@/types';
import { InstructionsHeader, WorkspaceTab } from '@/components/workspace/InstructionsHeader';
import { CodeEditor } from '@/components/workspace/CodeEditor';
import { TestRunnerConsole } from '@/components/workspace/TestRunnerConsole';
import { ProblemStatement } from '@/components/workspace/ProblemStatement';

interface ProblemWorkspaceProps {
  problemId: string;
}

export default function ProblemWorkspace({ problemId }: ProblemWorkspaceProps) {
  const [problem, setProblem] = useState<ProblemMetadata | null>(() => getProblemById(problemId) || null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('instructions');
  const [language, setLanguage] = useState<'cpp' | 'c' | 'kotlin' | 'javascript' | 'python'>('cpp');
  const [code, setCode] = useState<string>('');
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionSummary, setExecutionSummary] = useState<ExecutionSummary | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [nextProblemId, setNextProblemId] = useState<string | null>(null);

  // Resizable Windows Sizing State
  // horizontalSplit = % width of left pane (Code + Console)
  const [horizontalSplit, setHorizontalSplit] = useState<number>(50);
  // verticalSplit = % height of upper window (Code Editor)
  const [verticalSplit, setVerticalSplit] = useState<number>(56);

  // Maximize / Minimize window states
  const [isMaximizedEditor, setIsMaximizedEditor] = useState<boolean>(false);
  const [isMaximizedConsole, setIsMaximizedConsole] = useState<boolean>(false);
  const [isMinimizedConsole, setIsMinimizedConsole] = useState<boolean>(false);
  const [isMaximizedLeft, setIsMaximizedLeft] = useState<boolean>(false);
  const [isMaximizedRight, setIsMaximizedRight] = useState<boolean>(false);

  // Dragging interaction state
  const [draggingAxis, setDraggingAxis] = useState<'horizontal' | 'vertical' | null>(null);

  // Breakpoint state (empty by default)
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());

  const handleToggleBreakpoint = (line: number) => {
    setBreakpoints(prev => {
      const next = new Set(prev);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);

  // Mobile responsive layout state
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'statement' | 'code' | 'tests'>('statement');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load problem and persisted layout splits
  useEffect(() => {
    const p = getProblemById(problemId);
    if (p) {
      setProblem(p);
      // Templates are blank by default
      setCode('');

      // Find next problem for quick continuation
      const all = getAllProblems();
      const currentIndex = all.findIndex(item => item.id.toUpperCase() === p.id.toUpperCase());
      if (currentIndex !== -1 && currentIndex < all.length - 1) {
        setNextProblemId(all[currentIndex + 1].id);
      }
    }

    // Load saved window sizing from localStorage
    try {
      const savedH = localStorage.getItem('cf_workspace_split_h');
      if (savedH) {
        const val = parseFloat(savedH);
        if (!isNaN(val) && val >= 15 && val <= 85) setHorizontalSplit(val);
      }
      const savedV = localStorage.getItem('cf_workspace_split_v');
      if (savedV) {
        const val = parseFloat(savedV);
        if (!isNaN(val) && val >= 15 && val <= 85) setVerticalSplit(val);
      }
    } catch (e) {
      // localStorage not available or restricted
    }
  }, [problemId]);

  // Handle language switching
  const handleLanguageChange = (newLang: string) => {
    if (!problem) return;
    const typedLang = newLang as 'cpp' | 'c' | 'kotlin' | 'javascript' | 'python';
    setLanguage(typedLang);
    // Keep template blank when switching language
    setCode('');
    setExecutionSummary(null);
  };

  const handleResetCode = () => {
    if (problem) {
      if (confirm('Are you sure you want to clear your code?')) {
        setCode('');
        setExecutionSummary(null);
      }
    }
  };

  // Toggle maximize functions
  const toggleMaximizeEditor = () => {
    if (isMaximizedEditor) {
      setIsMaximizedEditor(false);
      setIsMinimizedConsole(false);
    } else {
      setIsMaximizedEditor(true);
      setIsMaximizedConsole(false);
      setIsMinimizedConsole(false);
    }
  };

  const toggleMaximizeConsole = () => {
    if (isMaximizedConsole) {
      setIsMaximizedConsole(false);
    } else {
      setIsMaximizedConsole(true);
      setIsMaximizedEditor(false);
      setIsMinimizedConsole(false);
    }
  };

  const toggleMinimizeConsole = () => {
    setIsMinimizedConsole(!isMinimizedConsole);
  };

  const toggleMaximizeStatement = () => {
    if (isMaximizedRight) {
      setIsMaximizedRight(false);
    } else {
      setIsMaximizedRight(true);
      setIsMaximizedLeft(false);
    }
  };

  // Drag handlers for Horizontal (Left vs Right Pane)
  const handleStartDragH = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDraggingAxis('horizontal');
  };

  // Drag handlers for Vertical (Code Editor vs Console)
  const handleStartDragV = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDraggingAxis('vertical');
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingAxis) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (draggingAxis === 'horizontal' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((clientX - rect.left) / rect.width) * 100;
      // Clamp between 20% and 80%
      const clamped = Math.max(20, Math.min(80, newPercent));
      setHorizontalSplit(clamped);
      try {
        localStorage.setItem('cf_workspace_split_h', clamped.toFixed(1));
      } catch (err) {}
    } else if (draggingAxis === 'vertical' && leftPaneRef.current) {
      const rect = leftPaneRef.current.getBoundingClientRect();
      const newPercent = ((clientY - rect.top) / rect.height) * 100;
      // Clamp between 20% and 85%
      const clamped = Math.max(20, Math.min(85, newPercent));
      setVerticalSplit(clamped);
      try {
        localStorage.setItem('cf_workspace_split_v', clamped.toFixed(1));
      } catch (err) {}
    }
  }, [draggingAxis]);

  const handlePointerUp = useCallback(() => {
    setDraggingAxis(null);
  }, []);

  useEffect(() => {
    if (draggingAxis) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [draggingAxis, handlePointerMove, handlePointerUp]);

  const handleRunCode = async () => {
    if (!problem || isRunning) return;

    setIsRunning(true);
    try {
      // Runs C++ via backend clang++ sandbox route, or JS via browser sandbox
      const summary = await runTestCases(code, problem.testCases, language);

      // Prepend breakpoint debugger information to captured logs
      if (breakpoints.size > 0) {
        const bpList = Array.from(breakpoints).sort((a, b) => a - b).join(', ');
        summary.capturedLogs = [
          `[Debugger] 🟠 Breakpoint active on line: ${bpList}`,
          ...(summary.capturedLogs || []),
        ];
      }

      setExecutionSummary(summary);

      // If all passed: trigger confetti celebration & mark completed
      if (summary.allPassed) {
        markProblemCompleted(problem.id);
        setShowCelebration(true);

        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore if canvas not supported
        }
      }
    } catch (err) {
      console.error('Execution error', err);
    } finally {
      setIsRunning(false);
    }
  };

  if (!problem) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#334155' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Problem Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>Problem {problemId} could not be loaded.</p>
        <Link href="/" className="back-dashboard-btn">
          &larr; Back to Learning Path
        </Link>
      </div>
    );
  }

  // Calculate actual widths and heights based on maximize/minimize states
  const actualLeftWidth = isMaximizedRight ? 0 : isMaximizedLeft ? 100 : horizontalSplit;
  const actualRightWidth = isMaximizedLeft ? 0 : isMaximizedRight ? 100 : 100 - horizontalSplit;

  const actualEditorHeight = isMinimizedConsole
    ? 'calc(100% - 48px)'
    : isMaximizedEditor
    ? '100%'
    : isMaximizedConsole
    ? '22%'
    : `${verticalSplit}%`;

  const actualConsoleHeight = isMinimizedConsole
    ? '48px'
    : isMaximizedEditor
    ? '0px'
    : isMaximizedConsole
    ? '78%'
    : `${100 - verticalSplit}%`;

  return (
    <div className={`workspace-container mobile-tab-${mobileTab}`} style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Mobile Top Navigation & Tab Bar (Shown only on mobile <= 768px via CSS) */}
      <header className="workspace-mobile-header" aria-label="Mobile Workspace Controls">
        <Link href="/" className="ws-mobile-back-link" title="Back to Roadmap">
          <span>&larr;</span>
          <span>Roadmap</span>
        </Link>

        <div className="ws-mobile-tabs" role="tablist">
          <button
            className={`ws-mobile-tab-btn ${mobileTab === 'statement' ? 'active' : ''}`}
            onClick={() => setMobileTab('statement')}
            role="tab"
            aria-selected={mobileTab === 'statement'}
          >
            <span>📄</span>
            <span>Statement</span>
          </button>
          <button
            className={`ws-mobile-tab-btn ${mobileTab === 'code' ? 'active' : ''}`}
            onClick={() => setMobileTab('code')}
            role="tab"
            aria-selected={mobileTab === 'code'}
          >
            <span>💻</span>
            <span>Code</span>
          </button>
          <button
            className={`ws-mobile-tab-btn ${mobileTab === 'tests' ? 'active' : ''}`}
            onClick={() => setMobileTab('tests')}
            role="tab"
            aria-selected={mobileTab === 'tests'}
          >
            <span>🧪</span>
            <span>Tests</span>
            {executionSummary && (
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  background: executionSummary.allPassed ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  marginLeft: '4px',
                  fontWeight: 800,
                }}
              >
                {executionSummary.allPassed ? 'AC' : `${executionSummary.passedCount}/${executionSummary.totalCount}`}
              </span>
            )}
          </button>
        </div>

        <button
          className="ws-mobile-run-btn"
          onClick={() => {
            handleRunCode();
            if (mobileTab === 'code') {
              setTimeout(() => setMobileTab('tests'), 300);
            }
          }}
          disabled={isRunning}
          title="Compile & Run Solution"
          id="btn-mobile-run-code"
        >
          {isRunning ? '⏳' : '▶ Run'}
        </button>
      </header>

      {/* Sizable Workspace Split Body (Controlled via CSS for desktop split vs mobile tabs) */}
      <div
        ref={containerRef}
        className={`workspace-split-body ${draggingAxis ? 'is-resizing' : ''}`}
        style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}
      >
        {/* Left Panel: Code Editor & Test Console */}
        {actualLeftWidth > 0 && (
          <section
            ref={leftPaneRef}
            className="split-pane-left"
            aria-label="Code Editor and Test Console"
            style={{
              width: `${actualLeftWidth}%`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* Top Window: Code Editor */}
            <div
              className="workspace-editor-wrapper"
              style={{
                height: actualEditorHeight,
                minHeight: isMaximizedEditor ? '100%' : '120px',
                display: isMaximizedConsole ? 'none' : 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: draggingAxis === 'vertical' ? 'none' : 'height 0.1s ease',
              }}
            >
              <CodeEditor
                code={code}
                onChange={setCode}
                onReset={handleResetCode}
                language={language}
                onLanguageChange={handleLanguageChange}
                onRun={() => {
                  handleRunCode();
                  setTimeout(() => setMobileTab('tests'), 300);
                }}
                isMaximized={isMaximizedEditor}
                onToggleMaximize={toggleMaximizeEditor}
                breakpoints={breakpoints}
                onToggleBreakpoint={handleToggleBreakpoint}
              />
            </div>

            {/* Minimalist 1px Vertical Resizer Handle */}
            {!isMaximizedEditor && !isMinimizedConsole && (
              <div
                className={`workspace-resizer-v ${draggingAxis === 'vertical' ? 'active' : ''}`}
                onMouseDown={handleStartDragV}
                onTouchStart={handleStartDragV}
                role="separator"
                aria-orientation="horizontal"
                aria-label="Resize Editor and Console"
                title="Drag to resize Editor / Console"
              />
            )}

            {/* Bottom Window: Test Runner Console */}
            <div
              className="workspace-console-wrapper"
              style={{
                height: actualConsoleHeight,
                display: isMaximizedEditor ? 'none' : 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: draggingAxis === 'vertical' ? 'none' : 'height 0.1s ease',
              }}
            >
              <TestRunnerConsole
                testCases={problem.testCases}
                selectedTestIndex={selectedTestIndex}
                onSelectTest={setSelectedTestIndex}
                onRunCode={handleRunCode}
                isRunning={isRunning}
                executionSummary={executionSummary}
                isMaximized={isMaximizedConsole}
                onToggleMaximize={toggleMaximizeConsole}
                isMinimized={isMinimizedConsole}
                onToggleMinimize={toggleMinimizeConsole}
              />
            </div>
          </section>
        )}

        {/* Collapsed Left Edge Restore Handle */}
        {isMaximizedRight && (
          <button
            onClick={() => setIsMaximizedRight(false)}
            className="collapsed-edge-restore-btn left"
            title="Restore Code Editor Window"
            id="btn-restore-left-window"
          >
            <span>▶ Show Code Editor</span>
          </button>
        )}

        {/* Minimalist 1px Horizontal Resizer Handle */}
        {!isMaximizedLeft && !isMaximizedRight && (
          <div
            className={`workspace-resizer-h ${draggingAxis === 'horizontal' ? 'active' : ''}`}
            onMouseDown={handleStartDragH}
            onTouchStart={handleStartDragH}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize Left and Right Windows"
            title="Drag to resize Left / Right windows"
          />
        )}

        {/* Collapsed Right Edge Restore Handle */}
        {isMaximizedLeft && (
          <button
            onClick={() => setIsMaximizedLeft(false)}
            className="collapsed-edge-restore-btn right"
            title="Restore Problem Statement Window"
            id="btn-restore-right-window"
          >
            <span>◀ Show Problem Statement</span>
          </button>
        )}

        {/* Right Panel: Problem Statement */}
        {actualRightWidth > 0 && (
          <section
            className="split-pane-right"
            aria-label="Problem Statement and Guidelines"
            style={{
              width: `${actualRightWidth}%`,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              flexShrink: 0,
            }}
          >
            <InstructionsHeader
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              logCount={executionSummary?.capturedLogs?.length || 0}
            />

            <ProblemStatement
              problem={problem}
              activeTab={activeTab}
              capturedLogs={executionSummary?.capturedLogs || []}
              userCode={code}
              isMaximized={isMaximizedRight}
              onToggleMaximize={toggleMaximizeStatement}
            />

            {/* Mobile Bottom Button to jump to editor */}
            <div className="ws-mobile-statement-footer">
              <button
                className="ws-mobile-solve-btn"
                onClick={() => setMobileTab('code')}
                id="btn-mobile-open-editor"
              >
                <span>💻 Open Code Editor & Solve &rarr;</span>
              </button>
            </div>
          </section>
        )}
      </div>

      {/* All Tests Passed Celebration Modal */}
      {showCelebration && (
        <div className="modal-overlay" onClick={() => setShowCelebration(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ textAlign: 'center', maxWidth: '440px', padding: '32px 24px' }}
          >
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Accepted! (AC)
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Congratulations! Your C++ solution passed all <strong>5 / 5 test cases</strong> for{' '}
              <strong style={{ color: '#2563eb' }}>{problem.id} - {problem.title}</strong>!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link
                href="/"
                className="back-dashboard-btn"
                style={{ padding: '10px 18px', fontSize: '13px' }}
              >
                &larr; Roadmap
              </Link>

              {nextProblemId && (
                <Link
                  href={`/problem/${nextProblemId}`}
                  className="run-code-btn"
                  style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px' }}
                  onClick={() => setShowCelebration(false)}
                >
                  <span>Next Challenge</span>
                  <span>&rarr;</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
