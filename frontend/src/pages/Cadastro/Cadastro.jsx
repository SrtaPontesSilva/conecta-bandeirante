import { Link } from 'react-router-dom';

import Logo from '../../components/Logo/Logo';
import './Cadastro.css';

function Cadastro() {
  return (
    <main className="cadastro-page">
      <header className="cadastro-header">
        <div className="cadastro-header-inner">
          <Link to="/login" aria-label="Voltar para o login">
            <Logo />
          </Link>
        </div>
      </header>

      <section className="cadastro-content">
        <div className="cadastro-intro">
          <span className="cadastro-eyebrow">
            Conecta Bandeirante
          </span>

          <h1>Como você quer participar?</h1>

          <p>
            Escolha o tipo de cadastro que melhor representa você.
          </p>
        </div>

        <div className="cadastro-options">
          <article className="cadastro-option">
            <div className="cadastro-option-top">
              <span
                className="cadastro-option-icon"
                aria-hidden="true"
              >
                👤
              </span>

              <span className="cadastro-option-label">
                Comunidade
              </span>
            </div>

            <div className="cadastro-option-content">
              <h2>Usuário</h2>

              <p>
                Encontre, doe, troque ou compre materiais
                usados dentro da comunidade.
              </p>
            </div>

            <Link
              to="/cadastro/usuario"
              className="cadastro-option-button"
            >
              Criar conta
            </Link>
          </article>

          <article className="cadastro-option cadastro-option--partner">
            <div className="cadastro-option-top">
              <span
                className="cadastro-option-icon"
                aria-hidden="true"
              >
                🏪
              </span>

              <span className="cadastro-option-label">
                Comércio
              </span>
            </div>

            <div className="cadastro-option-content">
              <h2>Parceiro</h2>

              <p>
                Cadastre seu comércio e participe da rede
                oferecendo benefícios à comunidade.
              </p>
            </div>

            <Link
              to="/cadastro/parceiro"
              className="cadastro-option-button"
            >
              Cadastrar comércio
            </Link>
          </article>
        </div>

        <p className="cadastro-login">
          Já possui uma conta?
          {' '}
          <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}

export default Cadastro;