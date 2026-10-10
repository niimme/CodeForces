'use client';

import React, { useState } from 'react';
import { ProblemMetadata } from '../../types';
import { MathRenderer } from '../ui/MathRenderer';
import { WorkspaceTab } from './WorkspaceNav';

interface ProblemStatementProps {
  problem: ProblemMetadata;
  activeTab: WorkspaceTab;
  capturedLogs: string[];
  userCode: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  language?: 'cpp' | 'c' | 'kotlin' | 'java' | 'python';
}

const LOG_GUIDES = [
  {
    id: 'cpp',
    name: 'C++',
    badge: 'std::cerr',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    code: `#include <iostream>

// Stream debug outputs to cerr (separate from cout)
std::cerr << "debug: x = " << x << std::endl;`,
    description: 'Outputs to standard error without interfering with test case evaluation (stdout).',
  },
  {
    id: 'c',
    name: 'C',
    badge: 'fprintf(stderr)',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    code: `#include <stdio.h>

// Print diagnostic data to stderr
fprintf(stderr, "debug: x = %d, ans = %s\\n", x, ans);`,
    description: 'Writes directly to the stderr stream, keeping printf output pristine for judge comparison.',
  },
  {
    id: 'python',
    name: 'Python',
    badge: 'sys.stderr',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    code: `import sys

# Print to stderr stream
print(f"debug: x = {x}", file=sys.stderr)

# Or write directly:
# sys.stderr.write(f"debug: {x}\\n")`,
    description: 'Directs messages to stderr so normal print() stdout remains clean for test assertions.',
  },
  {
    id: 'java',
    name: 'Java',
    badge: 'System.err',
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    code: `// Write diagnostic messages to System.err
System.err.println("debug: x = " + x + ", ans = " + ans);`,
    description: 'Routes output to the error console without contaminating System.out.',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    badge: 'System.err',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#e9d5ff',
    code: `// Output string templates to System.err
System.err.println("debug: x = $x, ans = $ans")`,
    description: 'Emits logs safely to stderr with native Kotlin string templates.',
  },
];

const LOG_COMMANDS: Record<string, string> = {
  cpp: 'std::cerr',
  c: 'fprintf(stderr, ...)',
  python: 'print(..., file=sys.stderr)',
  java: 'System.err.println()',
  kotlin: 'System.err.println()',
};

