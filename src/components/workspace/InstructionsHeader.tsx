'use client';

import React from 'react';
import Link from 'next/link';
import { SupportedLanguage, UserProgress } from '../../types';

export type WorkspaceTab = 'instructions' | 'log' | 'hints';

interface InstructionsHeaderProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  logCount?: number;
  currentLanguage?: SupportedLanguage;
  onOpenSettings?: () => void;
  onOpenAccount?: () => void;
  currentUser?: UserProgress;
}

export const InstructionsHeader: React.FC<InstructionsHeaderProps> = ({
  activeTab,
  onSelectTab,
  logCount = 0,
  currentLanguage = 'cpp',
  onOpenSettings,
  onOpenAccount,
  currentUser,
}) => {
  const langDisplayMap: Record<string, string> = {
    cpp: 'C++',
    c: 'C',
    java: 'Java',
    kotlin: 'Kotlin',
    python: 'Python',
  };

  return (
    <div className="instructions-window-header">
      {/* Tab controls */}
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

      {/* Right side: Settings, User Account, and Dashboard link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onOpenSettings && (
          <button
            type="button"
            className="instructions-settings-btn"
            onClick={onOpenSettings}
            id="btn-open-workspace-settings"
            title="Configure Language, Ligatures & User Settings"
          >
            <span style={{ fontSize: '13px' }}>⚙️</span>
            <span className="ws-settings-lang-badge">
              {langDisplayMap[currentLanguage] || currentLanguage.toUpperCase()}
            </span>
          </button>
        )}

        {onOpenAccount && (
          <button
            type="button"
            className="instructions-user-btn"
            onClick={onOpenAccount}
            id="btn-open-workspace-account"
            title={currentUser?.isLoggedIn ? `@${currentUser.handle} (${currentUser.rank || 'Pupil'})` : 'Sign In / Register'}
          >
            <span className="instructions-user-avatar">
              {currentUser?.isLoggedIn
                ? (currentUser.name || currentUser.handle || 'U').charAt(0).toUpperCase()
                : '👤'}
            </span>
            <span className="instructions-user-name">
              {currentUser?.isLoggedIn ? `@${currentUser.handle}` : 'Sign In'}
            </span>
          </button>
        )}

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
    </div>
  );
};
