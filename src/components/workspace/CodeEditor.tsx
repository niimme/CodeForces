'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { TraceStep } from '@/lib/codeTracer';
import { getUserSettings, UserSettings } from '@/lib/userProgress';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onReset?: () => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  onRun?: () => void;
  isRunning?: boolean;
  hasRun?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  breakpoints?: Set<number>;
  onToggleBreakpoint?: (line: number) => void;
  activeTraceStep?: TraceStep | null;
  showTracePopover?: boolean;
  onCloseTracePopover?: () => void;
  ligatures?: boolean;
  onActiveLinePosChange?: (topPos: number) => void;
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

const BRACKET_PAIRS: Record<string, string> = { '(': ')', '{': '}', '[': ']' };
const REVERSE_BRACKET_PAIRS: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

function getIgnoredRanges(code: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const len = code.length;
  let i = 0;
  while (i < len) {
    const ch = code[i];
    const next = i + 1 < len ? code[i + 1] : '';
    if ((ch === '/' && next === '/') || ch === '#') {
      const start = i;
      while (i < len && code[i] !== '\n') i++;
      ranges.push([start, i]);
      continue;
    }
    if (ch === '/' && next === '*') {
      const start = i;
      i += 2;
      while (i < len && !(code[i - 1] === '*' && code[i] === '/')) i++;
      if (i < len) i++;
      ranges.push([start, i]);
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      const start = i;
      i++;
      while (i < len) {
        if (code[i] === '\\') {
          i += 2;
          continue;
        }
        if (code[i] === quote) {
          i++;
          break;
        }
        if (quote !== '`' && code[i] === '\n') break;
        i++;
      }
      ranges.push([start, i]);
      continue;
    }
    i++;
  }
  return ranges;
}

function isIgnored(idx: number, ranges: Array<[number, number]>): boolean {
  for (const [start, end] of ranges) {
    if (idx >= start && idx < end) return true;
    if (start > idx) break;
  }
  return false;
}

export function findMatchingBracketIndices(
  code: string,
  selStart: number,
  selEnd: number
): Set<number> | null {
  if (!code || selStart < 0) return null;
  const isBracket = (ch: string) => ch in BRACKET_PAIRS || ch in REVERSE_BRACKET_PAIRS;
  const ranges = getIgnoredRanges(code);

  let target = -1;
  if (selStart !== selEnd) {
    if (isBracket(code[selStart]) && !isIgnored(selStart, ranges)) {
      target = selStart;
    } else if (selEnd > 0 && isBracket(code[selEnd - 1]) && !isIgnored(selEnd - 1, ranges)) {
      target = selEnd - 1;
    } else if (selStart > 0 && isBracket(code[selStart - 1]) && !isIgnored(selStart - 1, ranges)) {
      target = selStart - 1;
    }
  } else {
    // If collapsed cursor, check immediately after (selStart - 1) first to match screenshot
    if (selStart > 0 && isBracket(code[selStart - 1]) && !isIgnored(selStart - 1, ranges)) {
      target = selStart - 1;
    } else if (selStart < code.length && isBracket(code[selStart]) && !isIgnored(selStart, ranges)) {
      target = selStart;
    }
  }

  if (target === -1) return null;

  const ch = code[target];
  if (ch in BRACKET_PAIRS) {
    const openChar = ch;
    const closeChar = BRACKET_PAIRS[ch];
    let depth = 1;
    for (let i = target + 1; i < code.length; i++) {
      if (isIgnored(i, ranges)) continue;
      if (code[i] === openChar) depth++;
      else if (code[i] === closeChar) {
        depth--;
        if (depth === 0) return new Set([target, i]);
      }
    }
  } else if (ch in REVERSE_BRACKET_PAIRS) {
    const closeChar = ch;
    const openChar = REVERSE_BRACKET_PAIRS[ch];
    let depth = 1;
    for (let i = target - 1; i >= 0; i--) {
      if (isIgnored(i, ranges)) continue;
      if (code[i] === closeChar) depth++;
      else if (code[i] === openChar) {
        depth--;
        if (depth === 0) return new Set([i, target]);
      }
    }
  }
  return null;
}

