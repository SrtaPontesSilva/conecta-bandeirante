import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Inicio from "./pages/Inicio/Inicio";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/inicio"
          element={<Inicio />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

