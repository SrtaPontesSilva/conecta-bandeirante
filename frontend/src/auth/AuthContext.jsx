import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [usuario, setUsuario] = useState(
    () => JSON.parse(
      localStorage.getItem("usuario")
    )
  );

  const [parceiro, setParceiro] = useState(
    () => JSON.parse(
      localStorage.getItem("parceiro")
    )
  );

  const login = (dados) => {
    localStorage.setItem(
      "token",
      dados.token
    );

    setToken(dados.token);

    if (dados.usuario) {
      localStorage.setItem(
        "usuario",
        JSON.stringify(dados.usuario)
      );

      localStorage.removeItem("parceiro");

      setUsuario(dados.usuario);
      setParceiro(null);
    }

    if (dados.parceiro) {
      localStorage.setItem(
        "parceiro",
        JSON.stringify(dados.parceiro)
      );

      localStorage.removeItem("usuario");

      setParceiro(dados.parceiro);
      setUsuario(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("parceiro");

    setToken(null);
    setUsuario(null);
    setParceiro(null);
  };

  const autenticado = Boolean(token);

  const pessoa = usuario || parceiro;

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        parceiro,
        pessoa,
        autenticado,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
