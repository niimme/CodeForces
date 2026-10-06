'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onReset: () => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  onRun?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  breakpoints?: Set<number>;
  onToggleBreakpoint?: (line: number) => void;
}

// Tokenizer regex matching the exact font & syntax colors from the user screenshot:
// - Keywords (let, while, if, else, break, continue, int, etc.): #0284c7 (vivid blue)
// - Operators (===, =, <, +, ++, -, etc.): #0284c7 (vivid blue)
// - Variables & Identifiers (poem, count, move, etc.): #7c3aed (purple/violet)
// - Function calls (followed by '('): #7c3aed with purple underline
// - Literals (0, 8, true, false): #dc2626 (red)
// - Strings ("", '🏁', ",", " "): #16a34a (green)
const TOKEN_REGEX = new RegExp(
  '(' +
    // 1: Comments (// ... or /* ... */)
    '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/' +
  ')|(' +
    // 2: Strings ("..." or '...')
    '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' +
  ')|(' +
    // 3: Preprocessor (#include, #define)
    '^\\s*#[a-zA-Z_]+[^\\n]*' +
  ')|(' +
    // 4: Keywords & control flow (BLUE in screenshot)
    '\\b(?:let|var|const|if|else|while|for|do|switch|case|break|continue|return|using|namespace|class|struct|public|private|protected|template|typename|int|long|double|float|char|bool|void|string|auto|static|def|import|from|function)\\b' +
  ')|(' +
    // 5: Booleans & Numbers (RED in screenshot)
    '\\b(?:true|false)\\b|\\b\\d+(?:\\.\\d+)?\\b' +
  ')|(' +
    // 6: Operators (BLUE in screenshot: ===, ==, !=, =, <, >, +, ++, -, etc.)
    '===|==|!=|>=|<=|&&|\\|\\||<<|>>|\\+\\+|--|\\+=|-=|\\*=|\\/=|%=|->|::|[+\\-*\\/%&|^!~<>=?:_]' +
  ')|(' +
    // 7: Function call identifiers (followed by '(') (PURPLE with underline in screenshot)
    '\\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\\s*\\()' +
  ')|(' +
    // 8: General variables & identifiers (PURPLE in screenshot)
    '\\b[a-zA-Z_$][a-zA-Z0-9_$]*\\b' +
  ')',
  'gm'
);

