'use client';

import React, { useState } from 'react';

export const ChallengesCard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="challenges-card">
        <div className="challenges-img-container">
          <img
            src="/images/challenges-deck.jpg"
            alt="New Challenges Await"
            className="challenges-banner-img"
          />
        </div>

        <h3 className="challenges-headline">New Challenges Await!</h3>
        <p className="challenges-subtitle">
          Combine your skills and challenge yourself with curated Codeforces sets, contest simulations, and time-attack sprints.
        </p>

        <button className="challenges-btn" onClick={() => setShowModal(true)}>
          <span>Explore Challenges</span>
          <span>&rarr;</span>
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>⚡</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
                  Premium Challenge Packs
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
              Handpicked thematic challenge tracks to take you from Division 3 up to Candidate Master level.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '15px' }}>🚀 Div 3 Speed Run Track</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>15 high-speed problem drills to sharpen your reading and instant AC instincts.</div>
                </div>
                <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Active</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: '15px' }}>🧩 Dynamic Programming Vault</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>Knapsack, LCS, Digit DP, and Tree DP from 1200 to 1800 ratings.</div>
                </div>
                <span style={{ background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Unlocks at Chapter 3</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#059669', fontSize: '15px' }}>🌐 Graph Algorithms Expedition</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>BFS, DFS, Dijkstra, DSU, and Segment Trees applied to competitive challenges.</div>
                </div>
                <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
