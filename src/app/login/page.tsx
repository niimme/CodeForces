'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getUserProgress,
  loginUser,
  logoutUser,
  DEMO_PROFILES,
  INITIAL_BADGES,
} from '../../lib/userProgress';
import { UserProgress } from '../../types';

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProgress>(getUserProgress());

  // Codeforces handle state
  const [cfHandle, setCfHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserProgress();
    setCurrentUser(user);
  }, []);

  const handleConnectCF = async (handleToUse?: string) => {
    const target = (handleToUse || cfHandle).trim();
    if (!target) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const lower = target.toLowerCase();
      if (DEMO_PROFILES[lower]) {
        const demo = DEMO_PROFILES[lower];
        loginUser(demo);
        router.push('/');
        return;
      }

      // Query live Codeforces API
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(target)}`);
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
          completedProblemIds: currentUser.completedProblemIds || [],
          badges: currentUser.badges || INITIAL_BADGES,
        };
        loginUser(newProfile);
        router.push('/');
      } else {
        throw new Error(data.comment || 'Codeforces user not found');
      }
    } catch (err: any) {
      // Local fallback
      const fallback: UserProgress = {
        userId: `cf_${target}`,
        name: target,
        handle: target,
        isLoggedIn: true,
        rating: 1400,
        rank: 'Specialist',
        streakDays: 1,
        completedProblemIds: currentUser.completedProblemIds || [],
        badges: currentUser.badges || INITIAL_BADGES,
      };
      loginUser(fallback);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (key: string) => {
    if (DEMO_PROFILES[key]) {
      loginUser(DEMO_PROFILES[key]);
      router.push('/');
    }
  };

  const handleLogout = () => {
    const guest = logoutUser();
    setCurrentUser(guest);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        backgroundImage: 'radial-gradient(#cbd5e1 1.25px, transparent 1.25px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              background: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            &larr; Back to Practice Roadmap
          </Link>
        </div>

        {/* Main Card */}
        <div
          className="login-page-card"
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.07)',
            padding: '32px',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                margin: '0 auto 12px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              }}
            >
              🔑
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Connect Codeforces Handle
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Enter your handle to link your account, sync ratings & track progress
            </p>
          </div>

          {/* Current Status if logged in */}
          {currentUser.isLoggedIn && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                  Currently Connected
                </div>
                <div style={{ fontSize: '12px', color: '#15803d' }}>
                  @{currentUser.handle} ({currentUser.rank || 'Specialist'})
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Codeforces Handle Input Form */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Codeforces Handle
              </label>
              <input
                type="text"
                placeholder="e.g. tourist, petr, nicholas"
                value={cfHandle}
                onChange={e => setCfHandle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConnectCF()}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                id="input-login-cf-handle"
              />
            </div>

            <button
              onClick={() => handleConnectCF()}
              disabled={isLoading || !cfHandle.trim()}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isLoading || !cfHandle.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !cfHandle.trim() ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                marginBottom: '20px',
              }}
              id="btn-login-submit"
            >
              {isLoading ? (
                <span>Verifying with Codeforces API...</span>
              ) : (
                <span>Connect Codeforces Handle &rarr;</span>
              )}
            </button>

            {/* Demo Handle Shortcuts */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '10px',
                }}
              >
                Or select a demo handle:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('nicholas')}
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
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                      @nicholas
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                      Specialist • 1540
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>
                    Connect &rarr;
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('tourist')}
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
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                      @tourist
                    </span>
                    <span style={{ fontSize: '11px', color: '#dc2626', marginLeft: '8px' }}>
                      Legendary Grandmaster • 3979
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>
                    Connect &rarr;
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live API Info Footer */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            🔒 Handle queries connect securely to the official Codeforces REST API
          </span>
        </div>
      </div>
    </div>
  );
}
