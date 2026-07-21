import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return children;
}
