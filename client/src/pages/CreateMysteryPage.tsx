import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../api/index';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', icon: '🟢', desc: '3 suspects · 5 clues · 2 hints' },
  { value: 'medium', label: 'Medium', icon: '🟡', desc: '4 suspects · 7 clues · 3 hints' },
  { value: 'hard', label: 'Hard', icon: '🔴', desc: '5 suspects · 9 clues · 3 hints' },
];

export default function CreateMysteryPage() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const charCount = premise.trim().length;
  const isValid = charCount >= 20 && charCount <= 500;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError('');

    try {
      const caseData = await createCase(premise.trim(), difficulty);
      navigate(`/investigate/${caseData.id}`);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Failed to generate mystery. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📝</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Your Mystery</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Describe a fictional scenario and choose your difficulty level.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card animate-slide-up" style={{ padding: '2rem' }}>
        {/* Premise */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="premise" className="form-label">
            Your Mystery Premise
          </label>
          <textarea
            id="premise"
            className="form-input"
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            placeholder="e.g. A rare painting disappears during a locked-room exhibition at a small-town gallery..."
            rows={5}
            maxLength={500}
            disabled={loading}
            style={{ resize: 'vertical', minHeight: '8rem' }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            fontSize: '0.8rem',
          }}>
            <span style={{
              color: charCount < 20 ? 'var(--color-error)' : 'var(--color-text-muted)',
            }}>
              {charCount < 20 ? `${20 - charCount} more characters needed` : '✓ Good length'}
            </span>
            <span style={{
              color: charCount > 450 ? 'var(--color-warning)' : 'var(--color-text-muted)',
            }}>
              {charCount}/500
            </span>
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-label">Difficulty</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                disabled={loading}
                className="glass-card"
                style={{
                  padding: '1rem 0.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderColor: difficulty === d.value ? 'var(--color-accent)' : undefined,
                  boxShadow: difficulty === d.value ? '0 0 16px var(--color-accent-glow)' : undefined,
                  transition: 'all var(--transition-base)',
                }}
              >
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{d.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            background: 'var(--color-error-soft)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-error)',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={!isValid || loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} />
              Building your case and checking the evidence...
            </>
          ) : (
            '🔮 Generate Mystery'
          )}
        </button>

        <p style={{
          textAlign: 'center',
          marginTop: '1rem',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
        }}>
          Use only fictional characters and settings. Generation may take up to 30 seconds.
        </p>
      </form>
    </div>
  );
}
