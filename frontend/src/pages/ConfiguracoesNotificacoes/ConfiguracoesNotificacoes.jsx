import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";
import api from "../../services/api";

import {
  IconBell,
  IconCheck,
  IconMail,
  IconTrash,
} from "../../components/Icons/Icons";

import "./ConfiguracoesNotificacoes.css";


/* ============================================================
   OPÇÕES DE RETENÇÃO
============================================================ */

const VALORES_RETENCAO = [
  {
    valor: 0,
    titulo: "Nunca excluir automaticamente",
    descricao:
      "As notificações permanecerão salvas até que você as exclua.",
  },
  {
    valor: 7,
    titulo: "Após 7 dias",
    descricao:
      "Notificações antigas serão excluídas automaticamente.",
  },
  {
    valor: 30,
    titulo: "Após 30 dias",
    descricao:
      "Notificações antigas serão excluídas automaticamente.",
  },
  {
    valor: 90,
    titulo: "Após 90 dias",
    descricao:
      "Notificações antigas serão excluídas automaticamente.",
  },
  {
    valor: 365,
    titulo: "Após 1 ano",
    descricao:
      "Notificações antigas serão excluídas automaticamente.",
  },
];


/* ============================================================
   PREFERÊNCIAS PADRÃO
============================================================ */

const PREFERENCIAS_PADRAO = {
  notificacoes_push: true,
  notificacoes_email: true,
  solicitacoes: true,
  aceitas: true,
  recusadas: true,
  reservas: true,
  retencao_dias: 0,
};


/* ============================================================
   COMPONENTE
============================================================ */

