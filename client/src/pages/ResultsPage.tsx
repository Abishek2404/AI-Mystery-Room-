import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCaseResult } from '../api/index';
import type { CaseResult } from '../types/index';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<CaseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getCaseResult(id);
        setResult(data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load results.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingSpinner message="Retrieving verdict..." />;
  if (error || !result) return <ErrorMessage message={error || 'Results not available.'} />;

  const verdictColor = result.isCorrect ? 'var(--color-success)' : 'var(--color-error)';
  const verdictBg = result.isCorrect ? 'var(--color-success-soft)' : 'var(--color-error-soft)';

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Verdict Banner */}
      <div className="animate-fade-in" style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '2.5rem 2rem',
        background: verdictBg,
        border: `1px solid ${verdictColor}33`,
        borderRadius: 'var(--radius-xl)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>
          {result.isCorrect ? '🎉' : '❌'}
        </div>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 900,
          color: verdictColor,
          marginBottom: '0.5rem',
        }}>
          {result.isCorrect ? 'Case Solved!' : 'Wrong Suspect'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          {result.isCorrect
            ? 'Your deduction was spot on. Justice has been served.'
            : 'The real culprit got away this time. Review the evidence below.'}
        </p>
      </div>

      {/* Score Card */}
      <div className="glass-card-accent animate-slide-up" style={{
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Final Score
        </div>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {result.score}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1rem',
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--color-bg-glass)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: result.scoreBreakdown.basePoints > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
              +{result.scoreBreakdown.basePoints}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Base</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-info)' }}>
              +{result.scoreBreakdown.cluePoints}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Clues</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: result.scoreBreakdown.hintPenalty > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
              −{result.scoreBreakdown.hintPenalty}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Hints</div>
          </div>
        </div>
      </div>

      {/* Culprit Reveal */}
      {result.culprit && (
        <div className="glass-card animate-slide-up" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔎 The Culprit
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--color-accent-soft)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-accent)',
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-accent), #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}>
              🧑
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-accent)' }}>{result.culprit.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{result.culprit.description}</p>
            </div>
          </div>
          {result.culprit.id !== result.accusedSuspectId && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.75rem',
              background: 'var(--color-error-soft)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--color-error)',
            }}>
              You accused a different suspect.
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      <div className="glass-card animate-slide-up" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📝 Solution Explanation
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          {result.explanation}
        </p>
        {result.keyClueIds.length > 0 && (
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <strong>Key evidence:</strong> {result.keyClueIds.join(', ')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'center' }}>
        <Link to="/create" className="btn btn-primary btn-lg">
          🔮 Play Another Mystery
        </Link>
        <div style={{ marginTop: '0.75rem' }}>
          <Link to="/" className="btn btn-ghost">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
