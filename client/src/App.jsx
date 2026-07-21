import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';

function Topbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-waves" aria-hidden="true"><span /><span /><span /><span /></span>
        Ambiance
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>Carte</NavLink>
        {isAuthenticated ? (
          <NavLink to="/compte">{user?.name || 'Mon compte'}</NavLink>
        ) : (
          <>
            <NavLink to="/connexion">Se connecter</NavLink>
            <NavLink to="/inscription">Créer un compte</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Topbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lieux/:slug" element={<LocationPage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<RegisterPage />} />
          <Route
            path="/compte"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<p>Page introuvable.</p>} />
        </Routes>
      </main>
    </div>
  );
}
