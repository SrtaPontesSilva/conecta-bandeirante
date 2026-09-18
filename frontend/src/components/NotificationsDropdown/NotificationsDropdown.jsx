import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  IconBell,
} from "../Icons/Icons";

import api from "../../services/api";

import "./NotificationsDropdown.css";


function NotificationsDropdown({
  aberta,
  aoAlternar,
}) {
  const navigate = useNavigate();

  const componenteAtivoRef = useRef(true);
  const dropdownRef = useRef(null);

  const [
    notificacoes,
    setNotificacoes,
  ] = useState([]);

  const [
    naoLidas,
    setNaoLidas,
  ] = useState(0);

  const [
    momentoAtual,
    setMomentoAtual,
  ] = useState(
    () => new Date()
  );

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState(false);

  const [
    solicitacoesRecebidas,
    setSolicitacoesRecebidas,
  ] = useState([]);

  const [
    acoesConcluidas,
    setAcoesConcluidas,
  ] = useState(() => new Set());

  const [
    acaoEmAndamento,
    setAcaoEmAndamento,
  ] = useState(null);

  const [
    excluindoNotificacao,
    setExcluindoNotificacao,
  ] = useState(null);

  const [
    excluindoTodas,
    setExcluindoTodas,
  ] = useState(false);


  /* ============================================================
     FORMATAÇÃO DE DATA
  ============================================================ */

  function formatarDataNotificacao(data) {
    if (!data) {
      return "";
    }

    let valorData = String(data).trim();

    if (!valorData) {
      return "";
    }

    const possuiTimezone =
      /(?:Z|[+-]\d{2}:\d{2})$/i.test(
        valorData
      );

    if (!possuiTimezone) {
      valorData = `${valorData}+00:00`;
    }

    const dataNotificacao =
      new Date(valorData);

    if (
      Number.isNaN(
        dataNotificacao.getTime()
      )
    ) {
      return "";
    }

    const agora = new Date();

    const diferencaMs =
      agora.getTime() -
      dataNotificacao.getTime();

    const minuto =
      60 * 1000;

    const hora =
      60 * minuto;

    const dia =
      24 * hora;


    if (
      diferencaMs < 0 &&
      Math.abs(diferencaMs) <= 30 * 1000
    ) {
      return "Agora";
    }


    if (diferencaMs < 0) {
      return dataNotificacao.toLocaleString(
        "pt-BR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }


    if (diferencaMs < minuto) {
      return "Agora";
    }


    if (diferencaMs < hora) {
      const minutos =
        Math.floor(
          diferencaMs / minuto
        );

      return `${minutos} ${
        minutos === 1
          ? "minuto"
          : "minutos"
      } atrás`;
    }


    if (diferencaMs < dia) {
      const horas =
        Math.floor(
          diferencaMs / hora
        );

      return `${horas} ${
        horas === 1
          ? "hora"
          : "horas"
      } atrás`;
    }


    if (diferencaMs < 2 * dia) {
      return "Ontem";
    }


    return dataNotificacao.toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }


  /* ============================================================
     SOLICITAÇÃO ASSOCIADA À NOTIFICAÇÃO
  ============================================================ */

  function obterSolicitacaoDaNotificacao(
    notificacao
  ) {
    if (!notificacao) {
      return null;
    }

    const referenciaId =
      Number(
        notificacao.referencia_id
      );

    if (
      Number.isInteger(
        referenciaId
      ) &&
      referenciaId > 0
    ) {
      return (
        solicitacoesRecebidas.find(
          (solicitacao) =>
            Number(
              solicitacao.id
            ) === referenciaId
        ) || null
      );
    }


    /*
     * Compatibilidade com notificações antigas
     * que eventualmente não possuam referencia_id.
     */
    if (
      notificacao.tipo !==
      "doacao_solicitacao_recebida"
    ) {
      return null;
    }


    const mensagem =
      String(
        notificacao.mensagem || ""
      ).toLowerCase();


    return (
      solicitacoesRecebidas.find(
        (solicitacao) => {
          if (
            solicitacao.status !==
            "pendente"
          ) {
            return false;
          }

          const titulo =
            String(
              solicitacao.anuncio?.titulo ||
              ""
            ).toLowerCase();

          const nome =
            String(
              solicitacao.interessado?.nome ||
              ""
            ).toLowerCase();


          const tituloEncontrado =
            titulo &&
            mensagem.includes(
              `"${titulo}"`
            );


          const nomeEncontrado =
            nome &&
            mensagem.includes(
              nome
            );


          return (
            tituloEncontrado &&
            nomeEncontrado
          );
        }
      ) || null
    );
  }


  /* ============================================================
     VERIFICAR AÇÕES DISPONÍVEIS
  ============================================================ */

  function notificacaoPossuiAcoes(
    notificacao
  ) {
    const solicitacao =
      obterSolicitacaoDaNotificacao(
        notificacao
      );

    return Boolean(
      solicitacao &&
      solicitacao.tipo === "doacao" &&
      solicitacao.status === "pendente"
    );
  }


  /* ============================================================
     CARREGAR NOTIFICAÇÕES
  ============================================================ */

  async function carregarNotificacoes({
    mostrarCarregamento = false,
  } = {}) {
    const usuarioSalvo =
      localStorage.getItem("usuario");


    /*
     * Parceiros não participam do fluxo
     * atual de notificações.
     */
    if (!usuarioSalvo) {
      if (
        componenteAtivoRef.current
      ) {
        setNotificacoes([]);
        setNaoLidas(0);
        setSolicitacoesRecebidas([]);
        setErro(false);
      }

      return;
    }


    if (mostrarCarregamento) {
      setCarregando(true);
    }


    try {
      setErro(false);


      const [
        respostaNotificacoes,
        respostaSolicitacoes,
      ] = await Promise.all([
        api.get("/notificacoes"),
        api.get("/solicitacoes"),
      ]);


      if (
        !componenteAtivoRef.current
      ) {
        return;
      }


      const lista =
        Array.isArray(
          respostaNotificacoes.data?.notificacoes
        )
          ? respostaNotificacoes.data.notificacoes
          : [];


      const quantidadeNaoLidas =
        Number(
          respostaNotificacoes.data?.nao_lidas
        ) || 0;


      const recebidas =
        Array.isArray(
          respostaSolicitacoes.data?.recebidas
        )
          ? respostaSolicitacoes.data.recebidas
          : [];


      setNotificacoes(lista);

      setSolicitacoesRecebidas(
        recebidas
      );

      setNaoLidas(
        Math.max(
          0,
          quantidadeNaoLidas
        )
      );


      /*
       * Remove do estado local os IDs de notificações
       * que já não existem no backend.
       */
      setAcoesConcluidas(
        (estadoAtual) => {
          const idsAtuais =
            new Set(
              lista.map(
                (item) => item.id
              )
            );

          const novoEstado =
            new Set();

          estadoAtual.forEach(
            (id) => {
              if (
                idsAtuais.has(id)
              ) {
                novoEstado.add(id);
              }
            }
          );

          return novoEstado;
        }
      );
    } catch (error) {
      if (
        error.response?.status === 401
      ) {
        if (
          componenteAtivoRef.current
        ) {
          setNotificacoes([]);
          setNaoLidas(0);
          setSolicitacoesRecebidas([]);
        }

        return;
      }


      if (
        componenteAtivoRef.current
      ) {
        setErro(true);
      }
    } finally {
      if (
        mostrarCarregamento &&
        componenteAtivoRef.current
      ) {
        setCarregando(false);
      }
    }
  }


  /* ============================================================
     MONTAGEM / DESMONTAGEM
  ============================================================ */

  useEffect(() => {
    componenteAtivoRef.current =
      true;

    carregarNotificacoes();


    return () => {
      componenteAtivoRef.current =
        false;
    };
  }, []);


  /* ============================================================
     ATUALIZAR HORÁRIO RELATIVO
  ============================================================ */

  useEffect(() => {
    const intervalo =
      window.setInterval(
        () => {
          setMomentoAtual(
            new Date()
          );
        },
        30000
      );


    return () => {
      window.clearInterval(
        intervalo
      );
    };
  }, []);


  /* ============================================================
     ATUALIZAÇÃO AUTOMÁTICA
  ============================================================ */

  useEffect(() => {
    const usuarioSalvo =
      localStorage.getItem("usuario");

    if (!usuarioSalvo) {
      return undefined;
    }


    const intervalo =
      window.setInterval(
        () => {
          carregarNotificacoes();
        },
        30000
      );


    return () => {
      window.clearInterval(
        intervalo
      );
    };
  }, []);


  /* ============================================================
     MARCAR UMA COMO LIDA
  ============================================================ */

  async function marcarNotificacaoComoLida(
    notificacao
  ) {
    if (!notificacao) {
      return;
    }

    if (notificacao.lida) {
      return;
    }


    setNotificacoes(
      (listaAtual) =>
        listaAtual.map(
          (item) =>
            item.id ===
            notificacao.id
              ? {
                  ...item,
                  lida: true,
                }
              : item
        )
    );


    setNaoLidas(
      (quantidadeAtual) =>
        Math.max(
          0,
          quantidadeAtual - 1
        )
    );


    try {
      await api.patch(
        `/notificacoes/${notificacao.id}/lida`
      );
    } catch (error) {
      await carregarNotificacoes();
    }
  }


  /* ============================================================
     MARCAR TODAS COMO LIDAS
  ============================================================ */

  async function marcarTodasComoLidas() {
    if (naoLidas === 0) {
      return;
    }


    setNotificacoes(
      (listaAtual) =>
        listaAtual.map(
          (notificacao) => ({
            ...notificacao,
            lida: true,
          })
        )
    );


    setNaoLidas(0);


    try {
      await api.patch(
        "/notificacoes/marcar-todas-lidas"
      );
    } catch (error) {
      await carregarNotificacoes();
    }
  }


  /* ============================================================
     ABRIR NOTIFICAÇÃO
  ============================================================ */

  async function abrirNotificacao(
    notificacao
  ) {
    await marcarNotificacaoComoLida(
      notificacao
    );
  }


  /* ============================================================
     ACEITAR SOLICITAÇÃO
  ============================================================ */

  async function aceitarSolicitacao(
    event,
    notificacao
  ) {
    event.stopPropagation();


    if (!notificacao) {
      return;
    }


    const solicitacaoId =
      notificacao.referencia_id;


    if (!solicitacaoId) {
      return;
    }


    if (
      acaoEmAndamento !== null
    ) {
      return;
    }


    const chaveAcao =
      `aceitar-${solicitacaoId}`;


    setAcaoEmAndamento(
      chaveAcao
    );


    try {
      await api.patch(
        `/solicitacoes/${solicitacaoId}/aceitar`
      );


      setAcoesConcluidas(
        (estadoAtual) => {
          const novoEstado =
            new Set(
              estadoAtual
            );

          novoEstado.add(
            notificacao.id
          );

          return novoEstado;
        }
      );


      await marcarNotificacaoComoLida(
        notificacao
      );


      await carregarNotificacoes();
    } catch (error) {
      console.error(
        "Erro ao aceitar solicitação:",
        error
      );
    } finally {
      if (
        componenteAtivoRef.current
      ) {
        setAcaoEmAndamento(null);
      }
    }
  }


  /* ============================================================
     RECUSAR SOLICITAÇÃO
  ============================================================ */

  async function recusarSolicitacao(
    event,
    notificacao
  ) {
    event.stopPropagation();


    if (!notificacao) {
      return;
    }


    const solicitacaoId =
      notificacao.referencia_id;


    if (!solicitacaoId) {
      return;
    }


    if (
      acaoEmAndamento !== null
    ) {
      return;
    }


    const chaveAcao =
      `recusar-${solicitacaoId}`;


    setAcaoEmAndamento(
      chaveAcao
    );


    try {
      await api.patch(
        `/solicitacoes/${solicitacaoId}/recusar`
      );


      setAcoesConcluidas(
        (estadoAtual) => {
          const novoEstado =
            new Set(
              estadoAtual
            );

          novoEstado.add(
            notificacao.id
          );

          return novoEstado;
        }
      );


      await marcarNotificacaoComoLida(
        notificacao
      );


      await carregarNotificacoes();
    } catch (error) {
      console.error(
        "Erro ao recusar solicitação:",
        error
      );
    } finally {
      if (
        componenteAtivoRef.current
      ) {
        setAcaoEmAndamento(null);
      }
    }
  }


  /* ============================================================
     EXCLUIR UMA NOTIFICAÇÃO
  ============================================================ */

  async function excluirNotificacao(
    event,
    notificacao
  ) {
    event.stopPropagation();


    if (!notificacao) {
      return;
    }


    if (
      excluindoNotificacao !== null ||
      excluindoTodas
    ) {
      return;
    }


    setExcluindoNotificacao(
      notificacao.id
    );


    try {
      await api.delete(
        `/notificacoes/${notificacao.id}`
      );


      setNotificacoes(
        (listaAtual) =>
          listaAtual.filter(
            (item) =>
              item.id !==
              notificacao.id
          )
      );


      if (!notificacao.lida) {
        setNaoLidas(
          (quantidadeAtual) =>
            Math.max(
              0,
              quantidadeAtual - 1
            )
        );
      }


      setAcoesConcluidas(
        (estadoAtual) => {
          const novoEstado =
            new Set(
              estadoAtual
            );

          novoEstado.delete(
            notificacao.id
          );

          return novoEstado;
        }
      );
    } catch (error) {
      console.error(
        "Erro ao excluir notificação:",
        error
      );
    } finally {
      if (
        componenteAtivoRef.current
      ) {
        setExcluindoNotificacao(null);
      }
    }
  }


  /* ============================================================
     EXCLUIR TODAS
  ============================================================ */

  async function excluirTodasNotificacoes() {
    if (
      notificacoes.length === 0 ||
      excluindoTodas ||
      excluindoNotificacao !== null
    ) {
      return;
    }


    const confirmou =
      window.confirm(
        "Excluir todas as notificações?"
      );


    if (!confirmou) {
      return;
    }


    setExcluindoTodas(true);


    try {
      await api.delete(
        "/notificacoes"
      );


      setNotificacoes([]);

      setNaoLidas(0);

      setAcoesConcluidas(
        new Set()
      );
    } catch (error) {
      console.error(
        "Erro ao excluir notificações:",
        error
      );
    } finally {
      if (
        componenteAtivoRef.current
      ) {
        setExcluindoTodas(false);
      }
    }
  }


  /* ============================================================
     CONFIGURAÇÕES
  ============================================================ */

  function abrirConfiguracoes() {
    aoAlternar(false);

    navigate(
      "/configuracoes/notificacoes"
    );
  }


  /* ============================================================
     CLIQUE FORA
  ============================================================ */

  useEffect(() => {
    if (!aberta) {
      return undefined;
    }


    function handleClickOutside(
      event
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        aoAlternar(false);
      }
    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [
    aberta,
    aoAlternar,
  ]);


  /* ============================================================
     ESC
  ============================================================ */

  useEffect(() => {
    if (!aberta) {
      return undefined;
    }


    function handleKeyDown(
      event
    ) {
      if (
        event.key === "Escape"
      ) {
        aoAlternar(false);
      }
    }


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    aberta,
    aoAlternar,
  ]);


  if (!aberta) {
    return null;
  }


  return (
    <div
      ref={dropdownRef}
      className="notifications-dropdown"
      role="dialog"
      aria-label="Notificações"
    >

      {/* ========================================================
          CABEÇALHO
      ======================================================== */}

      <div className="notifications-dropdown-header">

        <div className="notifications-dropdown-title">

          <span
            className="notifications-dropdown-title-icon"
            aria-hidden="true"
          >
            <IconBell size={18} />
          </span>

          <strong>
            Notificações
          </strong>

        </div>


        <div className="notifications-dropdown-header-actions">

          {naoLidas > 0 && (
            <button
              type="button"
              className="notifications-dropdown-mark-all"
              onClick={
                marcarTodasComoLidas
              }
            >
              Marcar todas como lidas
            </button>
          )}


          <button
            type="button"
            className="notifications-dropdown-settings"
            onClick={
              abrirConfiguracoes
            }
            aria-label="Configurar notificações"
            title="Configurar notificações"
          >
            ⚙
          </button>

        </div>

      </div>


      {/* ========================================================
          CONTEÚDO
      ======================================================== */}

      {carregando ? (

        <div
          className="notifications-dropdown-loading"
          role="status"
          aria-live="polite"
        >
          <span
            className="notifications-dropdown-state-icon"
            aria-hidden="true"
          >
            <IconBell size={23} />
          </span>

          <strong>
            Carregando notificações...
          </strong>
        </div>

      ) : erro ? (

        <div
          className="notifications-dropdown-error"
          role="alert"
        >
          <span
            className="notifications-dropdown-state-icon"
            aria-hidden="true"
          >
            <IconBell size={23} />
          </span>

          <strong>
            Não foi possível carregar
            as notificações.
          </strong>

          <button
            type="button"
            onClick={() =>
              carregarNotificacoes({
                mostrarCarregamento: true,
              })
            }
          >
            Tentar novamente
          </button>
        </div>

      ) : notificacoes.length === 0 ? (

        <div className="notifications-dropdown-empty">

          <span
            className="notifications-dropdown-state-icon"
            aria-hidden="true"
          >
            <IconBell size={25} />
          </span>

          <strong>
            Tudo tranquilo por aqui
          </strong>

          <p>
            Quando alguém demonstrar
            interesse em um dos seus
            itens, você verá a
            notificação aqui.
          </p>

        </div>

      ) : (

        <div
          className="notifications-dropdown-list"
          role="list"
        >

          {notificacoes.map(
            (notificacao) => {

              const possuiAcoes =
                notificacaoPossuiAcoes(
                  notificacao
                );


              const acaoConcluida =
                acoesConcluidas.has(
                  notificacao.id
                );


              const solicitacao =
                obterSolicitacaoDaNotificacao(
                  notificacao
                );


              const solicitacaoId =
                solicitacao?.id ||
                notificacao.referencia_id ||
                null;


              const aceitarEmAndamento =
                acaoEmAndamento ===
                `aceitar-${solicitacaoId}`;


              const recusarEmAndamento =
                acaoEmAndamento ===
                `recusar-${solicitacaoId}`;


              const excluindo =
                excluindoNotificacao ===
                notificacao.id;


              /*
               * Mantém o estado sendo utilizado
               * para atualizar os horários relativos.
               */
              void momentoAtual;


              return (
                <article
                  key={
                    notificacao.id
                  }
                  role="listitem"
                  className={
                    notificacao.lida
                      ? "notifications-dropdown-item notifications-dropdown-item--read"
                      : "notifications-dropdown-item notifications-dropdown-item--unread"
                  }
                >

                  {/* ==================================================
                      CONTEÚDO
                  ================================================== */}

                  <button
                    type="button"
                    className="notifications-dropdown-main"
                    onClick={() =>
                      abrirNotificacao(
                        notificacao
                      )
                    }
                  >

                    <span
                      className="notifications-dropdown-item-icon"
                      aria-hidden="true"
                    >
                      <IconBell size={16} />
                    </span>


                    <span className="notifications-dropdown-item-content">

                      <span className="notifications-dropdown-item-header">

                        <strong>
                          {
                            notificacao.titulo
                          }
                        </strong>


                        {!notificacao.lida && (
                          <span
                            className="notifications-dropdown-unread-dot"
                            aria-label="Não lida"
                          />
                        )}

                      </span>


                      <span className="notifications-dropdown-item-message">
                        {
                          notificacao.mensagem
                        }
                      </span>


                      <span className="notifications-dropdown-item-date">
                        {
                          formatarDataNotificacao(
                            notificacao.criada_em
                          )
                        }
                      </span>

                    </span>

                  </button>


                  {/* ==================================================
                      EXCLUIR
                  ================================================== */}

                  <button
                    type="button"
                    className="notifications-dropdown-delete"
                    onClick={(event) =>
                      excluirNotificacao(
                        event,
                        notificacao
                      )
                    }
                    disabled={
                      excluindo ||
                      excluindoTodas ||
                      acaoEmAndamento !== null
                    }
                    aria-label={`Excluir notificação: ${
                      notificacao.titulo || "Notificação"
                    }`}
                    title="Excluir notificação"
                  >
                    {excluindo
                      ? "..."
                      : "×"}
                  </button>


                  {/* ==================================================
                      AÇÕES DA SOLICITAÇÃO
                  ================================================== */}

                  {possuiAcoes &&
                    !acaoConcluida &&
                    solicitacaoId && (
                      <div
                        className="notifications-dropdown-actions"
                        aria-label="Ações da solicitação"
                      >

                        <button
                          type="button"
                          className="notifications-dropdown-action notifications-dropdown-action--reject"
                          onClick={(event) =>
                            recusarSolicitacao(
                              event,
                              notificacao
                            )
                          }
                          disabled={
                            acaoEmAndamento !==
                            null
                          }
                        >
                          {recusarEmAndamento
                            ? "Recusando..."
                            : "Recusar"}
                        </button>


                        <button
                          type="button"
                          className="notifications-dropdown-action notifications-dropdown-action--accept"
                          onClick={(event) =>
                            aceitarSolicitacao(
                              event,
                              notificacao
                            )
                          }
                          disabled={
                            acaoEmAndamento !==
                            null
                          }
                        >
                          {aceitarEmAndamento
                            ? "Confirmando..."
                            : "Confirmar"}
                        </button>

                      </div>
                    )}


                  {/* ==================================================
                      AÇÃO CONCLUÍDA
                  ================================================== */}

                  {possuiAcoes &&
                    acaoConcluida && (
                      <div className="notifications-dropdown-action-complete">
                        Solicitação processada.
                      </div>
                    )}

                </article>
              );
            }
          )}

        </div>
      )}


      {/* ========================================================
          RODAPÉ
      ======================================================== */}

      {notificacoes.length > 0 && (
        <div className="notifications-dropdown-footer">

          <button
            type="button"
            className="notifications-dropdown-delete-all"
            onClick={
              excluirTodasNotificacoes
            }
            disabled={
              excluindoTodas ||
              excluindoNotificacao !== null
            }
          >
            {excluindoTodas
              ? "Excluindo..."
              : "Excluir todas"}
          </button>

        </div>
      )}

    </div>
  );
}


export default NotificationsDropdown;