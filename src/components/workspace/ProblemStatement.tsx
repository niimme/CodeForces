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
}

export const ProblemStatement: React.FC<ProblemStatementProps> = ({
  problem,
  activeTab,
  capturedLogs,
  userCode,
  isMaximized = false,
  onToggleMaximize,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});

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

              <div className="problem-action-icons">
                <button
                  className="icon-btn"
                  onClick={() => setShowInfoModal(true)}
                  title="Problem Information & Official Link"
                  id="btn-problem-info"
                >
                  <span>ℹ️</span>
                </button>
                <button
                  className="icon-btn"
                  onClick={() => setShowAnalyticsModal(true)}
                  title="Codeforces Solved Statistics"
                  id="btn-problem-analytics"
                >
                  <span>📊</span>
                </button>
                {onToggleMaximize && (
                  <button
                    className="icon-btn"
                    onClick={onToggleMaximize}
                    title={isMaximized ? 'Restore Split Screen' : 'Maximize Problem Statement Window'}
                    id="btn-maximize-statement"
                    style={{ fontWeight: 700 }}
                  >
                    <span>{isMaximized ? '🗗' : '⛶'}</span>
                  </button>
                )}
              </div>
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
          <div className="section-heading">
            <span>📋</span>
            <span>Console Execution Logs</span>
          </div>

          {capturedLogs.length === 0 ? (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
              <p style={{ marginBottom: '8px' }}>No logs captured yet.</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Use <code>std::cerr &lt;&lt; "myVar: " &lt;&lt; x &lt;&lt; std::endl;</code> in your C++ code, then click <strong>Run Code</strong> to inspect runtime debug logs without altering standard output.
              </p>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
              {capturedLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes('ERROR') ? '#dc2626' : log.includes('WARN') ? '#d97706' : '#2563eb', marginBottom: '6px' }}>
                  {log}
                </div>
              ))}
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

      {/* Problem Info Modal */}
      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Problem Information: {problem.id}
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
              <p style={{ marginBottom: '10px' }}><strong>Official Codeforces Problem:</strong> {problem.title}</p>
              <p style={{ marginBottom: '10px' }}><strong>Category:</strong> {problem.category}</p>
              <p style={{ marginBottom: '10px' }}><strong>Difficulty Rating:</strong> {problem.rating}</p>
              <p style={{ marginBottom: '10px' }}><strong>Time Limit:</strong> {problem.timeLimit || '1.0s'}</p>
              <p style={{ marginBottom: '10px' }}><strong>Memory Limit:</strong> {problem.memoryLimit || '256MB'}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <a
                href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                View on Codeforces ↗
              </a>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="modal-overlay" onClick={() => setShowAnalyticsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Solved Statistics: {problem.id}
              </h3>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Solved</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {problem.solvedCount ? `${problem.solvedCount.toLocaleString()} users` : 'Top Solved'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Global Rating</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                    {problem.rating}
                  </div>
                </div>
              </div>

              <p style={{ color: '#64748b', fontSize: '12.5px' }}>
                This is one of the most practiced problems on Codeforces worldwide, making it essential foundational preparation for competitive programming contests.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
