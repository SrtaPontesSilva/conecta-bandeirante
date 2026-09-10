import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import CadastroUsuario from "./pages/CadastroUsuario/CadastroUsuario";
import CadastroParceiro from "./pages/CadastroParceiro/CadastroParceiro";
import Anuncios from "./pages/Anuncios/Anuncios";
import NovoAnuncio from "./pages/NovoAnuncio/NovoAnuncio";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================
            ROTAS PÚBLICAS
        ================================= */}

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

        {/* ================================
            ROTAS PARA QUALQUER
            USUÁRIO AUTENTICADO
        ================================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/inicio"
            element={<Anuncios />}
          />

          <Route
            path="/anuncios"
            element={<Anuncios />}
          />

        </Route>

        {/* ================================
            ROTAS EXCLUSIVAS DE USUÁRIO
        ================================= */}

        <Route
          element={
            <ProtectedRoute tipoPermitido="usuario" />
          }
        >

          <Route
            path="/anuncios/novo"
            element={<NovoAnuncio />}
          />

        </Route>

        {/* ================================
            ROTA PADRÃO
        ================================= */}

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
    </BrowserRouter>
  );
}

export default App;