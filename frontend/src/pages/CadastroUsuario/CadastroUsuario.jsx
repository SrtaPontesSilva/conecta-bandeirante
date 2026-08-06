import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Logo from "../../components/Logo/Logo";
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

  function formatarCPF(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 3) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    }

    if (numeros.length <= 9) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    }

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: name === "cpf" ? formatarCPF(value) : value,
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
        cpf: formulario.cpf.replace(/\D/g, ""),
      };

      const resposta = await api.post(
        "/usuarios",
        dadosCadastro
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
        setErro("Não foi possível realizar o cadastro.");
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

          <h1>Criar conta</h1>

          <p>
            Cadastre-se para participar da comunidade
            Conecta Bandeirante.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="cadastro-form"
        >
          {/* restante do seu formulário permanece igual */}

          <div className="form-section">
            <div className="form-section-title">
              <span>01</span>

              <div>
                <strong>Dados pessoais</strong>
                <small>
                  Como podemos chamar você?
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome">
                  Nome
                </label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formulario.nome}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  autoComplete="given-name"
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
                  type="text"
                  value={formulario.sobrenome}
                  onChange={handleChange}
                  placeholder="Seu sobrenome"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>02</span>

              <div>
                <strong>Dados de acesso</strong>
                <small>
                  Informações para entrar na plataforma.
                </small>
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
                placeholder="seu@email.com"
                autoComplete="email"
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
                value={formulario.senha}
                onChange={handleChange}
                placeholder="Crie uma senha"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <small className="field-hint">
                Mínimo de 8 caracteres.
              </small>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">
              <span>03</span>

              <div>
                <strong>Segurança</strong>
                <small>
                  Uma informação para proteger a comunidade.
                </small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cpf">
                CPF
              </label>

              <input
                id="cpf"
                name="cpf"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={formulario.cpf}
                onChange={handleChange}
                autoComplete="off"
                maxLength={14}
                required
              />

              <small className="field-hint">
                Utilizado para aumentar a segurança e
                rastreabilidade da plataforma.
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
              ? "Criando conta..."
              : "Criar minha conta"}
          </button>
        </form>

        <footer className="cadastro-footer">
          <span>Já possui uma conta?</span>

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

export default CadastroUsuario;
