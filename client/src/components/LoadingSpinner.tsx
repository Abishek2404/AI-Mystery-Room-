export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '4rem 2rem',
      minHeight: '40vh',
    }}>
      <div className="spinner" style={{ width: '3rem', height: '3rem' }} />
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>{message}</p>
    </div>
  );
}
