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

export const ProblemStatement: React.FC<ProblemStatementProps> = ({
  problem,
  activeTab,
  capturedLogs,
  userCode,
  isMaximized = false,
  onToggleMaximize,
  language = 'cpp',
}) => {
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});
  const [selectedLogLang, setSelectedLogLang] = useState<string>(language);
  const [copiedLogLang, setCopiedLogLang] = useState<string | null>(null);
  const [showLogInstructions, setShowLogInstructions] = useState<boolean>(true);

  React.useEffect(() => {
    if (language) {
      setSelectedLogLang(language);
    }
  }, [language]);

  const handleCopySnippet = (snippetCode: string, langId: string) => {
    navigator.clipboard.writeText(snippetCode);
    setCopiedLogLang(langId);
    setTimeout(() => setCopiedLogLang(null), 2000);
  };

  const toggleHint = (index: number) => {
    setExpandedHints(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
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

          {problem.sampleNotesHtml && (
            <>
              <div className="section-heading">
                <span>💡</span>
                <span>Note & Analysis</span>
              </div>
              <div className="statement-text">
                <MathRenderer content={problem.sampleNotesHtml} />
              </div>
            </>
          )}
        </>
      )}

      {/* LOG TAB */}
      {activeTab === 'log' && (
        <div style={{ padding: '10px 0' }}>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span>
              <span>Console Execution Logs</span>
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
            </div>

            <button
              type="button"
              onClick={() => setShowLogInstructions(!showLogInstructions)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              id="btn-toggle-log-instructions"
            >
              <span>{showLogInstructions ? 'Hide Instructions ▲' : 'Log Instructions ▼'}</span>
            </button>
          </div>

          {/* Captured Logs Terminal Output */}
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
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📡</div>
              <p style={{ margin: 0, fontWeight: 600 }}>No runtime logs captured yet.</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Run your code to capture stderr output from any supported language below.
              </p>
            </div>
          )}

          {/* Multi-Language Logging Instructions Guide */}
          {showLogInstructions && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  💡 Debug Logging in Allowed Languages
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                  Use standard error (<strong>stderr</strong>) to print debug output. Because test evaluation only verifies standard output (<strong>stdout</strong>), stderr logging never interferes with test case correctness!
                </p>
              </div>

              {/* Language Pills Filter */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {LOG_GUIDES.map(lg => {
                  const isCurrentActive = selectedLogLang.toLowerCase() === lg.id.toLowerCase();
                  return (
                    <button
                      key={lg.id}
                      type="button"
                      onClick={() => setSelectedLogLang(lg.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        border: isCurrentActive ? `1.5px solid ${lg.color}` : '1px solid #e2e8f0',
                        backgroundColor: isCurrentActive ? lg.bg : '#f8fafc',
                        color: isCurrentActive ? lg.color : '#475569',
                        fontSize: '12px',
                        fontWeight: isCurrentActive ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                      id={`tab-log-guide-${lg.id}`}
                    >
                      <span>{lg.name}</span>
                      <code style={{ fontSize: '10.5px', opacity: 0.85 }}>{lg.badge}</code>
                    </button>
                  );
                })}
              </div>

              {/* Active Language Guide Card */}
              {(() => {
                const guide = LOG_GUIDES.find(g => g.id.toLowerCase() === selectedLogLang.toLowerCase()) || LOG_GUIDES[0];
                const isCopied = copiedLogLang === guide.id;

                return (
                  <div
                    style={{
                      backgroundColor: guide.bg,
                      border: `1px solid ${guide.border}`,
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
                            backgroundColor: guide.color,
                            padding: '2px 8px',
                            borderRadius: '5px',
                          }}
                        >
                          {guide.name}
                        </span>
                        <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                          {guide.badge}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopySnippet(guide.code, guide.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: isCopied ? '#16a34a' : '#334155',
                          borderRadius: '6px',
                          padding: '3px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        id={`btn-copy-log-${guide.id}`}
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
                      {guide.code}
                    </pre>

                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      {guide.description}
                    </p>
                  </div>
                );
              })()}

              {/* Quick Summary of All Other Allowed Languages */}
              <div style={{ marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Quick Reference for All Allowed Languages:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {LOG_GUIDES.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLogLang(item.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        fontSize: '11.5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ color: item.color }}>{item.name}</strong>
                        <code style={{ fontSize: '10px', color: '#64748b' }}>{item.badge}</code>
                      </div>
                      <div style={{ color: '#64748b', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HINTS TAB */}
      {activeTab === 'hints' && (
        <div style={{ padding: '10px 0' }}>
          <div className="section-heading">
            <span>💡</span>
            <span>Progressive Hints</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {(!problem.hints || problem.hints.length === 0) ? (
              <p style={{ color: '#64748b', fontSize: '13px' }}>No hints available for this challenge.</p>
            ) : (
              problem.hints.map((hint, i) => {
                const isExpanded = !!expandedHints[i];
                return (
                  <div
                    key={i}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => toggleHint(i)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: '#0f172a'
                      }}
                      id={`btn-hint-${i + 1}`}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>💡</span>
                        <span>Hint {i + 1}</span>
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {isExpanded ? '▲ Hide' : '▼ Reveal'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          padding: '12px 16px',
                          borderTop: '1px solid #e2e8f0',
                          background: '#ffffff',
                          fontSize: '13px',
                          color: '#334155',
                          lineHeight: 1.6
                        }}
                      >
                        {hint}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
