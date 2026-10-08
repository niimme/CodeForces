'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { TraceStep } from '@/lib/codeTracer';

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
  activeTraceStep?: TraceStep | null;
  showTracePopover?: boolean;
  onCloseTracePopover?: () => void;
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
    '\\b(?:let|var|val|const|fun|if|else|while|for|do|switch|case|default|break|continue|return|when|using|namespace|package|class|struct|union|enum|interface|object|public|private|protected|internal|override|open|data|sealed|companion|init|constructor|suspend|inline|reified|typealias|by|is|in|as|template|typename|int|long|double|float|char|bool|boolean|byte|short|void|string|String|auto|static|final|abstract|synchronized|transient|volatile|native|strictfp|extends|implements|new|this|super|instanceof|try|catch|finally|throw|throws|assert|sizeof|typedef|unsigned|signed|extern|register|goto|def|import|from)\\b' +
  ')|(' +
    // 5: Booleans & Numbers (RED in screenshot)
    '\\b(?:true|false|null|nil|None)\\b|\\b\\d+(?:\\.\\d+)?\\b' +
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

export interface FoldBlock {
  startLine: number; // 1-indexed
  endLine: number;   // 1-indexed
}

/**
 * Computes all collapsible blocks (functions, classes, control structures) in the source code.
 * Detects matching braces `{ ... }` across lines and Python indentation-based blocks.
 */