function highlightSyntax(rawCode: string): string {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  TOKEN_REGEX.lastIndex = 0;

  let lastIndex = 0;
  let html = '';
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(rawCode)) !== null) {
    if (match.index > lastIndex) {
      html += escapeHtml(rawCode.substring(lastIndex, match.index));
    }

    const [full, comment, str, preproc, keyword, boolNum, op, fnCall, ident] = match;

    if (comment) {
      html += `<span style="color: #94a3b8; font-style: italic;">${escapeHtml(comment)}</span>`;
    } else if (str) {
      html += `<span style="color: #16a34a; font-weight: 500;">${escapeHtml(str)}</span>`;
    } else if (preproc) {
      html += `<span style="color: #0284c7; font-weight: 600;">${escapeHtml(preproc)}</span>`;
    } else if (keyword) {
      html += `<span style="color: #0284c7; font-weight: 600;">${escapeHtml(keyword)}</span>`;
    } else if (boolNum) {
      html += `<span style="color: #dc2626; font-weight: 500;">${escapeHtml(boolNum)}</span>`;
    } else if (op) {
      html += `<span style="color: #0284c7; font-weight: 600;">${escapeHtml(op)}</span>`;
    } else if (fnCall) {
      html += `<span style="color: #7c3aed; font-weight: 500; text-decoration: underline; text-decoration-color: #c084fc; text-underline-offset: 2px;">${escapeHtml(fnCall)}</span>`;
    } else if (ident) {
      html += `<span style="color: #7c3aed; font-weight: 500;">${escapeHtml(ident)}</span>`;
    } else {
      html += escapeHtml(full);
    }

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < rawCode.length) {
    html += escapeHtml(rawCode.substring(lastIndex));
  }

  return html;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onReset,
  language = 'C++ (C++20)',
  onLanguageChange,
  onRun,
  isMaximized = false,
  onToggleMaximize,
  breakpoints: propBreakpoints,
  onToggleBreakpoint: propToggleBreakpoint,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const bpMenuRef = useRef<HTMLDivElement>(null);

  const [copied, setCopied] = useState(false);
  const [activeLine, setActiveLine] = useState<number>(1);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [showBpMenu, setShowBpMenu] = useState(false);
  const [bpInputLine, setBpInputLine] = useState('');

  // Default breakpoint on line 6 to match the user's screenshot out of the box
  const [internalBreakpoints, setInternalBreakpoints] = useState<Set<number>>(new Set([6]));
  const activeBreakpoints = propBreakpoints ?? internalBreakpoints;

  // Compute exact line count matching code lines 1-to-1
  const lines = code.split('\n');
  const lineCount = lines.length;

  // Memoize syntax highlighting HTML
  const highlightedHtml = useMemo(() => highlightSyntax(code), [code]);

  // Toggle breakpoint on a line
  const handleToggleBreakpoint = (lineNum: number) => {
    if (propToggleBreakpoint) {
      propToggleBreakpoint(lineNum);
    } else {
      setInternalBreakpoints(prev => {
        const next = new Set(prev);
        if (next.has(lineNum)) {
          next.delete(lineNum);
        } else {
          next.add(lineNum);
        }
        return next;
      });
    }
  };

  const handleClearAllBreakpoints = () => {
    if (propToggleBreakpoint) {
      activeBreakpoints.forEach(line => propToggleBreakpoint(line));
    } else {
      setInternalBreakpoints(new Set());
    }
  };

  const handleAddFromInput = () => {
    const num = parseInt(bpInputLine.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= lineCount) {
      if (!activeBreakpoints.has(num)) {
        handleToggleBreakpoint(num);
      }
      setBpInputLine('');
    }
  };

  const jumpToLine = (lineNum: number) => {
    setActiveLine(lineNum);
    if (textareaRef.current) {
      textareaRef.current.scrollTop = Math.max(0, (lineNum - 3) * 24);
    }
  };

  // Close breakpoint menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bpMenuRef.current && !bpMenuRef.current.contains(e.target as Node)) {
        setShowBpMenu(false);
      }
    };
    if (showBpMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBpMenu]);

  // Track active line number based on cursor position
  const updateActiveLine = () => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = code.substring(0, cursorPos);
    const currentLine = textBefore.split('\n').length;
    setActiveLine(currentLine);
  };

  // Synchronize vertical & horizontal scroll between textarea, highlight layer, and gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const top = e.currentTarget.scrollTop;
    const left = e.currentTarget.scrollLeft;
    setScrollTop(top);

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = top;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = top;
      highlightRef.current.scrollLeft = left;
    }
  };

  // Forward mouse wheel on the gutter to the textarea
  const handleGutterWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop += e.deltaY;
    }
  };

  useEffect(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [code]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter runs the code
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }

    // Support Tab key indentation (4 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = '    ';

      const newCode = code.substring(0, start) + indent + code.substring(end);
      onChange(newCode);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + indent.length;
          updateActiveLine();
        }
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Editor Toolbar with Language, Breakpoints Manager & Actions */}
      <div className="editor-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onLanguageChange ? (
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <select
                value={language}
                onChange={e => onLanguageChange(e.target.value)}
                className="editor-lang-select"
                aria-label="Select Programming Language"
                id="select-programming-language"
              >
                <option value="cpp">⚡ C++ (C++20 / clang++)</option>
                <option value="javascript">⚡ JavaScript (Node.js)</option>
                <option value="python">⚡ Python 3</option>
              </select>
            </div>
          ) : (
            <span className="editor-lang-badge">
              <span>⚡</span>
              <span>{language}</span>
            </span>
          )}

          {/* Breakpoints Popover Trigger */}
          <div style={{ position: 'relative' }} ref={bpMenuRef}>
            <button
              className={`editor-bp-btn ${activeBreakpoints.size > 0 ? 'has-active' : ''}`}
              onClick={() => setShowBpMenu(!showBpMenu)}
              title="Add or manage breakpoints"
              id="btn-manage-breakpoints"
            >
              <span className="bp-indicator-dot" />
              <span>Breakpoints {activeBreakpoints.size > 0 ? `(${activeBreakpoints.size})` : ''}</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
            </button>

            {/* Breakpoints Management Menu */}
            {showBpMenu && (
              <div className="bp-dropdown-menu">
                <div className="bp-dropdown-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a' }}>
                    <span style={{ color: '#f97316' }}>●</span>
                    <span>Breakpoints ({activeBreakpoints.size})</span>
                  </div>
                  <button
                    onClick={() => setShowBpMenu(false)}
                    className="bp-dropdown-close"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="bp-dropdown-body">
                  <div className="bp-add-row">
                    <input
                      type="number"
                      min={1}
                      max={lineCount}
                      placeholder="Line #"
                      value={bpInputLine}
                      onChange={e => setBpInputLine(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddFromInput();
                      }}
                      className="bp-input"
                      id="input-add-breakpoint"
                    />
                    <button
                      onClick={handleAddFromInput}
                      className="bp-add-btn"
                      id="btn-add-breakpoint-line"
                    >
                      + Add
                    </button>
                  </div>

                  {activeBreakpoints.size > 0 ? (
                    <div className="bp-list">
                      {Array.from(activeBreakpoints)
                        .sort((a, b) => a - b)
                        .map(lineNum => (
                          <div key={lineNum} className="bp-list-item">
                            <button
                              className="bp-tag"
                              onClick={() => jumpToLine(lineNum)}
                              title={`Jump to line ${lineNum}`}
                            >
                              <span className="bp-dot-tiny" />
                              <span>Line {lineNum}</span>
                            </button>
                            <button
                              onClick={() => handleToggleBreakpoint(lineNum)}
                              className="bp-delete-btn"
                              title={`Remove breakpoint on line ${lineNum}`}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="bp-empty-text">No active breakpoints.</p>
                  )}

                  <div className="bp-dropdown-footer">
                    {activeBreakpoints.size > 0 && (
                      <button
                        onClick={handleClearAllBreakpoints}
                        className="bp-clear-btn"
                        id="btn-clear-all-breakpoints"
                      >
                        Clear All
                      </button>
                    )}
                    <span className="bp-hint-text">
                      💡 Click directly on any line number in the gutter to toggle breakpoints.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <span style={{ fontSize: '11px', color: '#64748b' }} className="editor-shortcut-hint">
            Press <kbd style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569' }}>⌘/Ctrl + Enter</kbd> to run
          </span>
        </div>

        <div className="editor-actions">
          <button
            className="editor-action-btn"
            onClick={handleCopy}
            title="Copy code to clipboard"
            id="btn-copy-code"
          >
            <span>{copied ? '✓ Copied' : '📋 Copy'}</span>
          </button>

          <button
            className="editor-action-btn"
            onClick={onReset}
            title="Reset code to original starter template"
            id="btn-reset-code"
          >
            <span>🔄 Reset</span>
          </button>

          {onToggleMaximize && (
            <button
              className="editor-action-btn"
              onClick={onToggleMaximize}
              title={isMaximized ? 'Restore Editor Height' : 'Maximize Editor Height'}
              id="btn-maximize-editor"
              style={{ fontWeight: 600 }}
            >
              <span>{isMaximized ? '🗗 Restore' : '⛶ Maximize'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor text area with pixel-locked line numbers, fold arrows & breakpoint gutter */}
      <div className="code-editor-area">
        <div
          ref={lineNumbersRef}
          className="line-numbers"
          onWheel={handleGutterWheel}
          aria-label="Line gutter with breakpoints and folding"
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const hasBreakpoint = activeBreakpoints.has(lineNum);
            const lineText = lines[i] || '';
            const hasFold = lineText.includes('{');
            const isActive = activeLine === lineNum;

            return (
              <div
                key={lineNum}
                className={`line-number-row ${isActive ? 'active' : ''} ${hasBreakpoint ? 'has-bp' : ''}`}
                onClick={() => handleToggleBreakpoint(lineNum)}
                title={
                  hasBreakpoint
                    ? `Line ${lineNum}: Click to remove breakpoint`
                    : `Line ${lineNum}: Click to add breakpoint`
                }
              >
                {/* Breakpoint dot column (orange circle matching screenshot) */}
                <span className="gutter-bp-slot">
                  <span className={`bp-dot ${hasBreakpoint ? 'filled' : 'ghost'}`} />
                </span>

                {/* Line number text */}
                <span className="gutter-line-num">{lineNum}</span>

                {/* Block fold indicator (blue triangle ▾ matching screenshot) */}
                <span className="gutter-fold-slot">
                  {hasFold && <span className="fold-arrow">▾</span>}
                </span>
              </div>
            );
          })}
        </div>

        <div className="code-editor-surface">
          {/* Active Line Background Tint (matching line 1 in screenshot) */}
          <div
            className="active-line-bg"
            style={{
              top: `${14 + (activeLine - 1) * 24 - scrollTop}px`,
            }}
          />

          {/* Syntax highlighted background text layer */}
          <pre
            ref={highlightRef}
            className="code-highlight-layer"
            aria-hidden="true"
          >
            <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            {'\n'}
          </pre>

          {/* Interactive transparent textarea on top */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => {
              onChange(e.target.value);
              updateActiveLine();
            }}
            onKeyDown={handleKeyDown}
            onClick={updateActiveLine}
            onKeyUp={updateActiveLine}
            onSelect={updateActiveLine}
            onScroll={handleScroll}
            className="code-textarea"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            placeholder="// Write your code here..."
            id="code-editor-textarea"
          />
        </div>
      </div>
    </div>
  );
};

