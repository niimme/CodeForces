'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { UserProgress } from '../../types';
import {
  DEMO_PROFILES,
  INITIAL_BADGES,
  loginUser,
  logoutUser,
  loginWithCredentials,
  registerAccount,
} from '../../lib/userProgress';
import { BadgesModal } from './BadgesModal';

interface LoginProfileCardProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const LoginProfileCard: React.FC<LoginProfileCardProps> = ({ progress, onUpdateProgress }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Login modal tab: 'cf' | 'credentials' | 'demo'
  const [loginTab, setLoginTab] = useState<'cf' | 'credentials' | 'demo'>('cf');

  // CF handle state
  const [handleInput, setHandleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Email/Password state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [regHandleInput, setRegHandleInput] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = !!progress.isLoggedIn;
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

  const handleSignOut = () => {
    const guest = logoutUser();
    onUpdateProgress(guest);
  };

  const handleConnectCF = async (customHandle?: string) => {
    const targetHandle = (customHandle || handleInput).trim();
    if (!targetHandle) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      const lower = targetHandle.toLowerCase();
      if (DEMO_PROFILES[lower]) {
        const demo = DEMO_PROFILES[lower];
        const updated = loginUser(demo);
        onUpdateProgress(updated);
        setShowLoginModal(false);
        setHandleInput('');
        return;
      }

      // Live Codeforces user query
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(targetHandle)}`);
      if (!res.ok) throw new Error('Could not find Codeforces user');
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
          completedProblemIds: progress.completedProblemIds || [],
          badges: progress.badges || INITIAL_BADGES,
        };
        const updated = loginUser(newProfile);
        onUpdateProgress(updated);
        setShowLoginModal(false);
        setHandleInput('');
      } else {
        throw new Error(data.comment || 'Codeforces user not found');
      }
    } catch (err: any) {
      // Fallback local profile
      const fallbackProfile: UserProgress = {
        userId: `cf_${targetHandle}`,
        name: targetHandle,
        handle: targetHandle,
        isLoggedIn: true,
        rating: 1400,
        rank: 'Specialist',
        streakDays: 1,
        completedProblemIds: progress.completedProblemIds || [],
        badges: progress.badges || INITIAL_BADGES,
      };
      const updated = loginUser(fallbackProfile);
      onUpdateProgress(updated);
      setShowLoginModal(false);
      setHandleInput('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthSuccessMsg(null);

    if (isRegisterMode) {
      const res = registerAccount(emailInput, passwordInput, regHandleInput);
      if (res.success && res.user) {
        onUpdateProgress(res.user);
        setShowLoginModal(false);
        setEmailInput('');
        setPasswordInput('');
        setRegHandleInput('');
      } else {
        setLoginError(res.error || 'Registration failed.');
      }
    } else {
      const res = loginWithCredentials(emailInput, passwordInput);
      if (res.success && res.user) {
        onUpdateProgress(res.user);
        setShowLoginModal(false);
        setEmailInput('');
        setPasswordInput('');
      } else {
        setLoginError(res.error || 'Invalid email or password.');
      }
    }
  };

  const handleQuickDemo = (key: string) => {
    if (DEMO_PROFILES[key]) {
      const updated = loginUser(DEMO_PROFILES[key]);
      onUpdateProgress(updated);
      setShowLoginModal(false);
    }
  };

  const rankInfo = getRankColor(progress.rank);

  return (
    <>
      <div
        className="profile-card"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
          padding: '20px',
        }}
      >
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: isLoggedIn
                  ? 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)'
                  : '#e2e8f0',
                color: isLoggedIn ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                boxShadow: isLoggedIn ? '0 3px 10px rgba(37, 99, 235, 0.25)' : 'none',
                overflow: 'hidden',
              }}
            >
              {isLoggedIn && progress.avatarUrl ? (
                <img src={progress.avatarUrl} alt={progress.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : isLoggedIn ? (
                (progress.name || progress.handle || 'U').charAt(0).toUpperCase()
              ) : (
                '👤'
              )}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', lineHeight: 1.2 }}>
                {isLoggedIn ? progress.name : 'Guest User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isLoggedIn ? rankInfo.color : '#94a3b8' }}>
                  @{isLoggedIn ? progress.handle : 'guest'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    background: isLoggedIn ? '#f1f5f9' : '#fef2f2',
                    color: isLoggedIn ? '#64748b' : '#dc2626',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontWeight: 700,
                  }}
                >
                  {isLoggedIn ? progress.rank || 'Specialist' : 'Signed Out'}
                </span>
              </div>
            </div>
          </div>

          {isLoggedIn && (
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
          )}
        </div>

        {/* Stats Row */}
        {isLoggedIn ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Rating</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: rankInfo.color, marginTop: '2px' }}>
                {progress.rating || 1200}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Solved</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                {progress.completedProblemIds.length} / 16
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              Sign in to track your Codeforces rating, save progress, and earn achievement badges.
            </p>
          </div>
        )}

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
                  opacity: isUnlocked ? 1 : 0.45,
                  transition: 'transform 0.15s ease',
                }}
              >
                {badge.icon}
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
                border: '1.5px dashed #cbd5e1',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="View all badges"
            >
              +{overflowCount}
            </button>
          )}
        </div>

        {/* View Badges Button */}
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

        {/* Auth Action Buttons */}
        {isLoggedIn ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                flex: 1,
                background: 'none',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 600,
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              id="btn-switch-account"
            >
              <span>👤</span>
              <span>Switch CF</span>
            </button>

            <button
              onClick={handleSignOut}
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '12px',
                fontWeight: 700,
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              id="btn-sign-out"
              title="Sign Out"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                padding: '10px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
              }}
              id="btn-primary-sign-in"
            >
              <span>🔑</span>
              <span>Sign In / Connect CF</span>
            </button>

            <Link
              href="/login"
              style={{
                textAlign: 'center',
                fontSize: '11.5px',
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Open Full Login Page &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Badges Modal */}
      <BadgesModal
        badges={progress.badges || []}
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
      />

      {/* Login Portal (Rendered on document.body with max z-index to NEVER clip under cards) */}
      {mounted &&
        showLoginModal &&
        createPortal(
          <div
            className="login-modal-overlay"
            onClick={() => setShowLoginModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 9999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              className="login-modal-card"
              onClick={e => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                maxWidth: '460px',
                width: '100%',
                padding: '28px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
                color: '#0f172a',
                position: 'relative',
                animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '20px',
                    }}
                  >
                    🔑
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Account Authentication
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                      Sign in with Codeforces or credentials
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowLoginModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    fontSize: '16px',
                    color: '#64748b',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  id="btn-close-login-modal"
                >
                  ✕
                </button>
              </div>

              {/* Login Method Tabs */}
              <div
                style={{
                  display: 'flex',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '3px',
                  marginBottom: '18px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('cf');
                    setLoginError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: loginTab === 'cf' ? 800 : 600,
                    color: loginTab === 'cf' ? '#2563eb' : '#64748b',
                    background: loginTab === 'cf' ? '#ffffff' : 'transparent',
                    boxShadow: loginTab === 'cf' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Codeforces Handle
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('credentials');
                    setLoginError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: loginTab === 'credentials' ? 800 : 600,
                    color: loginTab === 'credentials' ? '#2563eb' : '#64748b',
                    background: loginTab === 'credentials' ? '#ffffff' : 'transparent',
                    boxShadow: loginTab === 'credentials' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Email & Password
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('demo');
                    setLoginError(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: loginTab === 'demo' ? 800 : 600,
                    color: loginTab === 'demo' ? '#2563eb' : '#64748b',
                    background: loginTab === 'demo' ? '#ffffff' : 'transparent',
                    boxShadow: loginTab === 'demo' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ⚡ Demo
                </button>
              </div>

              {loginError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#dc2626',
                    fontSize: '12.5px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Tab 1: Codeforces Handle */}
              {loginTab === 'cf' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Enter your Codeforces Handle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. tourist, petr, nicholas"
                      value={handleInput}
                      onChange={e => setHandleInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleConnectCF()}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      id="input-cf-handle-modal"
                    />
                  </div>

                  <button
                    onClick={() => handleConnectCF()}
                    disabled={isLoading || !handleInput.trim()}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: isLoading || !handleInput.trim() ? 'not-allowed' : 'pointer',
                      opacity: isLoading || !handleInput.trim() ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                    id="btn-confirm-cf-handle"
                  >
                    {isLoading ? <span>Verifying with Codeforces API...</span> : <span>Connect Handle &rarr;</span>}
                  </button>

                  <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                    Verified live with Codeforces Official Public API
                  </div>
                </div>
              )}

              {/* Tab 2: Email & Password */}
              {loginTab === 'credentials' && (
                <form onSubmit={handleCredentialsAuth}>
                  {isRegisterMode && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Username / Handle
                      </label>
                      <input
                        type="text"
                        placeholder="Your display handle"
                        value={regHandleInput}
                        onChange={e => setRegHandleInput(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Password (min 6 characters)
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginBottom: '12px',
                    }}
                  >
                    {isRegisterMode ? 'Create Free Account' : 'Sign In with Password'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setLoginError(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 3: Demo Profiles */}
              {loginTab === 'demo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => handleQuickDemo('nicholas')}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>Nicholas I. (@nicholas)</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Specialist • 1540 Rating • 4 Badges</div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>Select &rarr;</span>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('tourist')}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>Gennady Korotkevich (@tourist)</div>
                      <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Legendary Grandmaster • 3979 Rating</div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>Select &rarr;</span>
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
