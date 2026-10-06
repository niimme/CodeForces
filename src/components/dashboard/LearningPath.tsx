'use client';

import React from 'react';
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
  // Generate learning nodes strictly for coding exercises
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

  return (
    <div className="tree-container">
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
        } else if (index === 3) {
          chapterHeader = (
            <div className="chapter-marker" key="chap_2" id="chapter-2">
              <div className="chapter-pill">
                <span>⚙️</span>
                <span>Chapter 2: Simulation, State & Coordinates</span>
              </div>
            </div>
          );
        } else if (index === 7) {
          chapterHeader = (
            <div className="chapter-marker" key="chap_3" id="chapter-3">
              <div className="chapter-pill">
                <span>🔤</span>
                <span>Chapter 3: String Mastery & Sets</span>
              </div>
            </div>
          );
        } else if (index === 11) {
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
              <PathNodeCard node={node} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
