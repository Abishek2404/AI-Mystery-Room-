import { Link } from 'react-router-dom';

const DIFFICULTY_INFO = [
  {
    name: 'Easy',
    icon: '🟢',
    suspects: 3,
    clues: 5,
    hints: 2,
    desc: 'Perfect for beginners. Fewer suspects, more clues.',
    color: 'var(--color-success)',
    bg: 'var(--color-success-soft)',
  },
  {
    name: 'Medium',
    icon: '🟡',
    suspects: 4,
    clues: 7,
    hints: 3,
    desc: 'A balanced challenge. More suspects, deeper investigation.',
    color: 'var(--color-accent)',
    bg: 'var(--color-accent-soft)',
  },
  {
    name: 'Hard',
    icon: '🔴',
    suspects: 5,
    clues: 9,
    hints: 3,
    desc: 'Expert-level deduction. Many suspects, complex evidence.',
    color: 'var(--color-error)',
    bg: 'var(--color-error-soft)',
  },
];

const HOW_TO_PLAY = [
  { step: '1', icon: '✍️', title: 'Create a Premise', desc: 'Describe a fictional scenario for your mystery.' },
  { step: '2', icon: '🔎', title: 'Investigate', desc: 'Examine suspects, discover clues, and request hints.' },
  { step: '3', icon: '👆', title: 'Accuse', desc: 'Choose who you think is guilty and make your accusation.' },
  { step: '4', icon: '⭐', title: 'Get Your Score', desc: 'See the verdict, explanation, and your final score.' },
];

export default function HomePage() {
  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero */}
      <section className="animate-fade-in" style={{
        textAlign: 'center',
        padding: '4rem 1rem 3rem',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕵️</div>
        <h1 className="font-display" style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 900,
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #f9fafb 0%, #fbbf24 50%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
        }}>
          AI Mystery Room
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: 'var(--color-text-secondary)',
          maxWidth: '40rem',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Create a fictional mystery from your own premise, investigate AI-generated evidence,
          interrogate suspects, and crack the case.
        </p>
        <Link to="/create" className="btn btn-primary btn-lg animate-pulse-glow">
          🔍 Start a Mystery
        </Link>
      </section>

      {/* Difficulty Cards */}
      <section style={{ padding: '2rem 0' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '2rem',
          color: 'var(--color-text-secondary)',
        }}>
          Choose Your Challenge
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }} className="stagger-children">
          {DIFFICULTY_INFO.map((d) => (
            <div key={d.name} className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{d.icon}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: d.color }}>{d.name}</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {d.desc}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem',
                padding: '0.75rem',
                background: d.bg,
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: d.color }}>{d.suspects}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Suspects</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: d.color }}>{d.clues}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Clues</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: d.color }}>{d.hints}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Hints</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Play */}
      <section style={{ padding: '3rem 0' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '2rem',
          color: 'var(--color-text-secondary)',
        }}>
          How to Play
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
        }} className="stagger-children">
          {HOW_TO_PLAY.map((s) => (
            <div key={s.step} className="glass-card" style={{
              padding: '1.5rem',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-0.75rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '1.5rem',
                height: '1.5rem',
                background: 'linear-gradient(135deg, var(--color-accent), #d97706)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#0a0c14',
              }}>
                {s.step}
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem', marginTop: '0.5rem' }}>{s.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
