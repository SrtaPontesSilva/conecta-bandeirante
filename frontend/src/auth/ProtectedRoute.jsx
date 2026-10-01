import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthContext";


function ProtectedRoute({
  tipoPermitido
}) {

  const {
    autenticado,
    tipo
  } = useAuth();


  /* ==========================================================
     NÃO AUTENTICADO
  ========================================================== */

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* ==========================================================
     CONTA DE USUÁRIO
  ========================================================== */

  if (
    tipoPermitido === "usuario" &&
    tipo !== "usuario"
  ) {

    if (tipo === "parceiro") {
      return (
        <Navigate
          to="/parceiro/inicio"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* ==========================================================
     CONTA DE PARCEIRO
  ========================================================== */

  if (
    tipoPermitido === "parceiro" &&
    tipo !== "parceiro"
  ) {

    if (tipo === "usuario") {
      return (
        <Navigate
          to="/inicio"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* ==========================================================
     ACESSO AUTORIZADO
  ========================================================== */

  return <Outlet />;
}


export default ProtectedRoute;