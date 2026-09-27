import { useLocation, useNavigate } from "react-router-dom";

import {
  IconTicket,
  IconUser,
  IconPlus,
} from "../Icons/Icons";

import "./BottomNavigation.css";

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();


  /* ==========================================================
     ROTAS ATIVAS
  ========================================================== */

  const resgatesAtivo =
    location.pathname === "/resgates";

  const perfilAtivo =
    location.pathname === "/perfil";


  /* ==========================================================
     NAVEGAÇÃO
  ========================================================== */

  function handleResgates() {
    navigate("/resgates");
  }

  function handlePublicar() {
    navigate("/anuncios/novo");
  }

  function handlePerfil() {
    navigate("/perfil");
  }


  return (
    <nav
      className="bottom-navigation"
      aria-label="Navegação principal"
    >

      {/* ====================================================
          RESGATE DE PONTOS
      ===================================================== */}

      <button
        type="button"
        className={
          resgatesAtivo
            ? "bottom-navigation-item bottom-navigation-item--active"
            : "bottom-navigation-item"
        }
        onClick={handleResgates}
        aria-label="Ir para resgates"
        aria-current={
          resgatesAtivo
            ? "page"
            : undefined
        }
      >
        <IconTicket
          size={21}
          aria-hidden="true"
        />

        <small>
          Resgate
        </small>
      </button>


      {/* ====================================================
          BOTÃO CENTRAL DE PUBLICAR
      ===================================================== */}

      <button
        type="button"
        className="bottom-navigation-add"
        onClick={handlePublicar}
        aria-label="Publicar novo anúncio"
      >
        <IconPlus
          size={24}
          aria-hidden="true"
        />
      </button>


      {/* ====================================================
          PERFIL DO USUÁRIO
      ===================================================== */}

      <button
        type="button"
        className={
          perfilAtivo
            ? "bottom-navigation-item bottom-navigation-item--active"
            : "bottom-navigation-item"
        }
        onClick={handlePerfil}
        aria-label="Ir para o perfil"
        aria-current={
          perfilAtivo
            ? "page"
            : undefined
        }
      >
        <IconUser
          size={21}
          aria-hidden="true"
        />

        <small>
          Perfil
        </small>
      </button>

    </nav>
  );
}

export default BottomNavigation;