function ConfiguracoesNotificacoes() {
  const navigate = useNavigate();


  /* ============================================================
     ESTADOS
  ============================================================ */

  const [
    preferencias,
    setPreferencias,
  ] = useState(PREFERENCIAS_PADRAO);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    sucesso,
    setSucesso,
  ] = useState("");


  /* ============================================================
     CARREGAR PREFERÊNCIAS
  ============================================================ */

  useEffect(() => {
    let componenteMontado = true;


    async function carregarPreferencias() {
      try {
        setCarregando(true);
        setErro("");


        const resposta =
          await api.get(
            "/notificacoes/preferencias"
          );


        const dados =
          resposta.data?.preferencias;


        if (!componenteMontado) {
          return;
        }


        setPreferencias({
          notificacoes_push:
            dados?.notificacoes_push ?? true,

          notificacoes_email:
            dados?.notificacoes_email ?? true,

          solicitacoes:
            dados?.solicitacoes ?? true,

          aceitas:
            dados?.aceitas ?? true,

          recusadas:
            dados?.recusadas ?? true,

          reservas:
            dados?.reservas ?? true,

          retencao_dias:
            dados?.retencao_dias ?? 0,
        });

      } catch (error) {
        console.error(
          "Erro ao carregar preferências de notificações:",
          error
        );


        if (!componenteMontado) {
          return;
        }


        setErro(
          error?.response?.data?.erro ||
            "Não foi possível carregar suas preferências de notificações."
        );

      } finally {
        if (componenteMontado) {
          setCarregando(false);
        }
      }
    }


    carregarPreferencias();


    return () => {
      componenteMontado = false;
    };
  }, []);


  /* ============================================================
     ALTERAR PREFERÊNCIA
  ============================================================ */

  function alterarPreferencia(campo) {
    setPreferencias(
      (estadoAnterior) => ({
        ...estadoAnterior,

        [campo]:
          !estadoAnterior[campo],
      })
    );


    setErro("");
    setSucesso("");
  }


  /* ============================================================
     ALTERAR RETENÇÃO
  ============================================================ */

  function alterarRetencao(event) {
    setPreferencias(
      (estadoAnterior) => ({
        ...estadoAnterior,

        retencao_dias:
          Number(
            event.target.value
          ),
      })
    );


    setErro("");
    setSucesso("");
  }


  /* ============================================================
     SALVAR PREFERÊNCIAS
  ============================================================ */

  async function salvarPreferencias(event) {
    event.preventDefault();


    try {
      setSalvando(true);
      setErro("");
      setSucesso("");


      const resposta =
        await api.patch(
          "/notificacoes/preferencias",
          preferencias
        );


      const dados =
        resposta.data?.preferencias;


      setPreferencias({
        notificacoes_push:
          dados?.notificacoes_push ??
          preferencias.notificacoes_push,

        notificacoes_email:
          dados?.notificacoes_email ??
          preferencias.notificacoes_email,

        solicitacoes:
          dados?.solicitacoes ??
          preferencias.solicitacoes,

        aceitas:
          dados?.aceitas ??
          preferencias.aceitas,

        recusadas:
          dados?.recusadas ??
          preferencias.recusadas,

        reservas:
          dados?.reservas ??
          preferencias.reservas,

        retencao_dias:
          dados?.retencao_dias ??
          preferencias.retencao_dias,
      });


      setSucesso(
        "Preferências salvas com sucesso."
      );

    } catch (error) {
      console.error(
        "Erro ao salvar preferências de notificações:",
        error
      );


      setErro(
        error?.response?.data?.erro ||
          "Não foi possível salvar suas preferências."
      );

    } finally {
      setSalvando(false);
    }
  }


  /* ============================================================
     LOADING
  ============================================================ */

  if (carregando) {
    return (
      <main className="configuracoes-notificacoes-page">

        <MarketplaceNavbar
          tituloPagina="Notificações"
          aoVoltarPagina={() =>
            navigate(-1)
          }
        />


        <section className="configuracoes-notificacoes-container">

          <div
            className="configuracoes-notificacoes-loading"
            role="status"
            aria-live="polite"
          >

            <IconBell
              size={26}
            />

            <p>
              Carregando suas preferências...
            </p>

          </div>

        </section>


        <BottomNavigation />

      </main>
    );
  }


  /* ============================================================
     RENDER PRINCIPAL
  ============================================================ */

  return (
    <main className="configuracoes-notificacoes-page">

      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <MarketplaceNavbar
        tituloPagina="Notificações"
        aoVoltarPagina={() =>
          navigate(-1)
        }
      />


      {/* ======================================================
          CONTEÚDO
      ======================================================= */}

      <section className="configuracoes-notificacoes-container">

        {/* ====================================================
            FEEDBACK DE ERRO
        ===================================================== */}

        {erro && (
          <div
            className="
              configuracoes-notificacoes-feedback
              configuracoes-notificacoes-feedback--erro
            "
            role="alert"
          >
            <span>
              {erro}
            </span>
          </div>
        )}


        {/* ====================================================
            FEEDBACK DE SUCESSO
        ===================================================== */}

        {sucesso && (
          <div
            className="
              configuracoes-notificacoes-feedback
              configuracoes-notificacoes-feedback--sucesso
            "
            role="status"
            aria-live="polite"
          >

            <IconCheck
              size={18}
            />

            <span>
              {sucesso}
            </span>

          </div>
        )}


        {/* ====================================================
            FORMULÁRIO
        ===================================================== */}

        <form
          className="configuracoes-notificacoes-form"
          onSubmit={
            salvarPreferencias
          }
        >

          {/* ==================================================
              CANAIS DE NOTIFICAÇÃO
          =================================================== */}

          <section
            className="
              configuracoes-notificacoes-section
            "
          >

            <div
              className="
                configuracoes-notificacoes-section-header
              "
            >

              <div
                className="
                  configuracoes-notificacoes-section-icon
                "
                aria-hidden="true"
              >

                <IconBell
                  size={19}
                />

              </div>


              <div>

                <h2>
                  Canais de notificação
                </h2>

                <p>
                  Defina por onde você deseja receber suas
                  notificações.
                </p>

              </div>

            </div>


            <div
              className="
                configuracoes-notificacoes-options
              "
            >

              {/* =================================================
                  PUSH
              ================================================== */}

              <label
                className="notificacao-option"
              >

                <div
                  className="
                    notificacao-option-icon
                  "
                  aria-hidden="true"
                >

                  <IconBell
                    size={19}
                  />

                </div>


                <div
                  className="
                    notificacao-option-content
                  "
                >

                  <strong>
                    Notificações push
                  </strong>

                  <span>
                    Receba alertas diretamente no seu dispositivo.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={
                    preferencias.notificacoes_push
                  }
                  onChange={() =>
                    alterarPreferencia(
                      "notificacoes_push"
                    )
                  }
                  className="
                    notificacao-toggle-input
                  "
                  aria-label="Ativar notificações push"
                />


                <span
                  className="
                    notificacao-toggle
                  "
                  aria-hidden="true"
                >
                  <span />
                </span>

              </label>


              {/* =================================================
                  E-MAIL
              ================================================== */}

              <label
                className="notificacao-option"
              >

                <div
                  className="
                    notificacao-option-icon
                  "
                  aria-hidden="true"
                >

                  <IconMail
                    size={19}
                  />

                </div>


                <div
                  className="
                    notificacao-option-content
                  "
                >

                  <strong>
                    Notificações por e-mail
                  </strong>

                  <span>
                    Receba atualizações importantes no seu e-mail.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={
                    preferencias.notificacoes_email
                  }
                  onChange={() =>
                    alterarPreferencia(
                      "notificacoes_email"
                    )
                  }
                  className="
                    notificacao-toggle-input
                  "
                  aria-label="Ativar notificações por e-mail"
                />


                <span
                  className="
                    notificacao-toggle
                  "
                  aria-hidden="true"
                >
                  <span />
                </span>

              </label>

            </div>

          </section>


          {/* ==================================================
              TIPOS DE NOTIFICAÇÃO
          =================================================== */}

          <section
            className="
              configuracoes-notificacoes-section
            "
          >

            <div
              className="
                configuracoes-notificacoes-section-header
              "
            >

              <div
                className="
                  configuracoes-notificacoes-section-icon
                "
                aria-hidden="true"
              >

                <IconBell
                  size={19}
                />

              </div>


              <div>

                <h2>
                  Tipos de notificação
                </h2>

                <p>
                  Escolha os acontecimentos sobre os quais deseja
                  ser avisado.
                </p>

              </div>

            </div>


            <div
              className="
                configuracoes-notificacoes-options
              "
            >

              {/* =================================================
                  SOLICITAÇÕES
              ================================================== */}

              <label
                className="notificacao-option"
              >

                <div
                  className="
                    notificacao-option-content
                    notificacao-option-content--without-icon
                  "
                >

                  <strong>
                    Solicitações
                  </strong>

                  <span>
                    Novos interesses e solicitações relacionados
                    aos seus anúncios.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={
                    preferencias.solicitacoes
                  }
                  onChange={() =>
                    alterarPreferencia(
                      "solicitacoes"
                    )
                  }
                  className="
                    notificacao-toggle-input
                  "
                  aria-label="Ativar notificações de solicitações"
                />


                <span
                  className="
                    notificacao-toggle
                  "
                  aria-hidden="true"
                >
                  <span />
                </span>

              </label>


              {/* =================================================
                  ACEITAS
              ================================================== */}

              <label
                className="notificacao-option"
              >

                <div
                  className="
                    notificacao-option-content
                    notificacao-option-content--without-icon
                  "
                >

                  <strong>
                    Solicitações aceitas
                  </strong>

                  <span>
                    Avisos quando uma solicitação for aceita.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={
                    preferencias.aceitas
                  }
                  onChange={() =>
                    alterarPreferencia(
                      "aceitas"
                    )
                  }
                  className="
                    notificacao-toggle-input
                  "
                  aria-label="Ativar notificações de solicitações aceitas"
                />


                <span
                  className="
                    notificacao-toggle
                  "
                  aria-hidden="true"
                >
                  <span />
                </span>

              </label>


              {/* =================================================
                  RECUSADAS
              ================================================== */}

              <label
                className="notificacao-option"
              >

                <div
                  className="
                    notificacao-option-content
                    notificacao-option-content--without-icon
                  "
                >

                  <strong>
                    Solicitações recusadas
                  </strong>

                  <span>
                    Avisos quando uma solicitação for recusada.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={
                    preferencias.recusadas
                  }
                  onChange={() =>
                    alterarPreferencia(
                      "recusadas"
                    )
                  }
                  className="
                    notificacao-toggle-input
                  "
                  aria-label="Ativar notificações de solicitações recusadas"
                />


                <span
                  className="
                    notificacao-toggle
                  "
                  aria-hidden="true"
                >
                  <span />
                </span>

              </label>


              {/* =================================================
                  RESERVAS
              ================================================== */}

              <label
                className="notificacao-option"
              >

                <div
                  className="
                    notificacao-option-content
                    notificacao-option-content--without-icon
                  "
                >

                  <strong>
                    Reservas
                  </strong>

                  <span>
                    Avisos relacionados às datas e reservas de
                    retirada.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={
                    preferencias.reservas
                  }
                  onChange={() =>
                    alterarPreferencia(
                      "reservas"
                    )
                  }
                  className="
                    notificacao-toggle-input
                  "
                  aria-label="Ativar notificações de reservas"
                />


                <span
                  className="
                    notificacao-toggle
                  "
                  aria-hidden="true"
                >
                  <span />
                </span>

              </label>

            </div>

          </section>


          {/* ==================================================
              ARMAZENAMENTO
          =================================================== */}

          <section
            className="
              configuracoes-notificacoes-section
            "
          >

            <div
              className="
                configuracoes-notificacoes-section-header
              "
            >

              <div
                className="
                  configuracoes-notificacoes-section-icon
                "
                aria-hidden="true"
              >

                <IconTrash
                  size={19}
                />

              </div>


              <div>

                <h2>
                  Armazenamento
                </h2>

                <p>
                  Defina por quanto tempo suas notificações devem
                  ser mantidas.
                </p>

              </div>

            </div>


            <div
              className="
                retencao-notificacoes
              "
            >

              <label
                htmlFor="retencao-notificacoes"
                className="
                  retencao-notificacoes-label
                "
              >
                Excluir notificações após
              </label>


              <select
                id="retencao-notificacoes"
                value={
                  preferencias.retencao_dias
                }
                onChange={
                  alterarRetencao
                }
                className="
                  retencao-notificacoes-select
                "
              >

                {VALORES_RETENCAO.map(
                  (opcao) => (
                    <option
                      key={
                        opcao.valor
                      }
                      value={
                        opcao.valor
                      }
                    >
                      {
                        opcao.titulo
                      }
                    </option>
                  )
                )}

              </select>


              <p
                className="
                  retencao-notificacoes-description
                "
              >

                {
                  VALORES_RETENCAO.find(
                    (opcao) =>
                      opcao.valor ===
                      preferencias.retencao_dias
                  )?.descricao
                }

              </p>

            </div>

          </section>


          {/* ==================================================
              AÇÕES
          =================================================== */}

          <footer
            className="
              configuracoes-notificacoes-footer
            "
          >

            <button
              type="button"
              className="
                configuracoes-notificacoes-cancelar
              "
              onClick={() =>
                navigate(-1)
              }
              disabled={
                salvando
              }
            >
              Cancelar
            </button>


            <button
              type="submit"
              className="
                configuracoes-notificacoes-salvar
              "
              disabled={
                salvando
              }
            >

              {salvando
                ? "Salvando..."
                : "Salvar preferências"}

            </button>

          </footer>

        </form>

      </section>


      {/* ======================================================
          NAVEGAÇÃO INFERIOR
      ======================================================= */}

      <BottomNavigation />

    </main>
  );
}


export default ConfiguracoesNotificacoes;