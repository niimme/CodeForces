'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { getProblemById, getAllProblems } from '@/lib/cfScraper';
import { runTestCases, ExecutionSummary } from '@/lib/codeRunner';
import { markProblemCompleted, getUserProgress, getUserSettings, UserSettings } from '@/lib/userProgress';
import { traceCodeExecution } from '@/lib/codeTracer';
import { ProblemMetadata, UserProgress, SupportedLanguage } from '@/types';
import { InstructionsHeader, WorkspaceTab } from '@/components/workspace/InstructionsHeader';
import { CodeEditor } from '@/components/workspace/CodeEditor';
import { TestRunnerConsole } from '@/components/workspace/TestRunnerConsole';
import { ProblemStatement } from '@/components/workspace/ProblemStatement';
import { UserSettingsModal } from '@/components/settings/UserSettingsModal';

interface ProblemWorkspaceProps {
  problemId: string;
}

function renderStepTokens(text: string): React.ReactNode[] {
  const regex = /("[^"]*"|\b\d+\b|\b[A-Za-z0-9_$]+(?:\([^)]*\))?)/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    const isSpecial =
      token.startsWith('"') ||
      /^\d+$/.test(token) ||
      token.includes('(') ||
      ['tempString', 'word', 'loopLength', 'i', 'temp', 'ans', 'count'].includes(token);

    if (isSpecial) {
      parts.push(
        <span
          key={match.index}
          style={{
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            padding: '1px 5px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: '11.5px',
            border: '1px solid #dbeafe',
          }}
        >
          {token}
        </span>
      );
    } else {
      parts.push(token);
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }
  return parts;
}

