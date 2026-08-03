import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./CadastroUsuario.css";

function CadastroUsuario() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    cpf: "",
    senha: "",
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      const resposta = await api.post(
        "/usuarios",
        formulario
      );

      setSucesso(resposta.data.mensagem);

      setFormulario({
        nome: "",
        sobrenome: "",
        email: "",
        cpf: "",
        senha: "",
      });
    } catch (error) {
      if (error.response?.data?.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro(
          "Não foi possível realizar o cadastro."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="cadastro-page">
      <section className="cadastro-card">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/login")}
        >
          ← Voltar
        </button>

        <header className="cadastro-header">
          <h1>Criar conta</h1>

          <p>
            Cadastre-se para participar do Conecta
            Bandeirante.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="cadastro-form"
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">
                Nome
              </label>

              <input
                id="nome"
                name="nome"
                value={formulario.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sobrenome">
                Sobrenome
              </label>

              <input
                id="sobrenome"
                name="sobrenome"
                value={formulario.sobrenome}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formulario.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cpf">
              CPF
            </label>

            <input
              id="cpf"
              name="cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={formulario.cpf}
              onChange={handleChange}
              required
            />

            <small>
              Utilizado para aumentar a segurança e
              rastreabilidade da plataforma.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              Senha
            </label>

            <input
              id="senha"
              name="senha"
              type="password"
              value={formulario.senha}
              onChange={handleChange}
              minLength={8}
              required
            />

            <small>
              Mínimo de 8 caracteres.
            </small>
          </div>

          {erro && (
            <p className="form-error">
              {erro}
            </p>
          )}

          {sucesso && (
            <p className="form-success">
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={carregando}
          >
            {carregando
              ? "Cadastrando..."
              : "Criar minha conta"}
          </button>
        </form>

        <p className="cadastro-footer">
          Já possui uma conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Entrar
          </button>
        </p>
      </section>
    </main>
  );
}

export default CadastroUsuario;
