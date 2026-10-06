'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProblems } from '../lib/cfScraper';
import { getUserProgress, saveUserProgress } from '../lib/userProgress';
import { ProblemMetadata, UserProgress } from '../types';
import { BetaRibbon } from '../components/dashboard/BetaRibbon';
import { LoginProfileCard } from '../components/dashboard/LoginProfileCard';
import { ChallengesCard } from '../components/dashboard/ChallengesCard';
import { LearningPath } from '../components/dashboard/LearningPath';
import { RoadmapNavigator } from '../components/dashboard/RoadmapNavigator';

export default function DashboardPage() {
  const [problems, setProblems] = useState<ProblemMetadata[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(getUserProgress());

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

  const unlockedBadges = (userProgress.badges || []).filter(b => !!b.unlockedAt).length;
  const totalBadges = (userProgress.badges || []).length;

  return (
    <main className="roadmap-bg">
      {/* Corner Beta Ribbon */}
      <BetaRibbon />

      {/* Top Navbar */}
      <header
        style={{
          height: '64px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '18px',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.28)'
            }}
          >
            CF
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Codeforces Interactive
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              Top-Solved Mastery Roadmap
            </div>
          </div>
        </div>

        {/* Right Header Navigation & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Direct link to Badges Page */}
          <Link
            href="/badges"
            className="nav-badges-pill"
            id="nav-link-badges"
            title="View all badges and achievements"
          >
            <span>🏆</span>
            <span>Badges</span>
            <span
              style={{
                fontSize: '11px',
                background: '#dbeafe',
                color: '#1e40af',
                padding: '1px 6px',
                borderRadius: '8px',
                marginLeft: '2px',
              }}
            >
              {unlockedBadges}/{totalBadges}
            </span>
          </Link>

          {/* Solved Problems Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#059669',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '5px 12px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '12.5px',
            }}
          >
            <span>✓</span>
            <span>{userProgress.completedProblemIds.length} / 16 Solved</span>
          </div>
        </div>
      </header>

      {/* Symmetrical 3-Column Centered Layout */}
      <div className="roadmap-grid-layout">
        {/* Left Column: Quick Chapter Navigation */}
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

        {/* Right Column: User Profile with Login & Challenges */}
        <div className="roadmap-right-col">
          <aside
            style={{
              position: 'sticky',
              top: '88px',
              maxWidth: '340px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            aria-label="User Profile and Daily Challenges"
          >
            <LoginProfileCard
              progress={userProgress}
              onUpdateProgress={handleUpdateProgress}
            />
            <ChallengesCard />
          </aside>
        </div>
      </div>
    </main>
  );
}
