import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './AuthContext';

function ProtectedRoute() {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
