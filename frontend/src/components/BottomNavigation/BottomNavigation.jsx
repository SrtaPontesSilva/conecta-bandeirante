import { useNavigate } from "react-router-dom";

import { IconTicket, IconVideo, IconPlus } from "../Icons/Icons";

import "./BottomNavigation.css";

function BottomNavigation() {
  const navigate = useNavigate();

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
        className="bottom-navigation-item"
        onClick={() => navigate("/resgates")}
        aria-label="Ir para resgates"
      >
        <IconTicket size={21} />

        <small>Resgate</small>
      </button>

      {/* ====================================================
          BOTÃO CENTRAL DE PUBLICAR
      ===================================================== */}

      <button
        type="button"
        className="bottom-navigation-add"
        onClick={() => navigate("/anuncios/novo")}
        aria-label="Publicar novo anúncio"
      >
        <IconPlus size={24} />
      </button>

      {/* ====================================================
          VÍDEO AULAS
      ===================================================== */}

      <button
        type="button"
        className="bottom-navigation-item"
        onClick={() => navigate("/videoaulas")}
        aria-label="Ir para vídeo aulas"
      >
        <IconVideo size={21} />

        <small>Aulas</small>
      </button>
    </nav>
  );
}

export default BottomNavigation;