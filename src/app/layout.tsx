import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Codeforces Interactive Learning & Practice Platform',
  description: 'Gamified learning path and split-screen workspace for top-solved Codeforces programming challenges.',
  keywords: ['Codeforces', 'Algorithms', 'Competitive Programming', 'C++', 'Java', 'Python', 'Learning Path'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Fira+Code:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
