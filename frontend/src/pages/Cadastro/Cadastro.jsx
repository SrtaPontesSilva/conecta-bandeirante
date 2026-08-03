import { Link } from 'react-router-dom';

import Logo from '../../components/Logo/Logo';
import './Cadastro.css';

function Cadastro() {
  return (
    <main className="cadastro-page">
      <header className="cadastro-header">
        <Link to="/login" aria-label="Voltar para o login">
          <Logo />
        </Link>
      </header>

      <section className="cadastro-content">
        <div className="cadastro-intro">
          <span className="cadastro-eyebrow">
            Conecta Bandeirante
          </span>

          <h1>Criar uma conta</h1>

          <p>
            Escolha como você deseja participar da comunidade.
          </p>
        </div>

        <div className="cadastro-options">
          <article className="cadastro-option">
            <div className="cadastro-option-icon" aria-hidden="true">
              👤
            </div>

            <div>
              <h2>Usuário</h2>

              <p>
                Para quem deseja encontrar, doar, trocar ou
                comprar materiais usados dentro da comunidade.
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
            <div className="cadastro-option-icon" aria-hidden="true">
              🏪
            </div>

            <div>
              <h2>Parceiro</h2>

              <p>
                Para comércios que desejam participar da rede
                e oferecer benefícios à comunidade.
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