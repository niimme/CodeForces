'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserProgress, Badge } from '../../types';
import { DEMO_PROFILES, INITIAL_BADGES } from '../../lib/userProgress';
import { BadgesModal } from './BadgesModal';

interface LoginProfileCardProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const LoginProfileCard: React.FC<LoginProfileCardProps> = ({ progress, onUpdateProgress }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const displayedBadges = (progress.badges || []).slice(0, 4);
  const unlockedCount = (progress.badges || []).filter(b => !!b.unlockedAt).length;
  const totalCount = (progress.badges || []).length;
  const overflowCount = Math.max(0, totalCount - displayedBadges.length);

  const getRankColor = (rank?: string) => {
    const r = (rank || '').toLowerCase();
    if (r.includes('legendary') || r.includes('grandmaster')) return { color: '#ef4444', label: 'Grandmaster' };
    if (r.includes('master')) return { color: '#f97316', label: 'Master' };
    if (r.includes('candidate')) return { color: '#a855f7', label: 'Candidate Master' };
    if (r.includes('expert')) return { color: '#3b82f6', label: 'Expert' };
    if (r.includes('specialist')) return { color: '#06b6d4', label: 'Specialist' };
    if (r.includes('pupil')) return { color: '#10b981', label: 'Pupil' };
    return { color: '#64748b', label: 'Newbie' };
  };

  const handleConnectCF = async (customHandle?: string) => {
    const targetHandle = (customHandle || handleInput).trim();
    if (!targetHandle) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      // Check if it's one of our built-in demo profiles first
      const lower = targetHandle.toLowerCase();
      if (DEMO_PROFILES[lower]) {
        const demo = DEMO_PROFILES[lower];
        onUpdateProgress({
          ...demo,
          isLoggedIn: true,
        });
        setShowLoginModal(false);
        setHandleInput('');
        return;
      }

      // Try fetching live Codeforces user info
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(targetHandle)}`);
      if (!res.ok) {
        throw new Error('Could not find Codeforces user');
      }
      const data = await res.json();
      if (data.status === 'OK' && data.result?.[0]) {
        const u = data.result[0];
        const newProfile: UserProgress = {
          userId: `cf_${u.handle}`,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.handle,
          handle: u.handle,
          avatarUrl: u.titlePhoto || u.avatar,
          rating: u.rating || 1200,
          rank: u.rank || 'Specialist',
          maxRating: u.maxRating,
          maxRank: u.maxRank,
          streakDays: 1,
          isLoggedIn: true,
          completedProblemIds: progress.completedProblemIds,
          badges: progress.badges || INITIAL_BADGES,
        };
        onUpdateProgress(newProfile);
        setShowLoginModal(false);
        setHandleInput('');
      } else {
        throw new Error(data.comment || 'Codeforces user not found');
      }
    } catch (err: any) {
      // Fallback: create local custom profile
      const fallbackProfile: UserProgress = {
        userId: `cf_${targetHandle}`,
        name: targetHandle,
        handle: targetHandle,
        isLoggedIn: true,
        rating: 1400,
        rank: 'Specialist',
        streakDays: 1,
        completedProblemIds: progress.completedProblemIds,
        badges: progress.badges || INITIAL_BADGES,
      };
      onUpdateProgress(fallbackProfile);
      setShowLoginModal(false);
      setHandleInput('');
    } finally {
      setIsLoading(false);
    }
  };

  const rankInfo = getRankColor(progress.rank);

  return (
    <>
      <div className="profile-card" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 18px rgba(0,0,0,0.04)', padding: '20px' }}>
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
                overflow: 'hidden',
              }}
            >
              {progress.avatarUrl ? (
                <img src={progress.avatarUrl} alt={progress.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (progress.name || progress.handle || 'U').charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', lineHeight: 1.2 }}>
                {progress.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: rankInfo.color }}>
                  @{progress.handle}
                </span>
                <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>
                  {progress.rank || 'Specialist'}
                </span>
              </div>
            </div>
          </div>

          <div
            className="streak-pill"
            title={`${progress.streakDays} days problem-solving streak!`}
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#ea580c',
              padding: '4px 10px',
              borderRadius: '14px',
              fontSize: '12.5px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🔥</span>
            <span>{progress.streakDays}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Rating</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: rankInfo.color, marginTop: '2px' }}>
              {progress.rating || 1540}
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Solved</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              {progress.completedProblemIds.length} / 16
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: '#f1f5f9', margin: '0 0 16px' }} />

        {/* Badges Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Badges & Achievements
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '10px' }}>
            {unlockedCount} / {totalCount}
          </span>
        </div>

        {/* Badges Preview Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          {displayedBadges.map(badge => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                onClick={() => setShowBadgesModal(true)}
                title={`${badge.name}: ${badge.description}`}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: isUnlocked ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#f1f5f9',
                  border: `1.5px solid ${isUnlocked ? '#bfdbfe' : '#e2e8f0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  filter: isUnlocked ? 'none' : 'grayscale(100%)',
                  opacity: isUnlocked ? 1 : 0.6,
                }}
              >
                <span>{badge.icon}</span>
              </div>
            );
          })}

          {overflowCount > 0 && (
            <button
              onClick={() => setShowBadgesModal(true)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="View all badges"
            >
              +{overflowCount}
            </button>
          )}
        </div>

        {/* Badges Modal Trigger Button */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            onClick={() => setShowBadgesModal(true)}
            style={{
              flex: 1,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontSize: '12.5px',
              fontWeight: 700,
              padding: '9px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            id="btn-open-badges-modal"
          >
            <span>🏆</span>
            <span>View All Badges ({totalCount})</span>
          </button>

          <Link
            href="/badges"
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#475569',
              padding: '9px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Open Dedicated Badge Page"
            id="btn-open-badge-page"
          >
            ↗
          </Link>
        </div>

        {/* Switch Account / Login button */}
        <button
          onClick={() => setShowLoginModal(true)}
          style={{
            width: '100%',
            background: 'none',
            border: '1px dashed #cbd5e1',
            color: '#64748b',
            fontSize: '12px',
            fontWeight: 600,
            padding: '7px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
          id="btn-switch-login-account"
        >
          <span>👤</span>
          <span>Switch Account / Connect CF</span>
        </button>
      </div>

      {/* Badges Modal rendered via React Portal at body level */}
      <BadgesModal
        badges={progress.badges || []}
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
      />

      {/* Connect Account / Login Modal */}
      {showLoginModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowLoginModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              color: '#0f172a',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🔑</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Connect Codeforces Account
                </h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
              Enter your official Codeforces handle to fetch your rank, rating, and avatar, or pick a demo profile.
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleConnectCF();
              }}
              style={{ marginBottom: '20px' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Codeforces Handle
                </label>
                <input
                  type="text"
                  value={handleInput}
                  onChange={e => setHandleInput(e.target.value)}
                  placeholder="e.g. tourist, petr, nicholas"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#0f172a',
                  }}
                  id="input-cf-handle"
                />
              </div>

              {loginError && (
                <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '12px' }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !handleInput.trim()}
                className="run-code-btn"
                style={{ width: '100%', padding: '10px', fontSize: '13.5px', borderRadius: '10px' }}
                id="btn-submit-cf-handle"
              >
                {isLoading ? 'Fetching CF Profile...' : 'Sign In & Sync Profile'}
              </button>
            </form>

            {/* Quick Demo Logins */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                Or select a preset account:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleConnectCF('nicholas')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Nicholas I. (@nicholas)</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Specialist • 1540 Rating • 4 Badges</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>Select &rarr;</span>
                </button>

                <button
                  onClick={() => handleConnectCF('tourist')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#ef4444' }}>Gennady (@tourist)</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Legendary Grandmaster • 3979 Rating</div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>Select &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
