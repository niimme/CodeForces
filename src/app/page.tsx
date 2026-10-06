'use client';

import React, { useEffect, useState } from 'react';
import { getAllProblems } from '../lib/cfScraper';
import { getUserProgress, saveUserProgress } from '../lib/userProgress';
import { ProblemMetadata, UserProgress } from '../types';
import { LoginProfileCard } from '../components/dashboard/LoginProfileCard';
import { LearningPath } from '../components/dashboard/LearningPath';
import { RoadmapNavigator } from '../components/dashboard/RoadmapNavigator';

export default function DashboardPage() {
  const [problems, setProblems] = useState<ProblemMetadata[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(getUserProgress());
  const [openConnectModal, setOpenConnectModal] = useState(false);

  useEffect(() => {
    // Load problems data
    const list = getAllProblems();
    setProblems(list);

    // Load progress from localStorage
    const saved = getUserProgress();
    setUserProgress(saved);
  }, []);

  const handleUpdateProgress = (updated: UserProgress) => {
    setUserProgress(updated);
    saveUserProgress(updated);
  };

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const completedCount = (userProgress.completedProblemIds || []).length;

  return (
    <main className="roadmap-bg">
      {/* Mobile Sticky Top App Bar (Only visible on screens <= 860px) */}
      <header className="mobile-top-bar" aria-label="Mobile Navigation">
        <div className="mobile-brand">
          <span className="mobile-brand-icon">🏆</span>
          <span className="mobile-brand-title">Codeforces 800</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="mobile-quick-stats">
            <span>🎯</span>
            <span>{completedCount}/20</span>
          </span>

          {userProgress.isLoggedIn ? (
            <button
              className="mobile-user-chip"
              onClick={() => setOpenConnectModal(true)}
              title="Manage Account"
            >
              <span style={{ color: '#2563eb' }}>@{userProgress.handle}</span>
              <span style={{ fontSize: '11px', color: '#ea580c' }}>🔥{userProgress.streakDays || 1}</span>
            </button>
          ) : (
            <button
              className="mobile-connect-btn"
              onClick={() => setOpenConnectModal(true)}
              id="btn-mobile-connect-cf"
            >
              <span>🔑</span>
              <span>Connect CF</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Quick Chapter Jump Scroller (Only visible on screens <= 860px) */}
      <nav className="mobile-chapter-pills" aria-label="Chapter Jump Navigation">
        <button className="mobile-chapter-chip" onClick={() => scrollToChapter('chapter-1')}>
          <span>🌱</span>
          <span>Ch 1: Logic</span>
        </button>
        <button className="mobile-chapter-chip" onClick={() => scrollToChapter('chapter-2')}>
          <span>⚙️</span>
          <span>Ch 2: Simulation</span>
        </button>
        <button className="mobile-chapter-chip" onClick={() => scrollToChapter('chapter-3')}>
          <span>🔤</span>
          <span>Ch 3: Strings</span>
        </button>
        <button className="mobile-chapter-chip" onClick={() => scrollToChapter('chapter-4')}>
          <span>🎯</span>
          <span>Ch 4: Greedy</span>
        </button>
      </nav>

      {/* Symmetrical 3-Column Centered Layout */}
      <div className="roadmap-grid-layout" style={{ paddingTop: '20px' }}>
        {/* Left Column: Quick Chapter Navigation (Desktop) */}
        <div className="roadmap-left-col">
          <RoadmapNavigator progress={userProgress} />
        </div>

        {/* Center Column: Perfectly Centered Vertical Learning Tree */}
        <div className="roadmap-center-col">
          <section aria-label="Learning Path Roadmap" style={{ width: '100%' }}>
            <LearningPath
              problems={problems}
              userProgress={userProgress}
              onUpdateProgress={handleUpdateProgress}
            />
          </section>
        </div>

        {/* Right Column: User Profile with Login & Badges (Desktop sidebar, mobile bottom section) */}
        <div className="roadmap-right-col">
          <aside
            style={{
              position: 'sticky',
              top: '24px',
              maxWidth: '340px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            aria-label="User Profile"
          >
            <LoginProfileCard
              progress={userProgress}
              onUpdateProgress={handleUpdateProgress}
              forceOpenModal={openConnectModal}
              onModalClose={() => setOpenConnectModal(false)}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
