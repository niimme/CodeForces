'use client';

import React from 'react';
import { UserProgress } from '../../types';

interface RoadmapNavigatorProps {
  progress: UserProgress;
}

export const RoadmapNavigator: React.FC<RoadmapNavigatorProps> = ({ progress }) => {
  const completedSet = new Set((progress.completedProblemIds || []).map(id => id.toUpperCase()));

  const chapters = [
    {
      id: 'chapter-1',
      title: 'Logic & Loops',
      fullTitle: 'Chapter 1: Logic & Loops',
      icon: '🌱',
      problems: ['4A', '71A', '231A', '158A', '50A'],
    },
    {
      id: 'chapter-2',
      title: 'Simulation & State',
      fullTitle: 'Chapter 2: Simulation & State',
      icon: '⚙️',
      problems: ['282A', '112A', '263A', '339A', '266A'],
    },
    {
      id: 'chapter-3',
      title: 'Strings & Logic',
      fullTitle: 'Chapter 3: Strings & Logic',
      icon: '🔤',
      problems: ['236A', '977A', '546A', '116A', '59A'],
    },
    {
      id: 'chapter-4',
      title: 'Vectors & Greedy',
      fullTitle: 'Chapter 4: Vectors & Greedy',
      icon: '🎯',
      problems: ['69A', '266B', '160A', '520A', '580A'],
    },
  ];

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <aside
      className="roadmap-left-nav"
      style={{
        position: 'sticky',
        top: '24px',
        maxWidth: '280px',
        marginLeft: 'auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
      aria-label="Chapter Navigator"
    >
      {/* Chapter Navigation Box */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '18px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🗺️</span>
            <span>Roadmap Chapters</span>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#059669',
              background: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: '10px',
            }}
          >
            {completedSet.size} Solved
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {chapters.map(chap => {
            const solvedCount = chap.problems.filter(p => completedSet.has(p)).length;
            const totalItems = chap.problems.length;
            const isCompleted = solvedCount === totalItems;

            return (
              <button
                key={chap.id}
                onClick={() => handleScrollTo(chap.id)}
                style={{
                  width: '100%',
                  background: isCompleted ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${isCompleted ? '#bbf7d0' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                className="chapter-nav-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{chap.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: isCompleted ? '#166534' : '#1e293b',
                        lineHeight: 1.2,
                      }}
                    >
                      {chap.title}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                      {chap.problems.length} exercises
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isCompleted ? '#16a34a' : '#64748b',
                    background: isCompleted ? '#dcfce7' : '#ffffff',
                    padding: '2px 7px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {solvedCount}/{totalItems}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* C++ Quick Tip Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
          borderRadius: '16px',
          border: '1px solid #dbeafe',
          padding: '14px 16px',
          fontSize: '12px',
          color: '#1e3a8a',
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⚡</span>
          <span>C++20 Fast I/O Tip</span>
        </div>
        <p style={{ color: '#475569', fontSize: '11px', lineHeight: 1.5, margin: 0 }}>
          Always disable stream sync before reading multi-line input on Codeforces:
        </p>
        <code
          style={{
            display: 'block',
            marginTop: '6px',
            padding: '6px 8px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            fontSize: '10.5px',
            color: '#1d4ed8',
            fontFamily: 'monospace',
          }}
        >
          ios::sync_with_stdio(0); cin.tie(0);
        </code>
      </div>
    </aside>
  );
};
