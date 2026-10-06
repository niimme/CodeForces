'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Badge } from '../../types';

interface BadgesModalProps {
  badges: Badge[];
  isOpen: boolean;
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ badges, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBadge) {
          setSelectedBadge(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, selectedBadge, onClose]);

  if (!isOpen || !mounted) return null;

  const unlockedCount = badges.filter(b => !!b.unlockedAt).length;
  const totalCount = badges.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = badges.filter(b => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') return !!b.unlockedAt;
    if (selectedCategory === 'locked') return !b.unlockedAt;
    return b.category === selectedCategory;
  });

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', border: '#fcd34d', label: 'LEGENDARY' };
      case 'epic':
        return { bg: 'rgba(147, 51, 234, 0.12)', text: '#9333ea', border: '#d8b4fe', label: 'EPIC' };
      case 'rare':
        return { bg: 'rgba(37, 99, 235, 0.12)', text: '#2563eb', border: '#bfdbfe', label: 'RARE' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: '#a7f3d0', label: 'COMMON' };
    }
  };

  const modalContent = (
    <div
      className="modal-overlay fixed-portal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="modal-content badges-dialog-card"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          color: '#0f172a',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '28px' }}>🏆</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                All Badges & Achievements
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
              Master foundational algorithmic concepts, solve roadmap challenges, and unlock badges.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/badges"
              className="badge-page-link-btn"
              onClick={onClose}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '7px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Full Page</span>
              <span>↗</span>
            </Link>

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress & Category Filter Bar */}
        <div style={{ padding: '16px 28px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
              Unlocked {unlockedCount} of {totalCount} Badges
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}>
              {progressPct}% Completed
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'unlocked', label: `✓ Unlocked (${unlockedCount})` },
              { id: 'locked', label: `🔒 Locked (${totalCount - unlockedCount})` },
              { id: 'problem', label: 'Challenges' },
              { id: 'speed', label: 'Speed & I/O' },
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
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredBadges.map(b => {
              const isUnlocked = !!b.unlockedAt;
              const rarity = getRarityColor(b.rarity);

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  style={{
                    background: isUnlocked ? '#ffffff' : '#fafafa',
                    border: `1.5px solid ${isUnlocked ? '#bfdbfe' : '#e2e8f0'}`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isUnlocked ? '0 4px 14px rgba(37, 99, 235, 0.06)' : 'none',
                    opacity: isUnlocked ? 1 : 0.85,
                  }}
                  className="badge-card-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: isUnlocked ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#f1f5f9',
                        border: `1px solid ${isUnlocked ? '#bfdbfe' : '#e2e8f0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '26px',
                        filter: isUnlocked ? 'none' : 'grayscale(80%)',
                      }}
                    >
                      {b.icon}
                    </div>

                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        padding: '2px 8px',
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
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      {b.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
                      {b.description}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                    {isUnlocked ? (
                      <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>✓</span>
                        <span>Unlocked {b.unlockedAt}</span>
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>🔒</span>
                        <span>{b.requirement || 'Locked'}</span>
                      </span>
                    )}

                    {b.relatedProblemId && !isUnlocked && (
                      <Link
                        href={`/problem/${b.relatedProblemId}`}
                        onClick={onClose}
                        style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}
                      >
                        Solve →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Badge Detail Popup */}
      {selectedBadge && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 100001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedBadge(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>{selectedBadge.icon}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              {selectedBadge.name}
            </h3>
            <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '16px' }}>
              {selectedBadge.description}
            </p>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '12px' }}>
              <div style={{ color: '#64748b', marginBottom: '4px' }}>Unlock Requirement:</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                {selectedBadge.requirement || selectedBadge.description}
              </div>
            </div>

            {selectedBadge.unlockedAt ? (
              <div style={{ color: '#059669', background: '#ecfdf5', padding: '8px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, marginBottom: '16px' }}>
                ✓ Unlocked on {selectedBadge.unlockedAt}
              </div>
            ) : (
              <div style={{ color: '#64748b', background: '#f1f5f9', padding: '8px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px' }}>
                🔒 Currently Locked
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setSelectedBadge(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>

              {selectedBadge.relatedProblemId && (
                <Link
                  href={`/problem/${selectedBadge.relatedProblemId}`}
                  onClick={() => {
                    setSelectedBadge(null);
                    onClose();
                  }}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    padding: '9px 20px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Solve {selectedBadge.relatedProblemId}</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};