export const ProblemStatement: React.FC<ProblemStatementProps> = ({
  problem,
  activeTab,
  capturedLogs,
  userCode,
  isMaximized = false,
  onToggleMaximize,
  language = 'cpp',
}) => {
  const [copiedLogLang, setCopiedLogLang] = useState<string | null>(null);

  const currentLang = (language || 'cpp').toLowerCase();
  const currentGuide = LOG_GUIDES.find(g => g.id.toLowerCase() === currentLang) || LOG_GUIDES[0];
  const currentLogCommand = LOG_COMMANDS[currentLang] || 'std::cerr';
  const isCopied = copiedLogLang === currentGuide.id;

  const handleCopySnippet = (snippetCode: string, langId: string) => {
    navigator.clipboard.writeText(snippetCode);
    setCopiedLogLang(langId);
    setTimeout(() => setCopiedLogLang(null), 2000);
  };

  return (
    <div className="problem-details-panel">
      {/* INSTRUCTIONS TAB */}
      {activeTab === 'instructions' && (
        <>
          <div className="problem-header">
            <div className="problem-emoji-hero" role="img" aria-label={problem.title}>
              {problem.emoji}
            </div>

            <div className="problem-meta-row">
              <span className="problem-type-tag">
                Exercise &bull; {problem.category}
              </span>
            </div>

            <h1 className="problem-title-text">
              {problem.id}. {problem.title}
            </h1>

            <div className="problem-limits-badge">
              <span>⏱️ Time: {problem.timeLimit || '1.0s'}</span>
              <span>💾 Memory: {problem.memoryLimit || '256MB'}</span>
              <span>⭐ Rating: {problem.rating}</span>
            </div>
          </div>

          <div className="section-heading">
            <span>📝</span>
            <span>Problem Statement</span>
          </div>
          <div className="statement-text">
            <MathRenderer content={problem.descriptionHtml} />
          </div>

          {problem.inputSpecificationHtml && (
            <>
              <div className="section-heading">
                <span>📥</span>
                <span>Input Specification</span>
              </div>
              <div className="statement-text">
                <MathRenderer content={problem.inputSpecificationHtml} />
              </div>
            </>
          )}

          {problem.outputSpecificationHtml && (
            <>
              <div className="section-heading">
                <span>📤</span>
                <span>Output Specification</span>
              </div>
              <div className="statement-text">
                <MathRenderer content={problem.outputSpecificationHtml} />
              </div>
            </>
          )}
        </>
      )}

      {/* LOG TAB */}
      {activeTab === 'log' && (
        <div style={{ padding: '10px 0' }}>
          {/* Header matching Scenario Log screenshot */}
          <div style={{ marginBottom: '18px' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Scenario Log</span>
              {capturedLogs.length > 0 && (
                <span
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {capturedLogs.length} line{capturedLogs.length === 1 ? '' : 's'}
                </span>
              )}
            </h2>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              This is the output from your code execution. Here you can analyse the changes you&apos;ve made. Use{' '}
              <code
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#0284c7',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  border: '1px solid #e2e8f0',
                }}
              >
                {currentLogCommand}
              </code>{' '}
              to log values.
            </p>
          </div>

          {/* Captured Logs Terminal Output OR Empty State Illustration */}
          {capturedLogs.length > 0 ? (
            <div
              style={{
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '14px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                maxHeight: '260px',
                overflowY: 'auto',
                marginBottom: '16px',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)',
              }}
            >
              {capturedLogs.map((log, i) => {
                const isError = log.includes('ERROR') || log.includes('Exception');
                const isWarn = log.includes('WARN') || log.includes('Breakpoint');
                const isDebug = log.includes('[Debugger]') || log.includes('[Test');

                return (
                  <div
                    key={i}
                    style={{
                      color: isError ? '#f87171' : isWarn ? '#fbbf24' : isDebug ? '#60a5fa' : '#38bdf8',
                      marginBottom: '4px',
                      lineHeight: 1.5,
                      wordBreak: 'break-all',
                    }}
                  >
                    <span style={{ color: '#64748b', marginRight: '8px', userSelect: 'none' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {log}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 20px 28px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  backgroundColor: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <svg
                  width="74"
                  height="74"
                  viewBox="0 0 74 74"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="18"
                    y="14"
                    width="34"
                    height="46"
                    rx="3"
                    fill="#c7d2fe"
                    transform="rotate(-8 18 14)"
                  />
                  <rect
                    x="24"
                    y="17"
                    width="34"
                    height="46"
                    rx="3"
                    fill="#ffffff"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                  <path
                    d="M30 27C32 25.5 34 28.5 36 27C38 25.5 40 28.5 42 27C44 25.5 46 28.5 48 27"
                    stroke="#818cf8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 33C32 31.5 34 34.5 36 33C38 31.5 40 34.5 42 33C44 31.5 46 34.5 48 33"
                    stroke="#818cf8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 39C32 37.5 34 40.5 36 39C38 37.5 40 40.5 42 39C44 37.5 46 40.5 48 39"
                    stroke="#818cf8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M30 45C32 43.5 34 46.5 36 45C38 43.5 40 46.5 42 45"
                    stroke="#818cf8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <g transform="translate(39, 21) rotate(42)">
                    <rect x="0" y="0" width="7" height="28" rx="1.5" fill="#ffffff" stroke="#818cf8" strokeWidth="2" />
                    <path d="M0 28L3.5 35L7 28Z" fill="#818cf8" />
                    <line x1="0" y1="6" x2="7" y2="6" stroke="#818cf8" strokeWidth="1.5" />
                  </g>
                </svg>
              </div>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#64748b',
                }}
              >
                You&apos;ve not logged anything out yet
              </div>
            </div>
          )}

          {/* Current Language Debug Logging Guide */}
          <div
            style={{
              marginTop: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                💡 Debug Logging in {currentGuide.name}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Use standard error (<strong>stderr</strong>) to print debug output. Because test evaluation only verifies standard output (<strong>stdout</strong>), stderr logging never interferes with test case correctness!
              </p>
            </div>

            {/* ONLY Current Language Button */}
            <div style={{ marginBottom: '12px' }}>
              <button
                type="button"
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1.5px solid ${currentGuide.color}`,
                  backgroundColor: currentGuide.bg,
                  color: currentGuide.color,
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                id={`tab-log-guide-${currentGuide.id}`}
              >
                <span>{currentGuide.name}</span>
                <code style={{ fontSize: '11px', opacity: 0.9 }}>{currentGuide.badge}</code>
              </button>
            </div>

            {/* Current Language Guide Card */}
            <div
              style={{
                backgroundColor: currentGuide.bg,
                border: `1px solid ${currentGuide.border}`,
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#ffffff',
                      backgroundColor: currentGuide.color,
                      padding: '2px 8px',
                      borderRadius: '5px',
                    }}
                  >
                    {currentGuide.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                    {currentGuide.badge}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySnippet(currentGuide.code, currentGuide.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: isCopied ? '#16a34a' : '#334155',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  id={`btn-copy-log-${currentGuide.id}`}
                >
                  <span>{isCopied ? '✓ Copied!' : '📋 Copy Snippet'}</span>
                </button>
              </div>

              <pre
                style={{
                  margin: '0 0 8px',
                  padding: '10px 12px',
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.45,
                  overflowX: 'auto',
                }}
              >
                {currentGuide.code}
              </pre>

              <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                {currentGuide.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
