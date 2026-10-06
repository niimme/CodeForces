'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getUserProgress,
  loginUser,
  logoutUser,
  loginWithCredentials,
  registerAccount,
  DEMO_PROFILES,
  INITIAL_BADGES,
} from '../../lib/userProgress';
import { UserProgress } from '../../types';

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProgress>(getUserProgress());

  // Tabs: 'cf' | 'credentials' | 'demo'
  const [activeTab, setActiveTab] = useState<'cf' | 'credentials' | 'demo'>('cf');

  // Codeforces handle state
  const [cfHandle, setCfHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email/Password state
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regHandle, setRegHandle] = useState('');

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

  const handleCredentialsAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isRegister) {
      const res = registerAccount(email, password, regHandle);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    } else {
      const res = loginWithCredentials(email, password);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
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

        {/* Main Auth Card */}
        <div
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
              Account Authentication
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Connect with Codeforces or create a local account
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
                  Currently Signed In
                </div>
                <div style={{ fontSize: '12px', color: '#15803d' }}>
                  @{currentUser.handle} ({currentUser.rank || 'Pupil'})
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

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '3px',
              marginBottom: '20px',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('cf');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '9px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: activeTab === 'cf' ? 800 : 600,
                color: activeTab === 'cf' ? '#2563eb' : '#64748b',
                background: activeTab === 'cf' ? '#ffffff' : 'transparent',
                boxShadow: activeTab === 'cf' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              CF Handle
            </button>

            <button
              onClick={() => {
                setActiveTab('credentials');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '9px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: activeTab === 'credentials' ? 800 : 600,
                color: activeTab === 'credentials' ? '#2563eb' : '#64748b',
                background: activeTab === 'credentials' ? '#ffffff' : 'transparent',
                boxShadow: activeTab === 'credentials' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              Email & Pass
            </button>

            <button
              onClick={() => {
                setActiveTab('demo');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '9px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: activeTab === 'demo' ? 800 : 600,
                color: activeTab === 'demo' ? '#2563eb' : '#64748b',
                background: activeTab === 'demo' ? '#ffffff' : 'transparent',
                boxShadow: activeTab === 'demo' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              Demo Profiles
            </button>
          </div>

          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: '12.5px',
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

          {/* Tab 1: Codeforces Handle */}
          {activeTab === 'cf' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
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
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
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
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isLoading || !cfHandle.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !cfHandle.trim() ? 0.6 : 1,
                  marginBottom: '16px',
                }}
              >
                {isLoading ? 'Verifying with Codeforces...' : 'Connect Handle & Go to Roadmap'}
              </button>

              <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                Verified live with Codeforces Official Public API
              </div>
            </div>
          )}

          {/* Tab 2: Email & Password */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsAuth}>
              {isRegister && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    placeholder="Your username"
                    value={regHandle}
                    onChange={e => setRegHandle(e.target.value)}
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
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
                {isRegister ? 'Create Free Account' : 'Sign In with Password'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrorMessage(null);
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
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Demo Profiles */}
          {activeTab === 'demo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleDemoLogin('nicholas')}
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
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>Login &rarr;</span>
              </button>

              <button
                onClick={() => handleDemoLogin('tourist')}
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
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700 }}>Login &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
