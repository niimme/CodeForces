import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#0f172a' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>The requested challenge or page does not exist.</p>
      <Link href="/" className="back-dashboard-btn" style={{ padding: '10px 20px', fontSize: '13px' }}>
        &larr; Back to Learning Roadmap
      </Link>
    </div>
  );
}
