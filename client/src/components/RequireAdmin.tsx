import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
}
