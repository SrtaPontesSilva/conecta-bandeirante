import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ============================================================
// TOKEN JWT
// ============================================================
//
// Adiciona automaticamente o token salvo no localStorage
// em todas as requisições da API.
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// TRATAMENTO DE RESPOSTAS
// ============================================================
//
// Um 401 significa que a API rejeitou a autenticação.
//
// O logout automático acontece somente quando:
// - existe um token salvo;
// - a requisição não é a própria rota de login;
// - o usuário não está na página de login.
//
// Isso evita que um erro de autenticação do próprio login
// ou múltiplos 401 simultâneos causem comportamentos estranhos.
// ============================================================

let redirecionandoParaLogin = false;

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    const token = localStorage.getItem("token");

    const requisicaoDeLogin =
      url.includes("/auth/login");

    const estaNaPaginaDeLogin =
      window.location.pathname === "/login";

    if (
      status === 401 &&
      token &&
      !requisicaoDeLogin &&
      !estaNaPaginaDeLogin &&
      !redirecionandoParaLogin
    ) {
      redirecionandoParaLogin = true;

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("parceiro");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