export function computeFoldableBlocks(code: string): Map<number, FoldBlock> {
  const map = new Map<number, FoldBlock>();
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Clean string literals and single line comments for accurate brace count
    const cleanLine = rawLine
      .replace(/"(?:\\.|[^"\\])*"/g, '""')
      .replace(/'(?:\\.|[^'\\])*'/g, "''")
      .replace(/\/\/.*/, '');

    const firstBrace = cleanLine.indexOf('{');
    if (firstBrace !== -1) {
      let depth = 0;
      let matchedEnd = -1;

      for (let j = i; j < lines.length; j++) {
        const curLine = lines[j]
          .replace(/"(?:\\.|[^"\\])*"/g, '""')
          .replace(/'(?:\\.|[^'\\])*'/g, "''")
          .replace(/\/\/.*/, '');

        const startCol = j === i ? firstBrace : 0;
        for (let c = startCol; c < curLine.length; c++) {
          if (curLine[c] === '{') depth++;
          else if (curLine[c] === '}') {
            depth--;
            if (depth === 0) {
              matchedEnd = j;
              break;
            }
          }
        }
        if (matchedEnd !== -1) break;
      }

      if (matchedEnd > i) {
        map.set(i + 1, {
          startLine: i + 1,
          endLine: matchedEnd + 1,
        });
      }
    } else {
      // Support Python def/class block folding
      const isPyBlock = /^\s*(def|class|if|for|while|try|with|elif|else)\b.*:\s*$/.test(cleanLine);
      if (isPyBlock) {
        const baseIndent = rawLine.match(/^\s*/)?.[0].length ?? 0;
        let lastBlockLine = -1;
        for (let j = i + 1; j < lines.length; j++) {
          const nextTrimmed = lines[j].trim();
          if (!nextTrimmed || nextTrimmed.startsWith('#')) continue;
          const nextIndent = lines[j].match(/^\s*/)?.[0].length ?? 0;
          if (nextIndent <= baseIndent) {
            lastBlockLine = j - 1;
            break;
          }
          lastBlockLine = j;
        }
        if (lastBlockLine > i) {
          map.set(i + 1, {
            startLine: i + 1,
            endLine: lastBlockLine + 1,
          });
        }
      }
    }
  }

  return map;
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
  activeTraceStep = null,
  showTracePopover = true,
  onCloseTracePopover,
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

  // Breakpoints empty by default
  const [internalBreakpoints, setInternalBreakpoints] = useState<Set<number>>(new Set());
  const activeBreakpoints = propBreakpoints ?? internalBreakpoints;

  // Function folding state: Set of 1-indexed start line numbers that are collapsed
  const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());

  // Compute all collapsible code blocks
  const foldableMap = useMemo(() => computeFoldableBlocks(code), [code]);

  // Compute visible lines and display code representation
  const { visibleLines, displayCode } = useMemo(() => {
    const rawLines = code.split('\n');

    if (collapsedLines.size === 0) {
      const vLines = rawLines.map((text, idx) => {
        const lineNum = idx + 1;
        const foldBlock = foldableMap.get(lineNum);
        return {
          lineNum,
          displayText: text,
          isCollapsed: false,
          isFoldable: !!foldBlock,
          endLine: foldBlock?.endLine,
        };
      });
      return { visibleLines: vLines, displayCode: code };
    }

    // Identify which lines are hidden by collapsed blocks
    const hiddenSet = new Set<number>();
    collapsedLines.forEach(startLine => {
      const block = foldableMap.get(startLine);
      if (block) {
        for (let l = startLine + 1; l <= block.endLine; l++) {
          hiddenSet.add(l);
        }
      }
    });

    const vLines: Array<{
      lineNum: number;
      displayText: string;
      isCollapsed: boolean;
      isFoldable: boolean;
      endLine?: number;
    }> = [];

    for (let idx = 0; idx < rawLines.length; idx++) {
      const lineNum = idx + 1;
      if (hiddenSet.has(lineNum)) continue;

      const foldBlock = foldableMap.get(lineNum);
      const isCollapsed = collapsedLines.has(lineNum) && !!foldBlock;

      if (isCollapsed && foldBlock) {
        const startText = rawLines[idx] || '';
        const endText = rawLines[foldBlock.endLine - 1] || '';
        const lastBraceIdx = endText.lastIndexOf('}');
        const suffix = lastBraceIdx !== -1 ? endText.substring(lastBraceIdx + 1).trim() : '';

        let summaryText: string;
        if (startText.includes('{')) {
          const beforeBrace = startText.substring(0, startText.indexOf('{') + 1);
          summaryText = `${beforeBrace} /* ... */ }${suffix ? ' ' + suffix : ''}`;
        } else {
          summaryText = `${startText}  # [folded]`;
        }

        vLines.push({
          lineNum,
          displayText: summaryText,
          isCollapsed: true,
          isFoldable: true,
          endLine: foldBlock.endLine,
        });
      } else {
        vLines.push({
          lineNum,
          displayText: rawLines[idx],
          isCollapsed: false,
          isFoldable: !!foldBlock,
          endLine: foldBlock?.endLine,
        });
      }
    }

    const dispCode = vLines.map(v => v.displayText).join('\n');
    return { visibleLines: vLines, displayCode: dispCode };
  }, [code, collapsedLines, foldableMap]);

  // Memoize syntax highlighting HTML for displayed text
  const highlightedHtml = useMemo(() => highlightSyntax(displayCode), [displayCode]);

  // Toggle function collapse / expand
  const handleToggleFold = (lineNum: number) => {
    setCollapsedLines(prev => {
      const next = new Set(prev);
      if (next.has(lineNum)) {
        next.delete(lineNum);
      } else {
        next.add(lineNum);
      }
      return next;
    });
  };

  // Toggle breakpoint on a line (independent from fold)
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
    const rawLines = code.split('\n');
    const num = parseInt(bpInputLine.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= rawLines.length) {
      if (!activeBreakpoints.has(num)) {
        handleToggleBreakpoint(num);
      }
      setBpInputLine('');
    }
  };

  const jumpToLine = (lineNum: number) => {
    setActiveLine(lineNum);
    // If the line is hidden inside a collapsed block, expand it so it's visible
    collapsedLines.forEach(sLine => {
      const block = foldableMap.get(sLine);
      if (block && lineNum >= block.startLine && lineNum <= block.endLine) {
        setCollapsedLines(prev => {
          const next = new Set(prev);
          next.delete(sLine);
          return next;
        });
      }
    });

    if (textareaRef.current) {
      // Find visible row index
      const vIndex = visibleLines.findIndex(v => v.lineNum === lineNum);
      const targetIndex = vIndex !== -1 ? vIndex : lineNum - 1;
      textareaRef.current.scrollTop = Math.max(0, (targetIndex - 3) * 24);
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

  // Track active line number based on cursor position in visible text
  const updateActiveLine = () => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = displayCode.substring(0, cursorPos);
    const visibleLineIndex = textBefore.split('\n').length - 1;
    const targetItem = visibleLines[visibleLineIndex];
    if (targetItem) {
      setActiveLine(targetItem.lineNum);
    }
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
  }, [displayCode]);

  // Handle code modifications in textarea with preservation of hidden lines
  const handleTextareaChange = (newVal: string) => {
    if (collapsedLines.size > 0) {
      const rawLines = code.split('\n');
      const newLines = newVal.split('\n');

      const reconstructed: string[] = [];
      const preservedCollapsed = new Set<number>();

      for (let i = 0; i < newLines.length; i++) {
        const curLine = newLines[i];
        let matchedStartLine: number | null = null;

        collapsedLines.forEach(sLine => {
          const block = foldableMap.get(sLine);
          if (block) {
            const startText = rawLines[sLine - 1] || '';
            const endText = rawLines[block.endLine - 1] || '';
            const lastBraceIdx = endText.lastIndexOf('}');
            const suffix = lastBraceIdx !== -1 ? endText.substring(lastBraceIdx + 1).trim() : '';
            const expected = startText.includes('{')
              ? `${startText.substring(0, startText.indexOf('{') + 1)} /* ... */ }${suffix ? ' ' + suffix : ''}`
              : `${startText}  # [folded]`;

            if (curLine === expected) {
              matchedStartLine = sLine;
            }
          }
        });

        if (matchedStartLine !== null) {
          const block = foldableMap.get(matchedStartLine)!;
          for (let l = block.startLine; l <= block.endLine; l++) {
            reconstructed.push(rawLines[l - 1] || '');
          }
          preservedCollapsed.add(matchedStartLine);
        } else {
          reconstructed.push(curLine);
        }
      }

      setCollapsedLines(preservedCollapsed);
      onChange(reconstructed.join('\n'));
    } else {
      onChange(newVal);
    }
    updateActiveLine();
  };

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

      const newDispCode = displayCode.substring(0, start) + indent + displayCode.substring(end);
      handleTextareaChange(newDispCode);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + indent.length;
          updateActiveLine();
        }
      });
    }
  };

  // Scroll active trace line into view when scrubbing
  useEffect(() => {
    if (activeTraceStep && textareaRef.current) {
      const targetIdx = visibleLines.findIndex(v => v.lineNum === activeTraceStep.lineNumber);
      if (targetIdx !== -1) {
        const targetTop = 14 + targetIdx * 24;
        const currentScroll = textareaRef.current.scrollTop;
        const viewHeight = textareaRef.current.clientHeight;
        if (targetTop < currentScroll + 20 || targetTop > currentScroll + viewHeight - 60) {
          textareaRef.current.scrollTop = Math.max(0, targetTop - Math.floor(viewHeight / 3));
        }
      }
    }
  }, [activeTraceStep, visibleLines]);

  const handleCopy = async () => {
    try {
      // Always copy full source code
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleResetWithUnfold = () => {
    setCollapsedLines(new Set());
    onReset();
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
                <option value="cpp">⚡ C++ (C++20)</option>
                <option value="c">⚡ C (C17 / clang)</option>
                <option value="java">⚡ Java (OpenJDK)</option>
                <option value="kotlin">⚡ Kotlin (JVM)</option>
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
                      max={code.split('\n').length}
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
                      💡 Click directly on the orange dot column in the gutter to toggle breakpoints.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Collapsed Blocks Indicator */}
          {collapsedLines.size > 0 && (
            <button
              type="button"
              className="editor-collapsed-badge"
              onClick={() => setCollapsedLines(new Set())}
              title="Click to expand all functions"
              id="btn-expand-all-functions"
            >
              <span>▸ {collapsedLines.size} {collapsedLines.size === 1 ? 'function' : 'functions'} collapsed</span>
              <span style={{ fontSize: '11px', textDecoration: 'underline' }}>Expand all</span>
            </button>
          )}

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
            onClick={handleResetWithUnfold}
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

      {/* Editor text area with pixel-locked line numbers, independent fold buttons & breakpoint gutter */}
      <div className="code-editor-area">
        <div
          ref={lineNumbersRef}
          className="line-numbers"
          onWheel={handleGutterWheel}
          aria-label="Line gutter with breakpoints and folding"
        >
          {visibleLines.map((item, visibleIdx) => {
            const { lineNum, isCollapsed, isFoldable, endLine } = item;
            const hasBreakpoint = activeBreakpoints.has(lineNum);
            const isActive = activeLine === lineNum;

            return (
              <div
                key={`${lineNum}-${visibleIdx}`}
                className={`line-number-row ${isActive ? 'active' : ''} ${hasBreakpoint ? 'has-bp' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}
              >
                {/* 1. Left Column: Breakpoint Button (independent click target) */}
                <button
                  type="button"
                  className="gutter-bp-slot"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBreakpoint(lineNum);
                  }}
                  title={
                    hasBreakpoint
                      ? `Line ${lineNum}: Click to remove breakpoint`
                      : `Line ${lineNum}: Click to add breakpoint`
                  }
                  id={`gutter-bp-btn-${lineNum}`}
                  aria-label={`Breakpoint line ${lineNum}`}
                >
                  <span className={`bp-dot ${hasBreakpoint ? 'filled' : 'ghost'}`} />
                </button>

                {/* 2. Middle Column: Line Number text (click to jump/focus) */}
                <span
                  className="gutter-line-num"
                  onClick={() => jumpToLine(lineNum)}
                  title={`Line ${lineNum}: Click to jump`}
                >
                  {lineNum}
                </span>

                {/* 3. Right Column: Function Fold/Collapse Button (completely separate from breakpoint) */}
                <span className="gutter-fold-slot">
                  {isFoldable && (
                    <button
                      type="button"
                      className={`gutter-fold-btn ${isCollapsed ? 'collapsed' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFold(lineNum);
                      }}
                      title={
                        isCollapsed
                          ? `Line ${lineNum}: Expand function (lines ${lineNum}–${endLine})`
                          : `Line ${lineNum}: Collapse function (lines ${lineNum}–${endLine})`
                      }
                      id={`gutter-fold-btn-${lineNum}`}
                      aria-label={isCollapsed ? `Expand function at line ${lineNum}` : `Collapse function at line ${lineNum}`}
                    >
                      {isCollapsed ? '▸' : '▾'}
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="code-editor-surface">
          {/* Active Line Background Tint */}
          <div
            className="active-line-bg"
            style={{
              top: `${14 + (Math.max(0, visibleLines.findIndex(v => v.lineNum === activeLine))) * 24 - scrollTop}px`,
            }}
          />

          {/* Active Trace Step Outline Box & Popover */}
          {activeTraceStep && (() => {
            const traceLineIdx = visibleLines.findIndex(v => v.lineNum === activeTraceStep.lineNumber);
            if (traceLineIdx === -1) return null;
            const topPos = 14 + traceLineIdx * 24 - scrollTop;

            return (
              <>
                <div
                  className="trace-active-line-box"
                  style={{
                    position: 'absolute',
                    top: `${topPos}px`,
                    left: '8px',
                    right: '8px',
                    height: '24px',
                    border: '1.5px solid #3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    borderRadius: '5px',
                    pointerEvents: 'none',
                    zIndex: 4,
                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.25)',
                  }}
                />

                {/* What happened Speech-Bubble Popover */}
                {showTracePopover && (
                  <div
                    className="trace-what-happened-popover"
                    style={{
                      position: 'absolute',
                      top: `${Math.max(8, topPos - 8)}px`,
                      right: '16px',
                      width: '380px',
                      maxWidth: 'calc(100% - 32px)',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: '16px',
                      boxShadow: '0 16px 40px rgba(37, 99, 235, 0.16), 0 4px 12px rgba(0,0,0,0.06)',
                      padding: '16px 18px',
                      zIndex: 25,
                      animation: 'fadeIn 0.15s ease-out',
                    }}
                  >
                    {/* Speech bubble pointer */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '16px',
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
                        top: '16px',
                        width: 0,
                        height: 0,
                        borderTop: '7px solid transparent',
                        borderBottom: '7px solid transparent',
                        borderRight: '8px solid #ffffff',
                      }}
                    />

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', color: '#0284c7' }}>⚡</span>
                        <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                          What happened
                        </span>
                      </div>
                      {onCloseTracePopover && (
                        <button
                          type="button"
                          onClick={onCloseTracePopover}
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
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Main Description */}
                    <p style={{ fontSize: '13px', color: '#1e293b', margin: '0 0 10px', lineHeight: 1.45, fontWeight: 500 }}>
                      {activeTraceStep.whatHappened}
                    </p>

                    {/* Steps Jiki Took */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Steps Jiki Took
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#475569', lineHeight: 1.55 }}>
                        {activeTraceStep.stepsTaken.map((st, i) => (
                          <li key={i} style={{ marginBottom: '3px' }}>
                            {st}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

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
            value={displayCode}
            onChange={e => handleTextareaChange(e.target.value)}
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
