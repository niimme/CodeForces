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

  return (
    <main className="roadmap-bg">
      {/* Symmetrical 3-Column Centered Layout */}
      <div className="roadmap-grid-layout" style={{ paddingTop: '24px' }}>
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

        {/* Right Column: User Profile with Login & Badges */}
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
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
