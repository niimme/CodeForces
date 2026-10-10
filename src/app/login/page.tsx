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
} from '../../lib/userProgress';
import { UserProgress } from '../../types';

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProgress>(getUserProgress());
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In form state
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Register form state
  const [registerHandle, setRegisterHandle] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserProgress();
    setCurrentUser(user);
  }, []);

  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const query = signInIdentifier.trim();
    if (!query) {
      setErrorMessage('Please enter your username, handle, or email.');
      return;
    }

    setIsLoading(true);
    try {
      // Use credentials auth from userProgress
      const res = loginWithCredentials(query, signInPassword);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setSuccessMessage(`Welcome back, ${res.user.name || res.user.handle}! Redirecting...`);
        setTimeout(() => {
          router.push('/');
        }, 600);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanHandle = registerHandle.trim().replace(/^@/, '');
    const cleanEmail = registerEmail.trim();

    if (!cleanHandle || cleanHandle.length < 2) {
      setErrorMessage('Handle must be at least 2 characters long.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (registerPassword !== registerConfirm) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = registerAccount(cleanEmail, registerPassword, cleanHandle);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setSuccessMessage(`Account created! Welcome, @${res.user.handle}! Redirecting...`);
        setTimeout(() => {
          router.push('/');
        }, 600);
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const guest = logoutUser();
    setCurrentUser(guest);
    setSuccessMessage('Signed out successfully.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const getRankBadgeStyle = (rank?: string) => {
    const r = (rank || '').toLowerCase();
    if (r.includes('grandmaster')) return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' };
    if (r.includes('master')) return { bg: '#ffedd5', color: '#ea580c', border: '#fed7aa' };
    if (r.includes('specialist')) return { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc' };
    if (r.includes('pupil')) return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
    return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
  };

  const rankStyle = getRankBadgeStyle(currentUser.rank);

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
        padding: '32px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Navigation Link back */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#475569',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              background: '#ffffff',
              padding: '7px 16px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            &larr; Back to Practice Roadmap
          </Link>

          <Link
            href="/badges"
            style={{
              fontSize: '12.5px',
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            View Badges 🏆
          </Link>
        </div>

        {/* Main Authentication Card */}
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
          {/* Card Header & Brand */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 14px',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
              }}
            >
              ⚡
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Practice Portal Account
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
              Sign in to save solutions, track active streaks, and unlock achievements
            </p>
          </div>

          {/* Current Session Banner if logged in */}
          {currentUser.isLoggedIn && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '14px 16px',
                marginBottom: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '15px',
                  }}
                >
                  {(currentUser.name || currentUser.handle || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                    {currentUser.name || `@${currentUser.handle}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                      @{currentUser.handle}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        background: rankStyle.bg,
                        color: rankStyle.color,
                        border: `1px solid ${rankStyle.border}`,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        fontWeight: 700,
                      }}
                    >
                      {currentUser.rank || 'Specialist'} • {currentUser.rating || 1200}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  style={{
                    background: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  id="btn-goto-roadmap"
                >
                  Roadmap &rarr;
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  id="btn-sign-out-page"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '11px 14px',
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

          {successMessage && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '11px 14px',
                color: '#15803d',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '22px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '9px',
                background: activeTab === 'signin' ? '#ffffff' : 'transparent',
                color: activeTab === 'signin' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'signin' ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'signin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
              id="tab-btn-signin"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: '9px',
                background: activeTab === 'register' ? '#ffffff' : 'transparent',
                color: activeTab === 'register' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'register' ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
              id="tab-btn-register"
            >
              Create Account
            </button>
          </div>

          {/* TAB 1: Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Username, Handle, or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. nicholas or dev@example.com"
                  value={signInIdentifier}
                  onChange={e => setSignInIdentifier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '11px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  id="input-login-username"
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#334155',
                    }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11.5px',
                      color: '#2563eb',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    {showSignInPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '11px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  id="input-login-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !signInIdentifier.trim()}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isLoading || !signInIdentifier.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !signInIdentifier.trim() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                  marginBottom: '18px',
                }}
                id="btn-login-submit"
              >
                {isLoading ? <span>Signing In...</span> : <span>Sign In &rarr;</span>}
              </button>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '11.5px',
                  color: '#64748b',
                  lineHeight: 1.4,
                }}
              >
                💡 <strong>Quick Access:</strong> Built-in handles like <code>nicholas</code> or <code>tourist</code> require no password. Registered accounts use the password you created.
              </div>
            </form>
          )}

          {/* TAB 2: Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Desired Username / Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. coder_pro, alice, dev101"
                  value={registerHandle}
                  onChange={e => setRegisterHandle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '11px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  id="input-register-handle"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '11px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  id="input-register-email"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#334155',
                    }}
                  >
                    Password (min. 6 characters)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11.5px',
                      color: '#2563eb',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    {showRegisterPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={e => setRegisterPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '11px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  id="input-register-password"
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={registerConfirm}
                  onChange={e => setRegisterConfirm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '11px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  id="input-register-confirm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !registerHandle.trim() || !registerEmail.trim() || !registerPassword}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.28)',
                }}
                id="btn-register-submit"
              >
                {isLoading ? <span>Creating Account...</span> : <span>Create Account & Sign In &rarr;</span>}
              </button>
            </form>
          )}

        </div>

        {/* Footer info note */}
        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            🔒 Local practice account • No external Codeforces dependency required
          </span>
        </div>
      </div>
    </div>
  );
}
