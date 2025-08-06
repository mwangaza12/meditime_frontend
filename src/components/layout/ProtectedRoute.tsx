import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../app/store';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: string[]; // 👈 Pass allowed roles
};

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />; // Or a 403 page
  }

  return <>{children}</>;
}

export default ProtectedRoute;
