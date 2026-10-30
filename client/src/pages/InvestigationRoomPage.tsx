import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCase, discoverClue, requestHint, accuse } from '../api/index';
import type { CasePublic, ClueSummary } from '../types/index';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

/* ================ SuspectCard ================ */
function SuspectCard({
  suspect,
  selected,
  onSelect,
  disabled,
}: {
  suspect: CasePublic['suspects'][0];
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className="glass-card"
      style={{
        padding: '1.25rem',
        textAlign: 'left',
        cursor: disabled ? 'default' : 'pointer',
        width: '100%',
        borderColor: selected ? 'var(--color-accent)' : undefined,
        boxShadow: selected ? '0 0 20px var(--color-accent-glow)' : undefined,
        transition: 'all var(--transition-base)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-accent-soft), rgba(59,130,246,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
        }}>
          🧑
        </div>
        <div>
          <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{suspect.name}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{suspect.description}</p>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        <p><strong style={{ color: 'var(--color-text-accent)' }}>Motive:</strong> {suspect.motive}</p>
        <p style={{ marginTop: '0.25rem' }}><strong style={{ color: 'var(--color-info)' }}>Alibi:</strong> {suspect.alibi}</p>
      </div>
      {selected && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.375rem 0.75rem',
          background: 'var(--color-accent-soft)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-accent)',
          display: 'inline-block',
        }}>
          ✓ Selected for accusation
        </div>
      )}
    </button>
  );
}

