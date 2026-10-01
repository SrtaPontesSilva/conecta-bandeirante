import { useLocation, useNavigate } from "react-router-dom";

import {
  IconTicket,
  IconUser,
  IconPlus,
} from "../Icons/Icons";

import "./BottomNavigation.css";


function BottomNavigation({
  tipo = "usuario",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const ehParceiro = tipo === "parceiro";


  /* ==========================================================
     ROTAS ATIVAS — USUÁRIO
  ========================================================== */

  const resgatesAtivo =
    !ehParceiro &&
    (
      location.pathname === "/resgates" ||
      location.pathname.startsWith("/resgates/")
    );


  const perfilUsuarioAtivo =
    !ehParceiro &&
    location.pathname === "/perfil";


  /* ==========================================================
     ROTAS ATIVAS — PARCEIRO
  ========================================================== */

  const cuponsParceiroAtivo =
    ehParceiro &&
    (
      location.pathname === "/parceiro/cupons" ||
      location.pathname.startsWith("/parceiro/cupons/")
    );


  const perfilParceiroAtivo =
    ehParceiro &&
    location.pathname === "/parceiro/perfil";


  /* ==========================================================
     NAVEGAÇÃO — USUÁRIO
  ========================================================== */

  function handleResgates() {
    navigate("/resgates");
  }


  function handlePublicarUsuario() {
    navigate("/anuncios/novo");
  }


  function handlePerfilUsuario() {
    navigate("/perfil");
  }


  /* ==========================================================
     NAVEGAÇÃO — PARCEIRO
  ========================================================== */

  function handleCuponsParceiro() {
    navigate("/parceiro/cupons");
  }


  function handleNovoCupom() {
    navigate("/parceiro/cupons/novo");
  }


  function handlePerfilParceiro() {
    navigate("/parceiro/perfil");
  }


  /* ==========================================================
     RENDER — PARCEIRO
     
     O parceiro possui somente 3 opções no bottom:
     
     1. Cupons
     2. Novo Cupom
     3. Perfil
     
     O Dashboard é a tela inicial em:
     /parceiro/inicio
     
     Ele não ocupa uma posição no bottom.
  ========================================================== */

  if (ehParceiro) {
    return (
      <nav
        className="bottom-navigation bottom-navigation--partner"
        aria-label="Navegação principal do parceiro"
      >

        {/* ====================================================
            CUPONS
        ===================================================== */}

        <button
          type="button"
          className={
            cuponsParceiroAtivo
              ? "bottom-navigation-item bottom-navigation-item--active"
              : "bottom-navigation-item"
          }
          onClick={handleCuponsParceiro}
          aria-label="Ir para os cupons"
          aria-current={
            cuponsParceiroAtivo
              ? "page"
              : undefined
          }
        >
          <IconTicket
            size={21}
            aria-hidden="true"
          />

          <small>
            Cupons
          </small>
        </button>


        {/* ====================================================
            BOTÃO CENTRAL — NOVO CUPOM
        ===================================================== */}

        <button
          type="button"
          className="bottom-navigation-add"
          onClick={handleNovoCupom}
          aria-label="Criar novo cupom"
          title="Criar novo cupom"
        >
          <IconPlus
            size={24}
            aria-hidden="true"
          />
        </button>


        {/* ====================================================
            PERFIL
        ===================================================== */}

        <button
          type="button"
          className={
            perfilParceiroAtivo
              ? "bottom-navigation-item bottom-navigation-item--active"
              : "bottom-navigation-item"
          }
          onClick={handlePerfilParceiro}
          aria-label="Ir para o perfil do parceiro"
          aria-current={
            perfilParceiroAtivo
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


  /* ==========================================================
     RENDER — USUÁRIO
  ========================================================== */

  return (
    <nav
      className="bottom-navigation"
      aria-label="Navegação principal"
    >

      {/* ====================================================
          RESGATES
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
          BOTÃO CENTRAL — NOVO ANÚNCIO
      ===================================================== */}

      <button
        type="button"
        className="bottom-navigation-add"
        onClick={handlePublicarUsuario}
        aria-label="Publicar novo anúncio"
        title="Publicar novo anúncio"
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
          perfilUsuarioAtivo
            ? "bottom-navigation-item bottom-navigation-item--active"
            : "bottom-navigation-item"
        }
        onClick={handlePerfilUsuario}
        aria-label="Ir para o perfil"
        aria-current={
          perfilUsuarioAtivo
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