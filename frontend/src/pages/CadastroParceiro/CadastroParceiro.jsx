import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Logo from "../../components/Logo/Logo";
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

  function formatarTelefone(valor) {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 11);

    if (numeros.length <= 2) {
      return numeros.length
        ? `(${numeros}`
        : "";
    }

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(
        2,
        6
      )}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      7
    )}-${numeros.slice(7)}`;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]:
        name === "telefone_comercial"
          ? formatarTelefone(value)
          : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      const dadosCadastro = {
        ...formulario,
        telefone_comercial:
          formulario.telefone_comercial.replace(
            /\D/g,
            ""
          ),
      };

      const resposta = await api.post(
        "/parceiros",
        dadosCadastro
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

      <div className="cadastro-logo">
        <Logo variant="square" />
      </div>

      <section className="cadastro-card">

        <div className="cadastro-top">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/cadastro")}
          >
            ← Cadastrar outro tipo de usuário
          </button>
        </div>

        <header className="cadastro-form-header">
          <span className="cadastro-label">
            CONECTA BANDEIRANTE
          </span>

          <h1>Cadastro de parceiro</h1>

          <p>
            Cadastre seu comércio para fazer parte
            da comunidade Conecta Bandeirante.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="cadastro-form"
        >

          {/* =====================================
              01 — ESTABELECIMENTO
          ====================================== */}

          <div className="form-section">

            <div className="form-section-title">
              <span>01</span>

              <div>
                <strong>
                  Dados do estabelecimento
                </strong>

                <small>
                  Informações públicas do seu comércio.
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nome_estabelecimento">
                Nome do estabelecimento
              </label>

              <input
                id="nome_estabelecimento"
                name="nome_estabelecimento"
                type="text"
                value={
                  formulario.nome_estabelecimento
                }
                onChange={handleChange}
                placeholder="Nome do comércio"
                autoComplete="organization"
                required
              />
            </div>

          </div>

          {/* =====================================
              02 — CONTATO
          ====================================== */}

          <div className="form-section">

            <div className="form-section-title">
              <span>02</span>

              <div>
                <strong>
                  Dados de contato
                </strong>

                <small>
                  Como os clientes poderão encontrar
                  seu comércio.
                </small>
              </div>
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
                placeholder="comercio@email.com"
                autoComplete="email"
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
                autoComplete="tel"
                maxLength={15}
                required
              />
            </div>

          </div>

          {/* =====================================
              03 — ACESSO
          ====================================== */}

          <div className="form-section">

            <div className="form-section-title">
              <span>03</span>

              <div>
                <strong>
                  Dados de acesso
                </strong>

                <small>
                  Crie uma senha para administrar
                  seu cadastro.
                </small>
              </div>
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
                placeholder="Crie uma senha"
                autoComplete="new-password"
                required
              />

              <small className="field-hint">
                Mínimo de 8 caracteres.
              </small>
            </div>

          </div>

          {erro && (
            <p className="form-message form-error">
              {erro}
            </p>
          )}

          {sucesso && (
            <p className="form-message form-success">
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

        <footer className="cadastro-footer">
          <span>
            Já possui uma conta?
          </span>

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Entrar
          </button>
        </footer>

      </section>
    </main>
  );
}

export default CadastroParceiro;
