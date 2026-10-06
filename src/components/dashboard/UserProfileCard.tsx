'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { UserProgress, Badge } from '../../types';

interface UserProfileCardProps {
  progress: UserProgress;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ progress }) => {
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const displayedBadges = progress.badges.slice(0, 3);
  const overflowCount = Math.max(0, progress.badges.length - displayedBadges.length);

  return (
    <>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-user-info">
            <div className="profile-avatar-frame">
              <img
                src="/images/avatar.jpg"
                alt={progress.name}
                className="profile-avatar-img"
              />
            </div>
            <div>
              <div className="profile-name">{progress.name}</div>
              <div className="profile-handle">{progress.handle}</div>
            </div>
          </div>

          <div className="streak-pill" title={`${progress.streakDays} days problem-solving streak!`}>
            <span>🔥</span>
            <span>{progress.streakDays}</span>
          </div>
        </div>

        <div className="profile-divider" />

        <div className="profile-badges-title">Badges & Achievements</div>
        <div className="badges-row">
          {displayedBadges.map(badge => (
            <div
              key={badge.id}
              className="badge-item"
              title={`${badge.name}: ${badge.description}`}
              onClick={() => setSelectedBadge(badge)}
            >
              <span>{badge.icon}</span>
            </div>
          ))}

          {overflowCount > 0 && (
            <button
              className="badge-overflow-pill"
              onClick={() => setShowBadgesModal(true)}
              title="View all badges"
            >
              +{overflowCount}
            </button>
          )}
        </div>
      </div>

      {/* Selected Badge Tooltip Modal */}
      {selectedBadge && (
        <div className="modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{selectedBadge.icon}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              {selectedBadge.name}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
              {selectedBadge.description}
            </p>
            {selectedBadge.unlockedAt ? (
              <span style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                ✓ Unlocked {selectedBadge.unlockedAt}
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                🔒 Locked &mdash; Solve more problems to unlock!
              </span>
            )}
            <div style={{ marginTop: '20px' }}>
              <button
                className="challenges-btn"
                style={{ width: 'auto', padding: '8px 24px', margin: '0 auto' }}
                onClick={() => setSelectedBadge(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Badges Modal */}
      {showBadgesModal && (
        <div className="modal-overlay" onClick={() => setShowBadgesModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                All Achievements ({progress.badges.length})
              </h3>
              <button
                onClick={() => setShowBadgesModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {progress.badges.map(b => (
                <div
                  key={b.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{b.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{b.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
