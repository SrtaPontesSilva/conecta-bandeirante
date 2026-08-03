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

function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        <Route
          path="/inicio"
          element={<Anuncios />}
        />

        <Route
          path="/anuncios"
          element={<Anuncios />}
        />

        <Route
          path="/anuncios/novo"
          element={<NovoAnuncio />}
        />

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
