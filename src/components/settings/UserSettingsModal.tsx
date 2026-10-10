'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SupportedLanguage, UserProgress } from '../../types';
import {
  getUserSettings,
  saveUserSettings,
  getUserProgress,
  loginUser,
  logoutUser,
  loginWithCredentials,
  registerAccount,
} from '../../lib/userProgress';

export interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'preferences' | 'profile' | 'auth';
  currentLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  editorLigatures?: boolean;
  onLigaturesChange?: (enabled: boolean) => void;
  currentUser?: UserProgress;
  onUserUpdate?: (user: UserProgress) => void;
}

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

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'preferences',
  currentLanguage,
  onLanguageChange,
  editorLigatures,
  onLigaturesChange,
  currentUser: propUser,
  onUserUpdate,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'profile' | 'auth'>(initialTab);
  const [authSubTab, setAuthSubTab] = useState<'signin' | 'register'>('signin');

  // Local settings state
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLanguage || 'cpp');
  const [ligaturesEnabled, setLigaturesEnabled] = useState<boolean>(editorLigatures ?? true);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<UserProgress>(propUser || getUserProgress());

  // Auth inputs
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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const s = getUserSettings();
      setSelectedLang(currentLanguage || s.preferredLanguage);
      setLigaturesEnabled(editorLigatures !== undefined ? editorLigatures : s.editorLigatures);
      const currentUserData = propUser || getUserProgress();
      setUser(currentUserData);
      setActiveTab(currentUserData.isLoggedIn && initialTab === 'auth' ? 'profile' : initialTab);
      setAuthError(null);
    }
  }, [isOpen, currentLanguage, editorLigatures, propUser, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    saveUserSettings({ preferredLanguage: lang });
    onLanguageChange?.(lang);
    showFeedback(`Default language set to ${LANGUAGES.find(l => l.id === lang)?.name}`);
  };

  const handleToggleLigatures = (enabled: boolean) => {
    setLigaturesEnabled(enabled);
    saveUserSettings({ editorLigatures: enabled });
    onLigaturesChange?.(enabled);
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-ligatures', enabled ? 'true' : 'false');
      if (enabled) {
        document.body.classList.remove('cf-no-ligatures');
      } else {
        document.body.classList.add('cf-no-ligatures');
      }
    }
    showFeedback(`JetBrains Mono ligatures ${enabled ? 'enabled' : 'disabled'}`);
  };

  const showFeedback = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 2400);
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
        onUserUpdate?.(res.user);
        if (res.user.preferredLanguage) {
          setSelectedLang(res.user.preferredLanguage);
          onLanguageChange?.(res.user.preferredLanguage);
        }
        if (res.user.editorLigatures !== undefined) {
          setLigaturesEnabled(res.user.editorLigatures);
          onLigaturesChange?.(res.user.editorLigatures);
        }
        setActiveTab('profile');
        showFeedback(`Signed in as @${res.user.handle}`);
      } else {
        setAuthError(res.error || 'Invalid credentials. Please try again.');
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
        onUserUpdate?.(res.user);
        setSelectedLang(registerLang);
        onLanguageChange?.(registerLang);
        setActiveTab('profile');
        showFeedback(`Account @${cleanHandle} created successfully!`);
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
    onUserUpdate?.(guest);
    showFeedback('Signed out to Guest mode.');
    setActiveTab('auth');
  };

  const rankColor = (rank?: string) => {
    const r = (rank || '').toLowerCase();
    if (r.includes('legendary') || r.includes('grandmaster')) return '#ef4444';
    if (r.includes('master')) return '#f97316';
    if (r.includes('candidate')) return '#a855f7';
    if (r.includes('expert')) return '#2563eb';
    if (r.includes('specialist')) return '#06b6d4';
    if (r.includes('pupil')) return '#10b981';
    return '#64748b';
  };

  return createPortal(
    <div
      className="settings-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="settings-modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              ⚙️
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Account Settings
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Manage coding language, typography, and account profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: 700,
              fontSize: '14px',
              transition: 'all 0.15s ease',
            }}
            title="Close"
            id="btn-close-settings-modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            padding: '6px 16px 0 16px',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'preferences' ? '2.5px solid #2563eb' : '2.5px solid transparent',
              color: activeTab === 'preferences' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'preferences' ? 700 : 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            id="tab-settings-preferences"
          >
            <span>⚡</span>
            <span>Editor & Languages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2.5px solid #2563eb' : '2.5px solid transparent',
              color: activeTab === 'profile' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'profile' ? 700 : 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            id="tab-settings-profile"
          >
            <span>👤</span>
            <span>User Profile</span>
          </button>

          {!user.isLoggedIn && (
            <button
              type="button"
              onClick={() => setActiveTab('auth')}
              style={{
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'auth' ? '2.5px solid #2563eb' : '2.5px solid transparent',
                color: activeTab === 'auth' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'auth' ? 700 : 600,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              id="tab-settings-auth"
            >
              <span>🔑</span>
              <span>Sign In / Register</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Toast feedback */}
          {saveToast && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>✓</span>
              <span>{saveToast}</span>
            </div>
          )}

          {/* TAB 1: PREFERENCES */}
          {activeTab === 'preferences' && (
            <>
              {/* Section: Programming Language */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Default Coding Language
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Selected language applies across problems and in the code editor.
                    </p>
                  </div>
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    Active: {LANGUAGES.find(l => l.id === selectedLang)?.name}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
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
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#f8faff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'none',
                        }}
                        id={`option-lang-${lang.id}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: isSelected ? '6px solid #2563eb' : '2px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              boxSizing: 'border-box',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: isSelected ? '#1e40af' : '#1e293b' }}>
                              {lang.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                              {lang.desc}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
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

              {/* Section: JetBrains Mono Ligatures */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      JetBrains Mono Ligatures
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Render programming symbols like <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>-&gt;</code>, <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>!=</code>, <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>==</code>, <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>&lt;=</code> as merged typographic glyphs.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      type="button"
                      id="btn-ligatures-on"
                      onClick={() => handleToggleLigatures(true)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: ligaturesEnabled ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: ligaturesEnabled ? '#eff6ff' : '#ffffff',
                        color: ligaturesEnabled ? '#1d4ed8' : '#64748b',
                        fontWeight: 700,
                        fontSize: '13px',
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
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: !ligaturesEnabled ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: !ligaturesEnabled ? '#eff6ff' : '#ffffff',
                        color: !ligaturesEnabled ? '#1d4ed8' : '#64748b',
                        fontWeight: 700,
                        fontSize: '13px',
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

                {/* Live Preview Box */}
                <div
                  style={{
                    marginTop: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Live JetBrains Mono Font Preview ({ligaturesEnabled ? 'Ligatures ON' : 'Ligatures OFF'})
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '13.5px',
                      lineHeight: '22px',
                      color: '#0f172a',
                      fontFeatureSettings: ligaturesEnabled ? "'liga' 1, 'calt' 1" : "'liga' 0, 'calt' 0",
                      fontVariantLigatures: ligaturesEnabled ? 'normal' : 'none',
                    }}
                  >
                    {`bool isSplittable(int w) {\n    if (w % 2 == 0 && w != 2) -> return true;\n    return (w >= 4) && (w <= 100);\n}`}
                  </pre>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: USER PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: user.isLoggedIn
                      ? 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)'
                      : '#cbd5e1',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 800,
                  }}
                >
                  {user.isLoggedIn ? (user.name || user.handle).charAt(0).toUpperCase() : '👤'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {user.isLoggedIn ? user.name : 'Guest User'}
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: rankColor(user.rank),
                        backgroundColor: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {user.rank || 'Pupil'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    @{user.handle} {user.email && `• ${user.email}`}
                  </div>
                </div>

                {user.isLoggedIn && (
                  <div
                    style={{
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#ea580c',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🔥</span>
                    <span>{user.streakDays}d</span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', background: '#ffffff' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Rating</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: rankColor(user.rank), marginTop: '4px' }}>
                    {user.rating || 1200}
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', background: '#ffffff' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Solved</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {user.completedProblemIds.length} / 20
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', background: '#ffffff' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Badges</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                    {(user.badges || []).filter(b => !!b.unlockedAt).length} / {(user.badges || []).length}
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {user.isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      borderRadius: '10px',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    id="btn-sign-out-modal"
                  >
                    🚪 Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('auth')}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    id="btn-sign-in-modal"
                  >
                    🔑 Sign In / Create Account
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUTH (SIGN IN / REGISTER / DEMO) */}
          {activeTab === 'auth' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Sub tabs */}
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
                <button
                  type="button"
                  onClick={() => { setAuthSubTab('signin'); setAuthError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: authSubTab === 'signin' ? '#ffffff' : 'transparent',
                    color: authSubTab === 'signin' ? '#0f172a' : '#64748b',
                    fontWeight: authSubTab === 'signin' ? 700 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: authSubTab === 'signin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                  id="btn-subtab-signin"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthSubTab('register'); setAuthError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: authSubTab === 'register' ? '#ffffff' : 'transparent',
                    color: authSubTab === 'register' ? '#0f172a' : '#64748b',
                    fontWeight: authSubTab === 'register' ? 700 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: authSubTab === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                  id="btn-subtab-register"
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {authError}
                </div>
              )}

              {/* SIGN IN SUB-TAB */}
              {authSubTab === 'signin' && (
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      Username, Codeforces Handle, or Email
                    </label>
                    <input
                      type="text"
                      value={signInIdentifier}
                      onChange={e => setSignInIdentifier(e.target.value)}
                      placeholder="e.g. nicholas or nicholas@codeforces.dev"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      id="input-settings-signin-identifier"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      placeholder="Enter your account password"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      id="input-settings-signin-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    style={{
                      marginTop: '6px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: authLoading ? 'wait' : 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    }}
                    id="btn-settings-submit-signin"
                  >
                    {authLoading ? 'Signing In...' : 'Sign In to Account'}
                  </button>
                </form>
              )}

              {/* REGISTER SUB-TAB */}
              {authSubTab === 'register' && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Codeforces Handle
                    </label>
                    <input
                      type="text"
                      value={registerHandle}
                      onChange={e => setRegisterHandle(e.target.value)}
                      placeholder="e.g. algorithm_champ"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box',
                      }}
                      id="input-settings-reg-handle"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box',
                      }}
                      id="input-settings-reg-email"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Password
                      </label>
                      <input
                        type="password"
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box',
                        }}
                        id="input-settings-reg-password"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={registerConfirm}
                        onChange={e => setRegisterConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box',
                        }}
                        id="input-settings-reg-confirm"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Preferred Coding Language
                    </label>
                    <select
                      value={registerLang}
                      onChange={e => setRegisterLang(e.target.value as SupportedLanguage)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                      }}
                      id="select-settings-reg-lang"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    style={{
                      marginTop: '6px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: authLoading ? 'wait' : 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    }}
                    id="btn-settings-submit-register"
                  >
                    {authLoading ? 'Creating Account...' : 'Create Account & Sign In'}
                  </button>
                </form>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Settings are saved locally and synced across problems.
          </span>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            id="btn-settings-done"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
