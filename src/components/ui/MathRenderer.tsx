'use client';

import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Function to replace LaTeX expressions $...$ and $$...$$ with rendered KaTeX HTML
  const renderMathInHtml = (htmlText: string): string => {
    // Replace block math $$...$$
    let processed = htmlText.replace(/\$\$(.*?)\$\$/gs, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch (e) {
        return `$$${math}$$`;
      }
    });

    // Replace inline math $...$
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return `$${math}$`;
      }
    });

    // Also support Codeforces \le, \ge etc that might be unescaped
    return processed;
  };

  const parsedHtml = renderMathInHtml(content);

  return (
    <div
      className={`math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
};
