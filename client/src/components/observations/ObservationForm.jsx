import { useState } from 'react';
import { submitObservation } from '../../api/observations';
import { ApiError } from '../../api/client';

const VIBE_OPTIONS = [
  { value: 'calm', label: 'Calme' },
  { value: 'neutral', label: 'Neutre' },
  { value: 'lively', label: 'Animée' },
  { value: 'tense', label: 'Tendue' },
];

export default function ObservationForm({ locationSlug, onSubmitted }) {
  const [proximity, setProximity] = useState('');
  const [vibe, setVibe] = useState('neutral');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (proximity === '' || Number(proximity) < 0) {
      setError('Indique une distance approximative valide (en mètres).');
      return;
    }

    setSubmitting(true);
    try {
      await submitObservation({
        location: locationSlug,
        proximity: Number(proximity),
        vibe,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString(),
      });
      setDone(true);
      setProximity('');
      setNotes('');
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "L'envoi a échoué. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="proximity">Distance approximative à la source de bruit la plus proche (m)</label>
        <input
          id="proximity"
          type="number"
          min="0"
          step="1"
          value={proximity}
          onChange={(e) => setProximity(e.target.value)}
          placeholder="ex : 3"
        />
      </div>

      <div className="field">
        <label htmlFor="vibe">Ambiance ressentie</label>
        <select id="vibe" value={vibe} onChange={(e) => setVibe(e.target.value)}>
          {VIBE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="notes">Notes (optionnel)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ce que tu observes sur place…"
        />
      </div>

      {error && <p className="form-error">{error}</p>}
      {done && !error && <p style={{ color: 'var(--calme)', fontSize: '0.88rem', marginBottom: 14 }}>Observation envoyée, merci !</p>}

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? 'Envoi…' : 'Soumettre l\'observation'}
      </button>
    </form>
  );
}