export default function ProblemWorkspace({ problemId }: ProblemWorkspaceProps) {
  const [problem, setProblem] = useState<ProblemMetadata | null>(() => getProblemById(problemId) || null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('instructions');
  const [language, setLanguage] = useState<'cpp' | 'c' | 'kotlin' | 'java' | 'python'>('cpp');
  const [code, setCode] = useState<string>('');
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionSummary, setExecutionSummary] = useState<ExecutionSummary | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [nextProblemId, setNextProblemId] = useState<string | null>(() => {
    const all = getAllProblems();
    const currentIndex = all.findIndex(item => item.id.toUpperCase() === problemId.toUpperCase());
    if (currentIndex !== -1 && currentIndex < all.length - 1) {
      return all[currentIndex + 1].id;
    }
    return null;
  });

  // User Settings & Account Modal State
  const [currentUser, setCurrentUser] = useState<UserProgress>(() => getUserProgress());
  const [editorLigatures, setEditorLigatures] = useState<boolean>(() => getUserSettings().editorLigatures);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsModalInitialTab, setSettingsModalInitialTab] = useState<'preferences' | 'profile' | 'auth'>('preferences');

  // Sync settings when changed anywhere
  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserSettings>;
      if (customEvent.detail) {
        if (typeof customEvent.detail.editorLigatures === 'boolean') {
          setEditorLigatures(customEvent.detail.editorLigatures);
        }
      }
    };
    window.addEventListener('cf_settings_changed', handleSettingsChange);
    return () => window.removeEventListener('cf_settings_changed', handleSettingsChange);
  }, []);

  // Line-by-line Code Execution Trace state (hidden by default at start of code)
  const [activeTraceStepIndex, setActiveTraceStepIndex] = useState<number>(0);
  const [showTracePopover, setShowTracePopover] = useState<boolean>(false);
  const [activeLineTop, setActiveLineTop] = useState<number>(75);

  const currentTestCase = problem?.testCases?.[selectedTestIndex] || problem?.testCases?.[0];
  const currentResult = executionSummary?.results?.[selectedTestIndex];
  const traceSteps = useMemo(() => {
    return traceCodeExecution(
      code,
      currentTestCase?.input || '',
      currentTestCase?.expectedOutput || '',
      currentResult?.actualOutput || '',
      language
    );
  }, [code, currentTestCase, currentResult, language]);

  useEffect(() => {
    setActiveTraceStepIndex(0);
  }, [selectedTestIndex, code]);

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

  // Storage keys for persisting code and preferred language per problem
  const getSavedCodeKey = (pId: string, lang: string) => `cf_code_${pId.toUpperCase()}_${lang}`;
  const getSavedLangKey = (pId: string) => `cf_lang_${pId.toUpperCase()}`;

  // Load problem, restore saved code & language, and load persisted layout splits
  useEffect(() => {
    const p = getProblemById(problemId);
    if (p) {
      setProblem(p);

      // Restore saved language if user previously worked in a specific language
      let effectiveLang = language;
      try {
        const savedLang = localStorage.getItem(getSavedLangKey(p.id)) || localStorage.getItem('cf_preferred_lang');
        if (savedLang && ['cpp', 'c', 'kotlin', 'java', 'python'].includes(savedLang)) {
          effectiveLang = savedLang as 'cpp' | 'c' | 'kotlin' | 'java' | 'python';
          setLanguage(effectiveLang);
        }
      } catch (e) {}

      // Restore saved code when going back to this problem, or default to empty
      try {
        const savedCode = localStorage.getItem(getSavedCodeKey(p.id, effectiveLang));
        if (savedCode !== null && savedCode !== undefined) {
          setCode(savedCode);
        } else {
          setCode('');
        }
      } catch (e) {
        setCode('');
      }

      // Keep "What happened" popover and active box hidden at start of code
      setShowTracePopover(false);
      setActiveTraceStepIndex(0);
      setExecutionSummary(null);

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

  // Persist code on change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (problem) {
      try {
        localStorage.setItem(getSavedCodeKey(problem.id, language), newCode);
      } catch (e) {}
    }
  };

  // Handle language switching with saved code restoration
  const handleLanguageChange = (newLang: string) => {
    if (!problem) return;
    const typedLang = newLang as 'cpp' | 'c' | 'kotlin' | 'java' | 'python';
    setLanguage(typedLang);
    try {
      localStorage.setItem(getSavedLangKey(problem.id), typedLang);
      localStorage.setItem('cf_preferred_lang', typedLang);
    } catch (e) {}

    // Restore saved code for newly selected language if present
    try {
      const savedCode = localStorage.getItem(getSavedCodeKey(problem.id, typedLang));
      if (savedCode !== null && savedCode !== undefined) {
        setCode(savedCode);
      } else {
        setCode('');
      }
    } catch (e) {
      setCode('');
    }
    setExecutionSummary(null);
    setShowTracePopover(false);
  };

  const handleResetCode = () => {
    if (problem) {
      if (confirm('Are you sure you want to clear your code?')) {
        setCode('');
        setExecutionSummary(null);
        setShowTracePopover(false);
        try {
          localStorage.removeItem(getSavedCodeKey(problem.id, language));
        } catch (e) {}
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
                onChange={handleCodeChange}
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
                activeTraceStep={traceSteps[activeTraceStepIndex] || null}
                showTracePopover={showTracePopover}
                onCloseTracePopover={() => setShowTracePopover(false)}
                ligatures={editorLigatures}
                onActiveLinePosChange={setActiveLineTop}
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
                problemEmoji={problem.emoji}
                problemTitle={problem.title}
                onResetCode={handleResetCode}
                nextProblemId={nextProblemId}
                traceSteps={traceSteps}
                activeTraceStepIndex={activeTraceStepIndex}
                onSelectTraceStep={setActiveTraceStepIndex}
                showTracePopover={showTracePopover}
                onToggleTracePopover={() => setShowTracePopover(!showTracePopover)}
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
              currentLanguage={language}
              onOpenSettings={() => {
                setSettingsModalInitialTab('preferences');
                setShowSettingsModal(true);
              }}
              onOpenAccount={() => {
                setSettingsModalInitialTab(currentUser?.isLoggedIn ? 'profile' : 'auth');
                setShowSettingsModal(true);
              }}
              currentUser={currentUser}
            />

            <ProblemStatement
              problem={problem}
              activeTab={activeTab}
              capturedLogs={executionSummary?.capturedLogs || []}
              userCode={code}
              isMaximized={isMaximizedRight}
              onToggleMaximize={toggleMaximizeStatement}
              language={language}
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

        {/* Floating "What happened" Popover on the Right Side (Matching Screenshot 1) */}
        {showTracePopover && traceSteps[activeTraceStepIndex] && (() => {
          const step = traceSteps[activeTraceStepIndex];
          const popoverTop = Math.max(52, Math.min(activeLineTop - 14, 460));
          const arrowOffset = Math.max(16, Math.min(activeLineTop - popoverTop + 4, 260));

          return (
            <div
              className="trace-what-happened-popover"
              style={{
                position: 'absolute',
                top: `${popoverTop}px`,
                left: isMobile || isMaximizedEditor ? 'auto' : `calc(${actualLeftWidth}% + 14px)`,
                right: isMobile || isMaximizedEditor ? '16px' : 'auto',
                width: '400px',
                maxWidth: isMobile || isMaximizedEditor ? 'calc(100% - 32px)' : `calc(100% - ${actualLeftWidth}% - 28px)`,
                backgroundColor: '#ffffff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '16px',
                boxShadow: '0 16px 40px rgba(37, 99, 235, 0.16), 0 4px 12px rgba(0,0,0,0.06)',
                padding: '16px 18px',
                zIndex: 60,
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              {/* Speech bubble pointer pointing left towards the active line */}
              {!isMobile && !isMaximizedEditor && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-8px',
                      top: `${arrowOffset}px`,
                      width: 0,
                      height: 0,
                      borderTop: '7px solid transparent',
                      borderBottom: '7px solid transparent',
                      borderRight: '8px solid #bfdbfe',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '-6.5px',
                      top: `${arrowOffset}px`,
                      width: 0,
                      height: 0,
                      borderTop: '7px solid transparent',
                      borderBottom: '7px solid transparent',
                      borderRight: '8px solid #ffffff',
                    }}
                  />
                </>
              )}

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', color: '#0284c7' }}>⚡</span>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                    What happened
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTracePopover(false)}
                  title="Close explanation"
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#f1f5f9',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                  id="btn-close-trace-popover"
                >
                  ✕
                </button>
              </div>

              {/* Main Description */}
              <p style={{ fontSize: '13px', color: '#1e293b', margin: '0 0 10px', lineHeight: 1.45, fontWeight: 500 }}>
                {step.whatHappened}
              </p>

              {/* Steps Took */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Steps Took
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#475569', lineHeight: 1.55 }}>
                  {step.stepsTaken.map((st, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      {renderStepTokens(st)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })()}
      </div>

      {/* User Settings & Full Account Authentication Modal */}
      <UserSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={settingsModalInitialTab}
        currentLanguage={language}
        onLanguageChange={(newLang) => handleLanguageChange(newLang)}
        editorLigatures={editorLigatures}
        onLigaturesChange={(val) => setEditorLigatures(val)}
        currentUser={currentUser}
        onUserUpdate={(u) => setCurrentUser(u)}
      />

      {/* All Tests Passed Celebration Modal */}
      {showCelebration && (
        <div className="modal-overlay" onClick={() => setShowCelebration(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ textAlign: 'center', maxWidth: '480px', padding: '32px 28px', borderRadius: '20px' }}
          >
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Accepted! (AC)
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Congratulations! Your {language === 'cpp' ? 'C++' : language === 'c' ? 'C' : language === 'kotlin' ? 'Kotlin' : language === 'java' ? 'Java' : 'Python'} solution passed all <strong>{problem.testCases?.length || 5} / {problem.testCases?.length || 5} test cases</strong> for{' '}
              <strong style={{ color: '#2563eb' }}>{problem.id} - {problem.title}</strong>!
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/"
                className="secondary-btn"
                style={{ padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
                id="btn-modal-roadmap"
              >
                &larr; Roadmap
              </Link>
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="secondary-btn"
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                id="btn-continue-problem"
                title="Continue working on or reviewing this problem"
              >
                Continue Problem
              </button>
              {nextProblemId ? (
                <Link
                  href={`/problem/${nextProblemId}`}
                  className="primary-btn"
                  onClick={() => setShowCelebration(false)}
                  style={{ padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
                  id="btn-modal-next-challenge"
                >
                  Next Challenge &rarr;
                </Link>
              ) : (
                <Link
                  href="/"
                  className="primary-btn"
                  style={{ padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
                  id="btn-modal-next-challenge"
                >
                  Completed! 🎉
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
