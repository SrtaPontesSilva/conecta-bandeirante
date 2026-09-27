import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Logo from '../../components/Logo/Logo';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import { useAuth } from '../../auth/AuthContext';

import {
  IconEye,
  IconEyeOff,
} from '../../components/Icons/Icons';

import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formulario, setFormulario] = useState({
    email: '',
    senha: ''
  });

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro('');

    if (!formulario.email || !formulario.senha) {
      setErro('Preencha seu e-mail e sua senha.');
      return;
    }

    setCarregando(true);

    try {
      const resposta = await api.post(
        '/auth/login',
        formulario
      );

      // Centraliza o armazenamento da sessão
      // através do AuthContext.
      login(resposta.data);

      navigate('/inicio');
    } catch (error) {
      if (error.response?.data?.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro(
          'Não foi possível realizar o login. Tente novamente.'
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <Logo />

        <div className="login-brand-content">
          <span className="login-eyebrow">
            Comunidade • Educação • Circularidade
          </span>

          <h1>
            Conectando pessoas,
            <br />
            materiais e oportunidades.
          </h1>

          <p>
            Uma plataforma para compartilhar, trocar e encontrar
            recursos dentro da comunidade do Núcleo Bandeirante.
          </p>
        </div>
      </section>

      <section className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h2>Entrar</h2>

            <p>
              Acesse sua conta para continuar no Conecta Bandeirante.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="E-mail"
              name="email"
              type="email"
              value={formulario.email}
              onChange={handleChange}
              placeholder="seuemail@exemplo.com"
              required
              autoComplete="email"
            />

            <div className="login-password-field">
              <Input
                label="Senha"
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                value={formulario.senha}
                onChange={handleChange}
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setMostrarSenha((estado) => !estado)}
                aria-label={
                  mostrarSenha
                    ? 'Ocultar senha'
                    : 'Visualizar senha'
                }
                title={
                  mostrarSenha
                    ? 'Ocultar senha'
                    : 'Visualizar senha'
                }
              >
                {mostrarSenha ? (
                  <IconEyeOff size={18} />
                ) : (
                  <IconEye size={18} />
                )}
              </button>
            </div>

            <div className="login-forgot-password">
              <Link to="/recuperar-senha">
                Esqueci minha senha
              </Link>
            </div>

            {erro && (
              <div
                className="login-error"
                role="alert"
                aria-live="assertive"
              >
                {erro}
              </div>
            )}

            <Button
              type="submit"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="login-register">
            <span>Ainda não possui uma conta?</span>

            <Link to="/cadastro">
              Criar conta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
