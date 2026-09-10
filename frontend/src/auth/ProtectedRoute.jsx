import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './AuthContext';

function ProtectedRoute({ tipoPermitido }) {
  const {
    autenticado,
    usuario,
    parceiro
  } = useAuth();

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (tipoPermitido === 'usuario' && !usuario) {
    return (
      <Navigate
        to="/inicio"
        replace
      />
    );
  }

  if (tipoPermitido === 'parceiro' && !parceiro) {
    return (
      <Navigate
        to="/inicio"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;