'use client';

import React from 'react';
import Link from 'next/link';
import { LearningPathNode } from '../../types';

interface PathNodeCardProps {
  node: LearningPathNode;
}

export const PathNodeCard: React.FC<PathNodeCardProps> = ({ node }) => {
  const isCompleted = node.completed;

  const cardContent = (
    <>
      <div className="node-icon-box">
        <span>{node.emoji}</span>
      </div>

      <div className="node-content">
        <div className="node-badge-row">
          <span className="node-badge exercise-badge">
            {node.badgeLabel}
          </span>
          {node.duration && <span className="node-rating">• {node.duration}</span>}
        </div>

        <div className="node-title" title={node.title}>
          {node.title}
        </div>
        <div className="node-subtitle" title={node.subtitle}>
          {node.subtitle}
        </div>
      </div>

      {isCompleted ? (
        <div className="node-status-check" title="Completed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      ) : (
        <div className="node-status-pending" title="Not completed">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      )}
    </>
  );

  return (
    <Link
      href={`/problem/${node.problemId || '4A'}`}
      className={`node-card ${!isCompleted ? 'uncompleted' : ''}`}
      id={`node-${node.id}`}
    >
      {cardContent}
    </Link>
  );
};
