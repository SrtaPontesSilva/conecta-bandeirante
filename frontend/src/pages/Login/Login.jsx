import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/auth/login", {
        email,
        senha,
      });

      const dados = resposta.data;

      if (dados.usuario) {
        localStorage.setItem(
          "usuario",
          JSON.stringify(dados.usuario)
        );

        navigate("/inicio");
      }

      if (dados.parceiro) {
        localStorage.setItem(
          "parceiro",
          JSON.stringify(dados.parceiro)
        );

        navigate("/inicio");
      }
    } catch (error) {
      if (error.response?.data?.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro(
          "Não foi possível conectar ao servidor."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main>
      <h1>Conecta Bandeirante</h1>

      <h2>Entrar</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">
            E-mail
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="senha">
            Senha
          </label>

          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(event) =>
              setSenha(event.target.value)
            }
            required
          />
        </div>

        {erro && (
          <p role="alert">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <hr />

      <button
        type="button"
        onClick={() => navigate("/cadastro")}
      >
        Criar conta
      </button>

      <button
        type="button"
        onClick={() =>
          navigate("/cadastro/parceiro")
        }
      >
        Sou um parceiro
      </button>
    </main>
  );
}

export default Login;
