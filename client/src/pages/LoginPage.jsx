import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = routerLocation.state?.from || '/compte';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'La connexion a échoué.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <h1>Se connecter</h1>
      <p className="subtitle">Accède à ton espace compte et soumets des observations.</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="form-switch">
        Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
      </p>
    </div>
  );
}
