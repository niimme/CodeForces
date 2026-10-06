'use client';

import React, { useState } from 'react';
import { LearningPathNode, ProblemMetadata, UserProgress } from '../../types';
import { PathNodeCard } from './PathNodeCard';

interface LearningPathProps {
  problems: ProblemMetadata[];
  userProgress: UserProgress;
  onUpdateProgress: (progress: UserProgress) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  problems,
  userProgress,
  onUpdateProgress,
}) => {
  const [selectedConcept, setSelectedConcept] = useState<LearningPathNode | null>(null);

  // Generate learning nodes combining exercises and concepts
  const completedSet = new Set(userProgress.completedProblemIds.map(id => id.toUpperCase()));

  const nodes: LearningPathNode[] = [
    // --- CHAPTER 1 ---
    {
      id: 'node_4A',
      type: 'exercise',
      problemId: '4A',
      title: '4A. Watermelon',
      subtitle: 'Pete & Billy division • Math & Parity',
      emoji: '🍉',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('4A'),
    },
    {
      id: 'concept_complexity',
      type: 'concept',
      title: 'Time Complexity & The 10⁸ Operations Rule',
      subtitle: 'Estimating Big-O limits for 1.0s time budgets',
      emoji: '⚡',
      badgeLabel: '💡 Concept',
      duration: '3 min read',
      completed: true,
      summary: 'In Codeforces, an operation budget of ~10^8 elementary instructions runs within 1 second. When N <= 10^5, aim for O(N) or O(N log N). When N <= 1000, O(N^2) passes. For N <= 100, even O(N^3) is acceptable!',
    },
    {
      id: 'node_71A',
      type: 'exercise',
      problemId: '71A',
      title: '71A. Way Too Long Words',
      subtitle: 'String length filtering & abbreviation format',
      emoji: '🔤',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('71A'),
    },
    {
      id: 'node_231A',
      type: 'exercise',
      problemId: '231A',
      title: '231A. Team',
      subtitle: 'Consensus voting of three friends • Brute Force',
      emoji: '👥',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('231A'),
    },

    // --- CHAPTER 2 ---
    {
      id: 'node_282A',
      type: 'exercise',
      problemId: '282A',
      title: '282A. Bit++',
      subtitle: 'Variable mutation simulation • Implementation',
      emoji: '💻',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('282A'),
    },
    {
      id: 'node_158A',
      type: 'exercise',
      problemId: '158A',
      title: '158A. Next Round',
      subtitle: 'Filtering qualifying cutoff scores • Arrays',
      emoji: '🏁',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('158A'),
    },
    {
      id: 'concept_fast_io',
      type: 'concept',
      title: 'Fast I/O & Clean Parsing Habits',
      subtitle: 'Handling multiline test cases without timeouts',
      emoji: '🚀',
      badgeLabel: '💡 Concept',
      duration: '3 min read',
      completed: false,
      summary: 'Reading large volumes of numbers on Codeforces requires fast buffering. In C++, use ios_base::sync_with_stdio(false); cin.tie(NULL);. In Python, use sys.stdin.read().split(). In JavaScript, process buffers in chunks.',
    },
    {
      id: 'node_50A',
      type: 'exercise',
      problemId: '50A',
      title: '50A. Domino piling',
      subtitle: '2x1 tiling on rectangular boards • Math / Geometry',
      emoji: '🁓',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('50A'),
    },
    {
      id: 'node_263A',
      type: 'exercise',
      problemId: '263A',
      title: '263A. Beautiful Matrix',
      subtitle: 'Manhattan distance centering • 2D Matrices',
      emoji: '🔲',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('263A'),
    },

    // --- CHAPTER 3 ---
    {
      id: 'node_112A',
      type: 'exercise',
      problemId: '112A',
      title: '112A. Petya and Strings',
      subtitle: 'Case-insensitive lexicographical ordering',
      emoji: '🔡',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('112A'),
    },
    {
      id: 'node_236A',
      type: 'exercise',
      problemId: '236A',
      title: '236A. Boy or Girl',
      subtitle: 'Distinct character frequency • Hash Sets',
      emoji: '🚻',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('236A'),
    },
    {
      id: 'node_339A',
      type: 'exercise',
      problemId: '339A',
      title: '339A. Helpful Maths',
      subtitle: 'Rearranging summands • Sorting & Strings',
      emoji: '➕',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('339A'),
    },
    {
      id: 'node_281A',
      type: 'exercise',
      problemId: '281A',
      title: '281A. Word Capitalization',
      subtitle: 'ASCII casing manipulation • String slicing',
      emoji: '🔠',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('281A'),
    },

    // --- CHAPTER 4 ---
    {
      id: 'node_791A',
      type: 'exercise',
      problemId: '791A',
      title: '791A. Bear and Big Brother',
      subtitle: 'Exponential growth simulation • Loops',
      emoji: '🐻',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('791A'),
    },
    {
      id: 'node_617A',
      type: 'exercise',
      problemId: '617A',
      title: '617A. Elephant',
      subtitle: 'Greedy jump sizes • Modular arithmetic',
      emoji: '🐘',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('617A'),
    },
    {
      id: 'node_977A',
      type: 'exercise',
      problemId: '977A',
      title: '977A. Wrong Subtraction',
      subtitle: 'Tanya subtraction algorithm • Base-10 Digits',
      emoji: '➖',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('977A'),
    },
    {
      id: 'node_266A',
      type: 'exercise',
      problemId: '266A',
      title: '266A. Stones on the Table',
      subtitle: 'Adjacent duplicate filtering • Greedy',
      emoji: '💎',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('266A'),
    },
    {
      id: 'node_546A',
      type: 'exercise',
      problemId: '546A',
      title: '546A. Soldier and Bananas',
      subtitle: 'Arithmetic progression sum • Math',
      emoji: '🍌',
      badgeLabel: '📝 Exercise',
      duration: '800 Rating',
      completed: completedSet.has('546A'),
    },
  ];

  // Scroll to active/first uncompleted node
  const handleScrollToNext = () => {
    const firstUncompleted = nodes.find(n => !n.completed);
    if (firstUncompleted) {
      const element = document.getElementById(`node-${firstUncompleted.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleToggleConceptCompleted = (nodeId: string) => {
    // Toggle in completed list
    const updatedIds = completedSet.has(nodeId)
      ? userProgress.completedProblemIds.filter(id => id !== nodeId)
      : [...userProgress.completedProblemIds, nodeId];

    const updated = {
      ...userProgress,
      completedProblemIds: updatedIds,
    };
    onUpdateProgress(updated);
    if (selectedConcept) {
      setSelectedConcept({
        ...selectedConcept,
        completed: !completedSet.has(nodeId),
      });
    }
  };

  return (
    <div className="tree-container">
      {/* Top Journey Ribbon Tag */}
      <div style={{ textAlign: 'center' }}>
        <div className="journey-tag">
          <span>🚩</span>
          <span>The Start of your Journey</span>
        </div>
      </div>

      {/* Vertical Connecting Line */}
      <div className="tree-vertical-line" />

      {/* Nodes list with chapter milestones */}
      {nodes.map((node, index) => {
        let chapterHeader = null;
        if (index === 0) {
          chapterHeader = (
            <div className="chapter-marker" key="chap_1" id="chapter-1">
              <div className="chapter-pill">
                <span>🌱</span>
                <span>Chapter 1: The Basics of Logic & Loops</span>
              </div>
            </div>
          );
        } else if (index === 4) {
          chapterHeader = (
            <div className="chapter-marker" key="chap_2" id="chapter-2">
              <div className="chapter-pill">
                <span>⚙️</span>
                <span>Chapter 2: Simulation, State & Coordinates</span>
              </div>
            </div>
          );
        } else if (index === 9) {
          chapterHeader = (
            <div className="chapter-marker" key="chap_3" id="chapter-3">
              <div className="chapter-pill">
                <span>🔤</span>
                <span>Chapter 3: String Mastery & Sets</span>
              </div>
            </div>
          );
        } else if (index === 13) {
          chapterHeader = (
            <div className="chapter-marker" key="chap_4" id="chapter-4">
              <div className="chapter-pill">
                <span>🎯</span>
                <span>Chapter 4: Greedy Choices & Arithmetic</span>
              </div>
            </div>
          );
        }

        return (
          <React.Fragment key={node.id}>
            {chapterHeader}
            <div className="tree-node-wrapper">
              <PathNodeCard
                node={node}
                onOpenConcept={n => setSelectedConcept(n)}
              />
            </div>
          </React.Fragment>
        );
      })}

      {/* Floating Action Controls: Scroll Down Button (v) */}
      <button
        className="floating-scroll-btn"
        onClick={handleScrollToNext}
        title="Jump to next challenge"
        aria-label="Scroll to next active challenge"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Concept Reader Modal (No Video Placeholders) */}
      {selectedConcept && (
        <div className="modal-overlay" onClick={() => setSelectedConcept(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '30px' }}>{selectedConcept.emoji}</span>
                <div>
                  <span className="node-badge concept-badge" style={{ marginBottom: '4px' }}>
                    {selectedConcept.badgeLabel}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                    {selectedConcept.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedConcept(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Concept Reader Highlight Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '22px',
                marginBottom: '20px',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
                  fontSize: '26px'
                }}
              >
                📖
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                Competitive Programming Concept Guide
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                Estimated reading time: {selectedConcept.duration}
              </div>
            </div>

            <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Key Takeaways & Codeforces Rules of Thumb:
              </div>
              <p>{selectedConcept.summary}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setSelectedConcept(null)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                Close
              </button>
              <button
                onClick={() => handleToggleConceptCompleted(selectedConcept.id)}
                style={{
                  background: selectedConcept.completed ? '#238636' : '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {selectedConcept.completed ? '✓ Completed' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
