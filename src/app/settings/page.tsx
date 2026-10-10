'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getUserSettings,
  saveUserSettings,
  getUserProgress,
  loginUser,
  logoutUser,
  loginWithCredentials,
  registerAccount,
} from '@/lib/userProgress';
import { SupportedLanguage, UserProgress } from '@/types';

const LANGUAGES: Array<{
  id: SupportedLanguage;
  name: string;
  badge: string;
  desc: string;
  icon: string;
}> = [
  { id: 'cpp', name: 'C++ (C++20)', badge: 'Gnu C++20', desc: 'Fast execution with STL algorithms & vectors', icon: '⚡' },
  { id: 'c', name: 'C (C17 / Clang)', badge: 'Clang C17', desc: 'Pure low-level memory control & standard I/O', icon: '⚡' },
  { id: 'java', name: 'Java (OpenJDK)', badge: 'Java 21', desc: 'Object-oriented with Scanner, BigInteger & Math', icon: '☕' },
  { id: 'kotlin', name: 'Kotlin (JVM)', badge: 'Kotlin 2.0', desc: 'Modern expressive concise syntax on the JVM', icon: '🎯' },
  { id: 'python', name: 'Python 3', badge: 'Python 3.12', desc: 'Rapid prototyping with native big integers & sets', icon: '🐍' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'editor' | 'account' | 'auth'>('editor');
  const [user, setUser] = useState<UserProgress>(getUserProgress());
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('cpp');
  const [ligaturesEnabled, setLigaturesEnabled] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auth form states
  const [authSubTab, setAuthSubTab] = useState<'signin' | 'register'>('signin');
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [registerHandle, setRegisterHandle] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerLang, setRegisterLang] = useState<SupportedLanguage>('cpp');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const s = getUserSettings();
    setSelectedLang(s.preferredLanguage);
    setLigaturesEnabled(s.editorLigatures);
    setUser(getUserProgress());
  }, []);

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    saveUserSettings({ preferredLanguage: lang });
    setStatusMessage(`Default coding language saved as ${LANGUAGES.find(l => l.id === lang)?.name}.`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleToggleLigatures = (enabled: boolean) => {
    setLigaturesEnabled(enabled);
    saveUserSettings({ editorLigatures: enabled });
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-ligatures', enabled ? 'true' : 'false');
      if (enabled) {
        document.body.classList.remove('cf-no-ligatures');
      } else {
        document.body.classList.add('cf-no-ligatures');
      }
    }
    setStatusMessage(`JetBrains Mono ligatures ${enabled ? 'enabled' : 'disabled'}.`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const query = signInIdentifier.trim();
    if (!query) {
      setAuthError('Please enter your handle, username, or email.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = loginWithCredentials(query, signInPassword);
      if (res.success && res.user) {
        setUser(res.user);
        if (res.user.preferredLanguage) setSelectedLang(res.user.preferredLanguage);
        if (res.user.editorLigatures !== undefined) setLigaturesEnabled(res.user.editorLigatures);
        setActiveTab('account');
        setStatusMessage(`Welcome back, @${res.user.handle}!`);
        setTimeout(() => setStatusMessage(null), 2500);
      } else {
        setAuthError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanHandle = registerHandle.trim().replace(/^@/, '');
    const cleanEmail = registerEmail.trim();

    if (!cleanHandle || cleanHandle.length < 2) {
      setAuthError('Handle must be at least 2 characters.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (registerPassword !== registerConfirm) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = registerAccount(cleanEmail, registerPassword, cleanHandle, registerLang);
      if (res.success && res.user) {
        setUser(res.user);
        setSelectedLang(registerLang);
        setActiveTab('account');
        setStatusMessage(`Account @${cleanHandle} registered successfully!`);
        setTimeout(() => setStatusMessage(null), 2500);
      } else {
        setAuthError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    const guest = logoutUser();
    setUser(guest);
    setActiveTab('auth');
    setStatusMessage('Signed out to Guest mode.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Navigation header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '14px',
              background: '#eff6ff',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #bfdbfe',
            }}
            id="link-back-dashboard"
          >
            ← Back to Learning Roadmap
          </Link>

          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            {user.isLoggedIn ? `Logged in as @${user.handle}` : 'Guest Mode'}
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 25px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Card Header */}
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                ⚙️
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Account Settings
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Manage your default programming language, typography, and Codeforces account
                </p>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ display: 'flex', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '6px 20px 0 20px', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('editor')}
              style={{
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'editor' ? '2.5px solid #2563eb' : '2.5px solid transparent',
                color: activeTab === 'editor' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'editor' ? 700 : 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
              id="tab-page-editor"
            >
              ⚡ Editor & Language
            </button>
            <button
              onClick={() => setActiveTab('account')}
              style={{
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'account' ? '2.5px solid #2563eb' : '2.5px solid transparent',
                color: activeTab === 'account' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'account' ? 700 : 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
              id="tab-page-account"
            >
              👤 Profile
            </button>
            {!user.isLoggedIn && (
              <button
                onClick={() => setActiveTab('auth')}
                style={{
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'auth' ? '2.5px solid #2563eb' : '2.5px solid transparent',
                  color: activeTab === 'auth' ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === 'auth' ? 700 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
                id="tab-page-auth"
              >
                🔑 Sign In / Register
              </button>
            )}
          </div>

          {/* Card Body */}
          <div style={{ padding: '28px' }}>
            {statusMessage && (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}
              >
                ✓ {statusMessage}
              </div>
            )}

            {/* TAB 1: EDITOR & LANGUAGE */}
            {activeTab === 'editor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Preferred Programming Language
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                    Choose your default language for new problems and interactive code execution.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {LANGUAGES.map(lang => {
                      const isSelected = selectedLang === lang.id;
                      return (
                        <div
                          key={lang.id}
                          onClick={() => handleSelectLanguage(lang.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#f8faff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: isSelected ? '6px solid #2563eb' : '2px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '14.5px', color: isSelected ? '#1e40af' : '#0f172a' }}>
                                {lang.name}
                              </div>
                              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                                {lang.desc}
                              </div>
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                              color: isSelected ? '#1d4ed8' : '#64748b',
                            }}
                          >
                            {lang.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                        JetBrains Mono Ligatures
                      </h2>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                        Render multi-character operators like <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>-&gt;</code>, <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>!=</code>, <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>==</code>, <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>&lt;=</code> as single typographic ligatures.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        id="btn-ligatures-on"
                        onClick={() => handleToggleLigatures(true)}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '8px',
                          border: ligaturesEnabled ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: ligaturesEnabled ? '#eff6ff' : '#ffffff',
                          color: ligaturesEnabled ? '#1d4ed8' : '#64748b',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: ligaturesEnabled ? '0 1px 3px rgba(37,99,235,0.15)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {ligaturesEnabled && <span style={{ fontSize: '11px' }}>✓</span>}
                        Ligatures ON
                      </button>
                      <button
                        type="button"
                        id="btn-ligatures-off"
                        onClick={() => handleToggleLigatures(false)}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '8px',
                          border: !ligaturesEnabled ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: !ligaturesEnabled ? '#eff6ff' : '#ffffff',
                          color: !ligaturesEnabled ? '#1d4ed8' : '#64748b',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: !ligaturesEnabled ? '0 1px 3px rgba(37,99,235,0.15)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {!ligaturesEnabled && <span style={{ fontSize: '11px' }}>✓</span>}
                        Ligatures OFF
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Interactive JetBrains Mono Preview ({ligaturesEnabled ? 'Ligatures ON' : 'Ligatures OFF'})
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '14px',
                        lineHeight: '24px',
                        color: '#0f172a',
                        fontFeatureSettings: ligaturesEnabled ? "'liga' 1, 'calt' 1" : "'liga' 0, 'calt' 0",
                        fontVariantLigatures: ligaturesEnabled ? 'normal' : 'none',
                      }}
                    >
                      {`bool isSplittable(int w) {\n    if (w % 2 == 0 && w != 2) -> return true;\n    return (w >= 4) && (w <= 100);\n}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACCOUNT PROFILE */}
            {activeTab === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: user.isLoggedIn ? 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      fontWeight: 800,
                    }}
                  >
                    {user.isLoggedIn ? (user.name || user.handle).charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {user.isLoggedIn ? user.name : 'Guest User'}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
                      @{user.handle} {user.email && `• ${user.email}`}
                    </div>
                  </div>
                  {user.isLoggedIn && (
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', padding: '6px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '13px' }}>
                      🔥 {user.streakDays}d Streak
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Rating</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                      {user.rating || 1200}
                    </div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Rank</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      {user.rank || 'Pupil'}
                    </div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Solved</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                      {user.completedProblemIds.length} / 20
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  {user.isLoggedIn ? (
                    <button
                      onClick={handleSignOut}
                      style={{ flex: 1, padding: '12px 20px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                    >
                      🚪 Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('auth')}
                      style={{ flex: 1, padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                    >
                      🔑 Sign In / Create Account
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: AUTH */}
            {activeTab === 'auth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
                  <button
                    onClick={() => { setAuthSubTab('signin'); setAuthError(null); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: authSubTab === 'signin' ? '#ffffff' : 'transparent', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthSubTab('register'); setAuthError(null); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: authSubTab === 'register' ? '#ffffff' : 'transparent', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600 }}>
                    {authError}
                  </div>
                )}

                {authSubTab === 'signin' && (
                  <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Username or Email
                      </label>
                      <input
                        type="text"
                        value={signInIdentifier}
                        onChange={e => setSignInIdentifier(e.target.value)}
                        placeholder="Enter your username"
                        required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Password
                      </label>
                      <input
                        type="password"
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading}
                      style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                    >
                      {authLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>
                )}

                {authSubTab === 'register' && (
                  <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Username</label>
                      <input
                        type="text"
                        value={registerHandle}
                        onChange={e => setRegisterHandle(e.target.value)}
                        placeholder="Enter your username"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Email</label>
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={e => setRegisterEmail(e.target.value)}
                        placeholder="coder@example.com"
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Password</label>
                        <input
                          type="password"
                          value={registerPassword}
                          onChange={e => setRegisterPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Confirm</label>
                        <input
                          type="password"
                          value={registerConfirm}
                          onChange={e => setRegisterConfirm(e.target.value)}
                          placeholder="Confirm password"
                          required
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Preferred Language</label>
                      <select
                        value={registerLang}
                        onChange={e => setRegisterLang(e.target.value as SupportedLanguage)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                      >
                        {LANGUAGES.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading}
                      style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                    >
                      {authLoading ? 'Registering...' : 'Create Account'}
                    </button>
                  </form>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
