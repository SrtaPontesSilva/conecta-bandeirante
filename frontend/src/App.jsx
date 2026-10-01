import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ============================================================
   PÁGINAS PÚBLICAS
============================================================ */

import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import CadastroUsuario from "./pages/CadastroUsuario/CadastroUsuario";
import CadastroParceiro from "./pages/CadastroParceiro/CadastroParceiro";


/* ============================================================
   PÁGINAS DO USUÁRIO
============================================================ */

import Anuncios from "./pages/Anuncios/Anuncios";
import AnuncioDetalhes from "./pages/DetalheAnuncio/DetalheAnuncio";
import NovoAnuncio from "./pages/NovoAnuncio/NovoAnuncio";
import Resgates from "./pages/Resgates/Resgates";
import Perfil from "./pages/Perfil/Perfil";
import ConfiguracoesNotificacoes from "./pages/ConfiguracoesNotificacoes/ConfiguracoesNotificacoes";


/* ============================================================
   PÁGINAS DO PARCEIRO
============================================================ */

import DashboardParceiro from "./pages/DashboardParceiro/DashboardParceiro";
import NovoCupom from "./pages/NovoCupom/NovoCupom";
import CuponsParceiro from "./pages/CuponsParceiro/CuponsParceiro";
// import PerfilParceiro from "./pages/PerfilParceiro/PerfilParceiro";


/* ============================================================
   AUTENTICAÇÃO
============================================================ */

import ProtectedRoute from "./auth/ProtectedRoute";


/* ============================================================
   COMPONENTES GLOBAIS
============================================================ */

import PageTitle from "./components/PageTitle/PageTitle";

import AccessibilityButton from "./components/Accessibility/AccessibilityButton";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";


function App() {
  return (
    <BrowserRouter>

      <AccessibilityProvider>

        <PageTitle />

        <Routes>

          {/* ====================================================
              ROTAS PÚBLICAS
          ==================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/cadastro"
            element={<Cadastro />}
          />

          <Route
            path="/cadastro/usuario"
            element={<CadastroUsuario />}
          />

          <Route
            path="/cadastro/parceiro"
            element={<CadastroParceiro />}
          />


          {/* ====================================================
              ROTAS EXCLUSIVAS DO USUÁRIO
          ==================================================== */}

          <Route
            element={
              <ProtectedRoute
                tipoPermitido="usuario"
              />
            }
          >

            {/* ------------------------------------------------
                INÍCIO / MARKETPLACE
            ------------------------------------------------- */}

            <Route
              path="/inicio"
              element={<Anuncios />}
            />


            {/* ------------------------------------------------
                ANÚNCIOS
            ------------------------------------------------- */}

            <Route
              path="/anuncios"
              element={<Anuncios />}
            />

            <Route
              path="/anuncios/:id"
              element={<AnuncioDetalhes />}
            />

            <Route
              path="/anuncios/novo"
              element={<NovoAnuncio />}
            />


            {/* ------------------------------------------------
                RESGATES
            ------------------------------------------------- */}

            <Route
              path="/resgates"
              element={<Resgates />}
            />


            {/* ------------------------------------------------
                PERFIL
            ------------------------------------------------- */}

            <Route
              path="/perfil"
              element={<Perfil />}
            />


            {/* ------------------------------------------------
                CONFIGURAÇÕES / NOTIFICAÇÕES
            ------------------------------------------------- */}

            <Route
              path="/configuracoes/notificacoes"
              element={<ConfiguracoesNotificacoes />}
            />

          </Route>


          {/* ====================================================
              ROTAS EXCLUSIVAS DO PARCEIRO
          ==================================================== */}

          <Route
            element={
              <ProtectedRoute
                tipoPermitido="parceiro"
              />
            }
          >

            {/* ------------------------------------------------
                DASHBOARD — TELA PRINCIPAL
               
                O dashboard é a página inicial do parceiro.
                Ele não aparece como opção no BottomNavigation.
            ------------------------------------------------- */}

            <Route
              path="/parceiro/inicio"
              element={<DashboardParceiro />}
            />


            {/* ------------------------------------------------
                CUPONS — HISTÓRICO / GERENCIAMENTO
            ------------------------------------------------- */}

            <Route
              path="/parceiro/cupons"
              element={<CuponsParceiro />}
            />


            {/* ------------------------------------------------
                NOVO CUPOM
               
                Esta é a ação central do BottomNavigation.
            ------------------------------------------------- */}

            <Route
              path="/parceiro/cupons/novo"
              element={<NovoCupom />}
            />


            {/* ------------------------------------------------
                PERFIL DO PARCEIRO
               
                Será habilitado quando a página for criada.
            ------------------------------------------------- */}

            {/*
            <Route
              path="/parceiro/perfil"
              element={<PerfilParceiro />}
            />
            */}

          </Route>


          {/* ====================================================
              ROTA PADRÃO
          ==================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>


        {/* =====================================================
            ACESSIBILIDADE GLOBAL
        ====================================================== */}

        <AccessibilityButton />

      </AccessibilityProvider>

    </BrowserRouter>
  );
}


export default App;