function highlightSyntax(rawCode: string, matchingBrackets?: Set<number> | null): string {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const renderChunk = (chunk: string, startOffset: number): string => {
    if (!matchingBrackets || matchingBrackets.size === 0) {
      return escapeHtml(chunk);
    }
    let res = '';
    for (let i = 0; i < chunk.length; i++) {
      const globalPos = startOffset + i;
      const ch = chunk[i];
      if (matchingBrackets.has(globalPos)) {
        res += `<span class="matching-bracket-highlight">${escapeHtml(ch)}</span>`;
      } else {
        res += escapeHtml(ch);
      }
    }
    return res;
  };

  TOKEN_REGEX.lastIndex = 0;

  let lastIndex = 0;
  let html = '';
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(rawCode)) !== null) {
    if (match.index > lastIndex) {
      html += renderChunk(rawCode.substring(lastIndex, match.index), lastIndex);
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
      html += renderChunk(full, match.index);
    }

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < rawCode.length) {
    html += renderChunk(rawCode.substring(lastIndex), lastIndex);
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
  showTracePopover = false,
  onCloseTracePopover,
  ligatures = true,
  onActiveLinePosChange,
  hasRun = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const [activeLine, setActiveLine] = useState<number>(1);
  const [scrollTop, setScrollTop] = useState<number>(0);

  // Active ligatures state synced with prop, user settings, and global events
  const [effectiveLigatures, setEffectiveLigatures] = useState<boolean>(() => {
    if (typeof ligatures === 'boolean') return ligatures;
    if (typeof window !== 'undefined') return getUserSettings().editorLigatures;
    return true;
  });

  useEffect(() => {
    if (typeof ligatures === 'boolean') {
      setEffectiveLigatures(ligatures);
    }
  }, [ligatures]);

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<UserSettings>;
      if (customEvent.detail && typeof customEvent.detail.editorLigatures === 'boolean') {
        setEffectiveLigatures(customEvent.detail.editorLigatures);
      }
    };
    window.addEventListener('cf_settings_changed', handleSettingsChange);
    return () => window.removeEventListener('cf_settings_changed', handleSettingsChange);
  }, []);

  const ligatureStyle: React.CSSProperties = useMemo(() => {
    return effectiveLigatures
      ? {
          fontVariantLigatures: 'normal',
          WebkitFontVariantLigatures: 'normal',
          fontFeatureSettings: '"liga" 1, "calt" 1, "clig" 1, "dlig" 1',
          WebkitFontFeatureSettings: '"liga" 1, "calt" 1, "clig" 1, "dlig" 1',
        }
      : {
          fontVariantLigatures: 'none',
          WebkitFontVariantLigatures: 'none',
          fontFeatureSettings: '"liga" 0, "calt" 0, "clig" 0, "dlig" 0',
          WebkitFontFeatureSettings: '"liga" 0, "calt" 0, "clig" 0, "dlig" 0',
        };
  }, [effectiveLigatures]);

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

  // Cursor selection tracking for bracket matching
  const [cursorSelection, setCursorSelection] = useState<{ start: number; end: number }>({ start: -1, end: -1 });

  // Compute matching bracket indices based on cursor position or selection
  const matchingBrackets = useMemo(() => {
    return findMatchingBracketIndices(displayCode, cursorSelection.start, cursorSelection.end);
  }, [displayCode, cursorSelection]);

  // Memoize syntax highlighting HTML for displayed text with bracket pairs highlighted
  const highlightedHtml = useMemo(
    () => highlightSyntax(displayCode, matchingBrackets),
    [displayCode, matchingBrackets]
  );

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
      updateCursorAndLine();
    }
  };


  // Track active line number and cursor selection in visible text
  const updateCursorAndLine = () => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const endPos = textareaRef.current.selectionEnd;
    setCursorSelection({ start: cursorPos, end: endPos });

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
    updateCursorAndLine();
    requestAnimationFrame(updateCursorAndLine);
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
          updateCursorAndLine();
        }
      });
    }
  };

  // Scroll active trace line into view and notify parent of line offset
  useEffect(() => {
    if (hasRun && activeTraceStep) {
      const targetIdx = visibleLines.findIndex(v => v.lineNum === activeTraceStep.lineNumber);
      if (targetIdx !== -1) {
        const targetTop = 14 + targetIdx * 24;
        if (showTracePopover && textareaRef.current) {
          const currentScroll = textareaRef.current.scrollTop;
          const viewHeight = textareaRef.current.clientHeight;
          if (targetTop < currentScroll + 20 || targetTop > currentScroll + viewHeight - 60) {
            textareaRef.current.scrollTop = Math.max(0, targetTop - Math.floor(viewHeight / 3));
          }
        }
        if (onActiveLinePosChange) {
          const topPos = 40 + targetTop - scrollTop;
          onActiveLinePosChange(topPos);
        }
      }
    }
  }, [hasRun, activeTraceStep, showTracePopover, visibleLines, scrollTop, onActiveLinePosChange]);



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Editor text area with pixel-locked line numbers, independent fold buttons & breakpoint gutter */}
      <div
        className={`code-editor-area ${!effectiveLigatures ? 'ligatures-disabled' : 'ligatures-enabled'}`}
        data-ligatures={effectiveLigatures ? 'true' : 'false'}
        style={{ height: '100%', ...ligatureStyle }}
      >
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
          {/* Active Line Background Tint (tracks current cursor line) */}
          <div
            className="active-line-bg"
            style={{
              top: `${14 + (Math.max(0, visibleLines.findIndex(v => v.lineNum === activeLine))) * 24 - scrollTop}px`,
            }}
          />

          {/* Active Trace Step Outline Box (only when tests have run) */}
          {hasRun && activeTraceStep && (() => {
            const traceLineIdx = visibleLines.findIndex(v => v.lineNum === activeTraceStep.lineNumber);
            if (traceLineIdx === -1) return null;
            const topPos = 14 + traceLineIdx * 24 - scrollTop;

            return (
              <div
                className="trace-active-line-box"
                style={{
                  position: 'absolute',
                  top: `${topPos}px`,
                  left: '2px',
                  right: '4px',
                  height: '24px',
                  border: '1.5px solid #3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  borderRadius: '5px',
                  pointerEvents: 'none',
                  zIndex: 4,
                  boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.25)',
                }}
              />
            );
          })()}

          {/* Syntax highlighted background text layer */}
          <pre
            ref={highlightRef}
            className="code-highlight-layer"
            style={ligatureStyle}
            aria-hidden="true"
          >
            <code style={ligatureStyle} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            {'\n'}
          </pre>

          {/* Interactive transparent textarea on top */}
          <textarea
            ref={textareaRef}
            value={displayCode}
            onChange={e => handleTextareaChange(e.target.value)}
            onKeyDown={e => {
              handleKeyDown(e);
              requestAnimationFrame(updateCursorAndLine);
            }}
            onClick={updateCursorAndLine}
            onKeyUp={updateCursorAndLine}
            onSelect={updateCursorAndLine}
            onPointerUp={updateCursorAndLine}
            onFocus={updateCursorAndLine}
            onScroll={handleScroll}
            className="code-textarea"
            style={ligatureStyle}
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
