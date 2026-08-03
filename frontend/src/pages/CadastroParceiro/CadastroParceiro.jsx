import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./CadastroParceiro.css";

function CadastroParceiro() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nome_estabelecimento: "",
    email: "",
    telefone_comercial: "",
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
        "/parceiros",
        formulario
      );

      setSucesso(resposta.data.mensagem);

      setFormulario({
        nome_estabelecimento: "",
        email: "",
        telefone_comercial: "",
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
          <h1>Cadastro de parceiro</h1>

          <p>
            Cadastre seu comércio para fazer parte
            do Conecta Bandeirante.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="cadastro-form"
        >
          <div className="form-group">
            <label htmlFor="nome_estabelecimento">
              Nome do estabelecimento
            </label>

            <input
              id="nome_estabelecimento"
              name="nome_estabelecimento"
              value={
                formulario.nome_estabelecimento
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              E-mail comercial
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
            <label htmlFor="telefone_comercial">
              Telefone comercial
            </label>

            <input
              id="telefone_comercial"
              name="telefone_comercial"
              type="tel"
              inputMode="numeric"
              placeholder="(61) 3333-4444"
              value={
                formulario.telefone_comercial
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              Senha
            </label>

            <input
              id="senha"
              name="senha"
              type="password"
              minLength={8}
              value={formulario.senha}
              onChange={handleChange}
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
              : "Cadastrar comércio"}
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

export default CadastroParceiro;
