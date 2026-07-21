import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password });
      navigate('/compte', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "L'inscription a échoué.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <h1>Créer un compte</h1>
      <p className="subtitle">Pour soumettre des observations et gérer tes lieux favoris.</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Nom</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="form-switch">
        Déjà un compte ? <Link to="/connexion">Se connecter</Link>
      </p>
    </div>
  );
}
