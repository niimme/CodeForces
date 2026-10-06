'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserProgress, saveUserProgress } from '../../lib/userProgress';
import { UserProgress, Badge } from '../../types';
import { BetaRibbon } from '../../components/dashboard/BetaRibbon';

export default function BadgesPage() {
  const [userProgress, setUserProgress] = useState<UserProgress>(getUserProgress());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setUserProgress(getUserProgress());
  }, []);

  const badges = userProgress.badges || [];
  const unlockedCount = badges.filter(b => !!b.unlockedAt).length;
  const totalCount = badges.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = badges.filter(b => {
    // Category filter
    if (selectedCategory === 'unlocked' && !b.unlockedAt) return false;
    if (selectedCategory === 'locked' && b.unlockedAt) return false;
    if (selectedCategory !== 'all' && selectedCategory !== 'unlocked' && selectedCategory !== 'locked') {
      if (b.category !== selectedCategory) return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchDesc = b.description.toLowerCase().includes(q);
      const matchReq = b.requirement?.toLowerCase().includes(q);
      const matchProblem = b.relatedProblemId?.toLowerCase().includes(q);
      return matchName || matchDesc || matchReq || matchProblem;
    }
    return true;
  });

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return { bg: '#fef3c7', text: '#b45309', border: '#fcd34d', label: 'LEGENDARY' };
      case 'epic':
        return { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe', label: 'EPIC' };
      case 'rare':
        return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd', label: 'RARE' };
      default:
        return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', label: 'COMMON' };
    }
  };

  return (
    <main className="roadmap-bg" style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <BetaRibbon />

      {/* Top Navbar */}
      <header
        style={{
          height: '64px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            className="back-dashboard-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <span>&larr;</span>
            <span>Back to Roadmap</span>
          </Link>

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
              Achievements & Badges
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="streak-pill" style={{ fontSize: '12px', padding: '4px 10px' }}>
            <span>🔥</span>
            <span>{userProgress.streakDays} Day Streak</span>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '5px 12px', borderRadius: '16px' }}>
            {unlockedCount} / {totalCount} Unlocked
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div style={{ maxWidth: '1080px', margin: '2.5rem auto 2rem', padding: '0 1.5rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '28px 32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                }}
              >
                🏆
              </div>

              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                  {userProgress.name}&apos;s Trophy Room
                </h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                  Codeforces Handle: <strong style={{ color: '#2563eb' }}>{userProgress.handle}</strong> &bull; {userProgress.rank || 'Specialist'} ({userProgress.rating || 1540})
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '10px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>{unlockedCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Unlocked</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '10px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#64748b' }}>{totalCount - unlockedCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Locked</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '10px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>{progressPct}%</div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Completion</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <span style={{ color: '#334155' }}>Milestone Progress</span>
              <span style={{ color: '#2563eb' }}>{unlockedCount} of {totalCount} Badges Acquired</span>
            </div>
            <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
                  borderRadius: '6px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'unlocked', label: `✓ Unlocked (${unlockedCount})` },
              { id: 'locked', label: `🔒 Locked (${totalCount - unlockedCount})` },
              { id: 'problem', label: 'Challenges' },
              { id: 'speed', label: 'Speed & Fast I/O' },
              { id: 'milestone', label: 'Milestones' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  background: selectedCategory === tab.id ? '#0f172a' : '#ffffff',
                  color: selectedCategory === tab.id ? '#ffffff' : '#475569',
                  border: `1px solid ${selectedCategory === tab.id ? '#0f172a' : '#cbd5e1'}`,
                  borderRadius: '20px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedCategory === tab.id ? '0 2px 8px rgba(15, 23, 42, 0.2)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search badges by name or problem..."
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '8px 14px 8px 36px',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              🔍
            </span>
          </div>
        </div>

        {/* Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {filteredBadges.map(badge => {
            const isUnlocked = !!badge.unlockedAt;
            const rarity = getRarityBadge(badge.rarity);

            return (
              <div
                key={badge.id}
                style={{
                  background: isUnlocked ? '#ffffff' : '#f8fafc',
                  border: `2px solid ${isUnlocked ? '#bfdbfe' : '#e2e8f0'}`,
                  borderRadius: '20px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  boxShadow: isUnlocked ? '0 6px 20px rgba(37, 99, 235, 0.08)' : 'none',
                  opacity: isUnlocked ? 1 : 0.9,
                  transition: 'all 0.2s ease',
                }}
                className="badge-card-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: isUnlocked ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#e2e8f0',
                      border: `1.5px solid ${isUnlocked ? '#bfdbfe' : '#cbd5e1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '30px',
                      filter: isUnlocked ? 'none' : 'grayscale(100%)',
                      boxShadow: isUnlocked ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                    }}
                  >
                    {badge.icon}
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      padding: '3px 9px',
                      borderRadius: '10px',
                      background: rarity.bg,
                      color: rarity.text,
                      border: `1px solid ${rarity.border}`,
                    }}
                  >
                    {rarity.label}
                  </span>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                    {badge.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                    {badge.description}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                    Requirement
                  </div>
                  <div style={{ color: '#1e293b', fontWeight: 600 }}>
                    {badge.requirement || badge.description}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  {isUnlocked ? (
                    <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span>✓</span>
                      <span>Unlocked {badge.unlockedAt}</span>
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <span>🔒</span>
                      <span>Locked</span>
                    </span>
                  )}

                  {badge.relatedProblemId && (
                    <Link
                      href={`/problem/${badge.relatedProblemId}`}
                      className="run-code-btn"
                      style={{
                        padding: '6px 14px',
                        fontSize: '11.5px',
                        textDecoration: 'none',
                        borderRadius: '8px',
                      }}
                    >
                      <span>Solve {badge.relatedProblemId}</span>
                      <span>&rarr;</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
