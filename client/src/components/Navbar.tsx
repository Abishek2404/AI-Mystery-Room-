import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="relative z-10" style={{
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(10, 12, 20, 0.8)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>🔍</span>
          <span className="font-display" style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            AI Mystery Room
          </span>
        </Link>
        {!isHome && (
          <Link to="/" className="btn btn-ghost btn-sm">
            ← Home
          </Link>
        )}
      </div>
    </nav>
  );
}
