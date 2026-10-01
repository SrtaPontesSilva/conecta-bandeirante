import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  /* ==========================================================
     TOKEN
  ========================================================== */

  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );


  /* ==========================================================
     USUÁRIO
  ========================================================== */

  const [usuario, setUsuario] = useState(
    () => {
      const dados = localStorage.getItem("usuario");

      if (!dados) {
        return null;
      }

      try {
        return JSON.parse(dados);
      } catch {
        localStorage.removeItem("usuario");
        return null;
      }
    }
  );


  /* ==========================================================
     PARCEIRO
  ========================================================== */

  const [parceiro, setParceiro] = useState(
    () => {
      const dados = localStorage.getItem("parceiro");

      if (!dados) {
        return null;
      }

      try {
        return JSON.parse(dados);
      } catch {
        localStorage.removeItem("parceiro");
        return null;
      }
    }
  );


  /* ==========================================================
     TIPO DA CONTA
     
     Mantemos o tipo separadamente para que o ProtectedRoute
     saiba qual área da aplicação deve ser acessada.
  ========================================================== */

  const [tipo, setTipo] = useState(
    () => localStorage.getItem("tipo")
  );


  /* ==========================================================
     LOGIN
  ========================================================== */

  const login = (dados) => {

    /* --------------------------------------------------------
       TOKEN
    -------------------------------------------------------- */

    if (dados?.token) {
      localStorage.setItem(
        "token",
        dados.token
      );

      setToken(dados.token);
    }


    /* --------------------------------------------------------
       IDENTIFICA O TIPO DA CONTA
       
       Primeiro utiliza "tipo" enviado pela API.
       Caso a API não envie "tipo", usamos a existência
       de parceiro/usuário como fallback.
    -------------------------------------------------------- */

    const tipoConta =
      dados?.tipo ||
      (dados?.parceiro ? "parceiro" : null) ||
      (dados?.usuario ? "usuario" : null);


    if (tipoConta) {

      localStorage.setItem(
        "tipo",
        tipoConta
      );

      setTipo(tipoConta);
    }


    /* --------------------------------------------------------
       LOGIN COMO USUÁRIO
    -------------------------------------------------------- */

    if (dados?.usuario) {

      localStorage.setItem(
        "usuario",
        JSON.stringify(dados.usuario)
      );

      localStorage.removeItem("parceiro");

      setUsuario(dados.usuario);
      setParceiro(null);
    }


    /* --------------------------------------------------------
       LOGIN COMO PARCEIRO
    -------------------------------------------------------- */

    if (dados?.parceiro) {

      localStorage.setItem(
        "parceiro",
        JSON.stringify(dados.parceiro)
      );

      localStorage.removeItem("usuario");

      setParceiro(dados.parceiro);
      setUsuario(null);
    }
  };


  /* ==========================================================
     LOGOUT
  ========================================================== */

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("parceiro");
    localStorage.removeItem("tipo");

    setToken(null);
    setUsuario(null);
    setParceiro(null);
    setTipo(null);
  };


  /* ==========================================================
     ESTADO DE AUTENTICAÇÃO
  ========================================================== */

  const autenticado = Boolean(token);


  /* ==========================================================
     PESSOA LOGADA
  ========================================================== */

  const pessoa = usuario || parceiro;


  /* ==========================================================
     PROVIDER
  ========================================================== */

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        parceiro,
        pessoa,
        tipo,
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