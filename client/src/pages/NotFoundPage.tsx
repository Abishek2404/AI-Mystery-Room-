import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕳️</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Case Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '24rem' }}>
        This case file doesn't exist or has been closed. Perhaps the evidence was tampered with?
      </p>
      <Link to="/" className="btn btn-primary">
        ← Return to Headquarters
      </Link>
    </div>
  );
}