/* ================ ClueCard ================ */
function ClueCard({
  clue,
  onDiscover,
  discovering,
}: {
  clue: ClueSummary;
  onDiscover: () => void;
  discovering: boolean;
}) {
  return (
    <div className="glass-card" style={{
      padding: '1rem 1.25rem',
      borderColor: clue.discovered ? 'rgba(16, 185, 129, 0.2)' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1rem' }}>{clue.discovered ? '🔓' : '🔒'}</span>
            <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{clue.title}</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>📍 {clue.location}</p>
        </div>
        {!clue.discovered && (
          <button
            onClick={onDiscover}
            disabled={discovering}
            className="btn btn-secondary btn-sm"
          >
            {discovering ? '...' : 'Examine'}
          </button>
        )}
      </div>
      {clue.discovered && clue.content && (
        <div className="animate-fade-in" style={{
          marginTop: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'var(--color-success-soft)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          color: 'var(--color-text-primary)',
          lineHeight: 1.6,
          borderLeft: '3px solid var(--color-success)',
        }}>
          {clue.content}
        </div>
      )}
    </div>
  );
}

/* ================ AccusationModal ================ */
function AccusationModal({
  suspectName,
  onConfirm,
  onCancel,
  loading,
}: {
  suspectName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Confirm accusation">
      <div className="modal">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Final Accusation
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
            You are accusing <strong style={{ color: 'var(--color-accent)' }}>{suspectName}</strong>.
          </p>
          <p style={{
            color: 'var(--color-error)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            padding: '0.75rem',
            background: 'var(--color-error-soft)',
            borderRadius: 'var(--radius-sm)',
          }}>
            ⚠️ This will end your investigation. You cannot change your answer.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button onClick={onConfirm} className="btn btn-danger" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                  Submitting...
                </>
              ) : (
                'Confirm Accusation'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================ InvestigationRoomPage ================ */
export default function InvestigationRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CasePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [discoveringClue, setDiscoveringClue] = useState<string | null>(null);
  const [requestingHint, setRequestingHint] = useState(false);
  const [hints, setHints] = useState<{ id: string; content: string }[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [showAccuseModal, setShowAccuseModal] = useState(false);
  const [accusing, setAccusing] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'suspects' | 'clues' | 'hints'>('story');

  const fetchCase = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getCase(id);
      setCaseData(data);
      if (data.status === 'completed') {
        navigate(`/results/${id}`, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load case.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  async function handleDiscoverClue(clueId: string) {
    if (!id || discoveringClue) return;
    setDiscoveringClue(clueId);
    try {
      const result = await discoverClue(id, clueId);
      setCaseData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          clueSummaries: prev.clueSummaries.map((c) =>
            c.id === clueId
              ? { ...c, discovered: true, content: result.clue.content }
              : c
          ),
          progress: {
            ...prev.progress,
            discoveredClueCount: result.progress.discoveredClueCount,
          },
        };
      });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to discover clue.');
    } finally {
      setDiscoveringClue(null);
    }
  }

  async function handleRequestHint() {
    if (!id || requestingHint) return;
    setRequestingHint(true);
    try {
      const result = await requestHint(id);
      setHints((prev) => [...prev, result.hint]);
      setCaseData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          progress: {
            ...prev.progress,
            hintsUsed: result.progress.hintsUsed,
            hintsAvailable: result.progress.hintsAvailable,
          },
        };
      });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to get hint.';
      alert(msg);
    } finally {
      setRequestingHint(false);
    }
  }

  async function handleAccuse() {
    if (!id || !selectedSuspect || accusing) return;
    setAccusing(true);
    try {
      await accuse(id, selectedSuspect);
      navigate(`/results/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit accusation.');
      setAccusing(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading case files..." />;
  if (error || !caseData) return <ErrorMessage message={error || 'Case not found.'} onRetry={fetchCase} />;

  const { progress } = caseData;
  const cluePercent = progress.totalClues > 0 ? (progress.discoveredClueCount / progress.totalClues) * 100 : 0;
  const selectedSuspectData = caseData.suspects.find((s) => s.id === selectedSuspect);
  const diffBadgeClass = `badge badge-${caseData.difficulty}`;

  const tabs = [
    { key: 'story' as const, label: '📖 Story', icon: '' },
    { key: 'suspects' as const, label: `🧑 Suspects (${caseData.suspects.length})`, icon: '' },
    { key: 'clues' as const, label: `🔍 Clues (${progress.discoveredClueCount}/${progress.totalClues})`, icon: '' },
    { key: 'hints' as const, label: `💡 Hints (${progress.hintsUsed})`, icon: '' },
  ];

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800 }}>{caseData.title}</h1>
            <span className={diffBadgeClass}>{caseData.difficulty}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, maxWidth: '200px' }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${cluePercent}%` }} />
              </div>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {progress.discoveredClueCount}/{progress.totalClues} clues
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            if (!selectedSuspect) {
              setActiveTab('suspects');
              alert('Select a suspect first, then make your accusation.');
              return;
            }
            setShowAccuseModal(true);
          }}
          className="btn btn-danger"
        >
          ⚖️ Make Accusation
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--color-border)',
        overflowX: 'auto',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: activeTab === tab.key ? 'var(--color-bg-glass-hover)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid var(--color-accent)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {/* Story Tab */}
        {activeTab === 'story' && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📋 Case Briefing
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {caseData.story}
            </p>
          </div>
        )}

        {/* Suspects Tab */}
        {activeTab === 'suspects' && (
          <div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              Click a suspect to select them for your accusation.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }} className="stagger-children">
              {caseData.suspects.map((s) => (
                <SuspectCard
                  key={s.id}
                  suspect={s}
                  selected={selectedSuspect === s.id}
                  onSelect={() => setSelectedSuspect(s.id)}
                  disabled={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Clues Tab */}
        {activeTab === 'clues' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="stagger-children">
            {caseData.clueSummaries.map((c) => (
              <ClueCard
                key={c.id}
                clue={c}
                onDiscover={() => handleDiscoverClue(c.id)}
                discovering={discoveringClue === c.id}
              />
            ))}
          </div>
        )}

        {/* Hints Tab */}
        {activeTab === 'hints' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                {progress.hintsAvailable} hint{progress.hintsAvailable !== 1 ? 's' : ''} remaining
              </span>
              <button
                onClick={handleRequestHint}
                disabled={requestingHint || progress.hintsAvailable <= 0}
                className="btn btn-secondary btn-sm"
              >
                {requestingHint ? 'Thinking...' : '💡 Request Hint'} (−10 pts)
              </button>
            </div>
            {hints.length === 0 ? (
              <div className="glass-card" style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
              }}>
                <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</p>
                <p>No hints requested yet. Each hint costs 10 points.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="stagger-children">
                {hints.map((h, idx) => (
                  <div key={h.id} className="glass-card" style={{
                    padding: '1rem 1.25rem',
                    borderLeft: '3px solid var(--color-accent)',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Hint #{idx + 1}
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                      {h.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accusation Modal */}
      {showAccuseModal && selectedSuspectData && (
        <AccusationModal
          suspectName={selectedSuspectData.name}
          onConfirm={handleAccuse}
          onCancel={() => setShowAccuseModal(false)}
          loading={accusing}
        />
      )}
    </div>
  );
}
