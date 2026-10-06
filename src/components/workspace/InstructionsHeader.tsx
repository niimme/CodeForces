'use client';

import React from 'react';
import Link from 'next/link';

export type WorkspaceTab = 'instructions' | 'log' | 'hints';

interface InstructionsHeaderProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  logCount?: number;
}

export const InstructionsHeader: React.FC<InstructionsHeaderProps> = ({
  activeTab,
  onSelectTab,
  logCount = 0,
}) => {
  return (
    <div className="instructions-window-header">
      {/* Tab controls matching Image 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className={`instructions-tab-btn ${activeTab === 'instructions' ? 'active' : ''}`}
          onClick={() => onSelectTab('instructions')}
          id="tab-instructions"
        >
          <span>📄</span>
          <span>Instructions</span>
        </button>

        <button
          className={`instructions-tab-btn ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => onSelectTab('log')}
          id="tab-log"
        >
          <span>📋</span>
          <span>Log</span>
          {logCount > 0 && (
            <span className="instructions-tab-badge">
              {logCount}
            </span>
          )}
        </button>

        <button
          className={`instructions-tab-btn ${activeTab === 'hints' ? 'active' : ''}`}
          onClick={() => onSelectTab('hints')}
          id="tab-hints"
        >
          <span>💡</span>
          <span>Hints</span>
        </button>
      </div>

      {/* Dashboard link button matching Image 2 */}
      <Link
        href="/"
        className="instructions-dashboard-btn"
        id="btn-nav-dashboard"
        title="Back to Learning Roadmap"
      >
        <span>Dashboard</span>
        <span>→</span>
      </Link>
    </div>
  );
};
