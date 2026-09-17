import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";

import ImageCarousel from "../../components/ImageCarousel/ImageCarousel";

import api from "../../services/api";

import "./DetalheAnuncio.css";


const CONDICOES = {
  novo: "Novo",
  bom_estado: "Bom estado",
  usado: "Usado",
};


const STATUS_SOLICITACAO = {
  pendente: "Em análise",
  aceita: "Confirmada",
  recusada: "Recusada",
  cancelada: "Cancelada",
};


function formatarPreco(
  preco
) {
  if (
    preco === null ||
    preco === undefined
  ) {
    return "";
  }

  return Number(
    preco
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}


function formatarData(
  data
) {
  if (!data) {
    return "";
  }

  const partes =
    data.split("-");

  if (
    partes.length !== 3
  ) {
    return data;
  }

  const [
    ano,
    mes,
    dia,
  ] = partes;

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  ).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}


function obterLabelModalidade(
  modalidade
) {
  if (
    modalidade ===
    "doacao"
  ) {
    return "Doação";
  }

  if (
    modalidade ===
    "troca"
  ) {
    return "Troca";
  }

  return "Venda";
}


function obterNomeSolicitante(
  solicitacao
) {
  if (
    solicitacao?.interessado?.nome
  ) {
    return solicitacao.interessado.nome;
  }

  return "Usuário";
}


function obterDataSolicitacao(
  solicitacao
) {
  return solicitacao?.disponibilidade?.data || null;
}


function obterDisponibilidadeId(
  solicitacao
) {
  return solicitacao?.disponibilidade?.id || null;
}


function DetalheAnuncio() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  const [
    anuncio,
    setAnuncio,
  ] = useState(null);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erro,
    setErro,
  ] = useState("");


  const [
    dataSelecionada,
    setDataSelecionada,
  ] = useState(null);

  const [
    minhaSolicitacao,
    setMinhaSolicitacao,
  ] = useState(null);

  const [
    solicitacoesRecebidas,
    setSolicitacoesRecebidas,
  ] = useState([]);

  const [
    carregandoSolicitacoes,
    setCarregandoSolicitacoes,
  ] = useState(false);

  const [
    enviandoSolicitacao,
    setEnviandoSolicitacao,
  ] = useState(false);

  const [
    processandoSolicitacaoId,
    setProcessandoSolicitacaoId,
  ] = useState(null);

  const [
    mensagemSolicitacao,
    setMensagemSolicitacao,
  ] = useState("");

  const [
    erroSolicitacao,
    setErroSolicitacao,
  ] = useState("");


  let usuario = null;
  let parceiro = null;

  try {
    usuario =
      JSON.parse(
        localStorage.getItem(
          "usuario"
        )
      );

    parceiro =
      JSON.parse(
        localStorage.getItem(
          "parceiro"
        )
      );
  } catch {
    usuario = null;
    parceiro = null;
  }


  const pessoa =
    usuario || parceiro;


  const souDono =
    Boolean(
      usuario &&
      anuncio &&
      Number(usuario.id) ===
        Number(anuncio.usuario_id)
    );


  useEffect(() => {
    if (!pessoa) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    carregarDados();
  }, [id]);


  async function carregarDados() {
    setCarregando(
      true
    );

    setErro("");

    setMensagemSolicitacao(
      ""
    );

    setErroSolicitacao(
      ""
    );


    try {
      const resposta =
        await api.get(
          `/anuncios/${id}`
        );

      const anuncioCarregado =
        resposta.data;

      setAnuncio(
        anuncioCarregado
      );


      const usuarioEhDono =
        Boolean(
          usuario &&
          Number(usuario.id) ===
            Number(
              anuncioCarregado.usuario_id
            )
        );


      if (
        anuncioCarregado.modalidade ===
        "doacao" &&
        usuario
      ) {
        if (
          usuarioEhDono
        ) {
          await carregarSolicitacoesRecebidas(
            anuncioCarregado.id
          );
        } else {
          await carregarMinhaSolicitacao(
            anuncioCarregado.id
          );
        }
      } else {
        setMinhaSolicitacao(
          null
        );

        setSolicitacoesRecebidas(
          []
        );
      }

    } catch (error) {
      setErro(
        error.response?.data?.erro ||
          "Não foi possível carregar o anúncio."
      );
    } finally {
      setCarregando(
        false
      );
    }
  }


  async function carregarMinhaSolicitacao(
    anuncioId = id
  ) {
    try {
      const resposta =
        await api.get(
          "/solicitacoes"
        );

      const enviadas =
        Array.isArray(
          resposta.data?.enviadas
        )
          ? resposta.data.enviadas
          : [];

      const solicitacao =
        enviadas.find(
          (item) =>
            Number(
              item.anuncio?.id
            ) ===
            Number(anuncioId) &&
            item.tipo ===
              "doacao"
        ) || null;

      setMinhaSolicitacao(
        solicitacao
      );

      if (
        solicitacao
      ) {
        const disponibilidadeId =
          obterDisponibilidadeId(
            solicitacao
          );

        if (
          disponibilidadeId
        ) {
          setDataSelecionada(
            disponibilidadeId
          );
        }
      }

    } catch (error) {
      setMinhaSolicitacao(
        null
      );

      setErroSolicitacao(
        error.response?.data?.erro ||
          "Não foi possível verificar sua solicitação."
      );
    }
  }


  async function carregarSolicitacoesRecebidas(
    anuncioId = id
  ) {
    setCarregandoSolicitacoes(
      true
    );

    try {
      const resposta =
        await api.get(
          "/solicitacoes"
        );

      const recebidas =
        Array.isArray(
          resposta.data?.recebidas
        )
          ? resposta.data.recebidas
          : [];

      const solicitacoesDoAnuncio =
        recebidas.filter(
          (solicitacao) =>
            Number(
              solicitacao.anuncio?.id
            ) ===
            Number(anuncioId) &&
            solicitacao.tipo ===
              "doacao"
        );

      setSolicitacoesRecebidas(
        solicitacoesDoAnuncio
      );

    } catch (error) {
      setSolicitacoesRecebidas(
        []
      );

      setErroSolicitacao(
        error.response?.data?.erro ||
          "Não foi possível carregar as solicitações."
      );
    } finally {
      setCarregandoSolicitacoes(
        false
      );
    }
  }


  async function solicitarDoacao() {
    if (
      !usuario
    ) {
      setErroSolicitacao(
        "Apenas usuários podem solicitar uma doação."
      );

      return;
    }

    if (
      !dataSelecionada
    ) {
      setErroSolicitacao(
        "Selecione uma data para retirada."
      );

      return;
    }

    if (
      anuncio.status !==
      "disponivel"
    ) {
      setErroSolicitacao(
        "Este anúncio não está mais disponível."
      );

      return;
    }


    setEnviandoSolicitacao(
      true
    );

    setMensagemSolicitacao(
      ""
    );

    setErroSolicitacao(
      ""
    );


    try {
      const resposta =
        await api.post(
          "/solicitacoes",
          {
            anuncio_id:
              Number(
                id
              ),

            disponibilidade_id:
              Number(
                dataSelecionada
              ),
          }
        );

      setMinhaSolicitacao(
        resposta.data?.solicitacao ||
          null
      );

      setMensagemSolicitacao(
        "Sua solicitação foi enviada. Aguarde a confirmação do responsável pelo item."
      );

    } catch (error) {
      setErroSolicitacao(
        error.response?.data?.erro ||
          "Não foi possível enviar sua solicitação."
      );

    } finally {
      setEnviandoSolicitacao(
        false
      );
    }
  }


  async function confirmarSolicitacao(
    solicitacaoId
  ) {
    setProcessandoSolicitacaoId(
      solicitacaoId
    );

    setMensagemSolicitacao(
      ""
    );

    setErroSolicitacao(
      ""
    );


    try {
      await api.patch(
        `/solicitacoes/${solicitacaoId}/aceitar`
      );

      setMensagemSolicitacao(
        "Solicitação confirmada. O item agora está reservado."
      );

      await carregarDados();

    } catch (error) {
      setErroSolicitacao(
        error.response?.data?.erro ||
          "Não foi possível confirmar a solicitação."
      );
    } finally {
      setProcessandoSolicitacaoId(
        null
      );
    }
  }


  async function recusarSolicitacao(
    solicitacaoId
  ) {
    setProcessandoSolicitacaoId(
      solicitacaoId
    );

    setMensagemSolicitacao(
      ""
    );

    setErroSolicitacao(
      ""
    );


    try {
      await api.patch(
        `/solicitacoes/${solicitacaoId}/recusar`
      );

      setMensagemSolicitacao(
        "Solicitação recusada."
      );

      await carregarDados();

    } catch (error) {
      setErroSolicitacao(
        error.response?.data?.erro ||
          "Não foi possível recusar a solicitação."
      );
    } finally {
      setProcessandoSolicitacaoId(
        null
      );
    }
  }


  function voltar() {
    navigate(
      "/inicio"
    );
  }


  function selecionarData(
    disponibilidade
  ) {
    if (
      anuncio.status !==
      "disponivel"
    ) {
      return;
    }

    if (
      minhaSolicitacao?.status ===
      "pendente"
    ) {
      return;
    }

    if (
      minhaSolicitacao?.status ===
      "aceita"
    ) {
      return;
    }

    setDataSelecionada(
      disponibilidade.id
    );

    setMensagemSolicitacao(
      ""
    );

    setErroSolicitacao(
      ""
    );
  }


  if (carregando) {
    return (
      <main className="detalhe-anuncio-page">

        <MarketplaceNavbar
          pessoa={pessoa}
          tituloPagina="Anúncio"
          aoVoltarPagina={
            voltar
          }
        />

        <div
          className="detalhe-feedback"
          role="status"
          aria-live="polite"
        >
          Carregando anúncio...
        </div>

      </main>
    );
  }


  if (
    erro ||
    !anuncio
  ) {
    return (
      <main className="detalhe-anuncio-page">

        <MarketplaceNavbar
          pessoa={pessoa}
          tituloPagina="Anúncio"
          aoVoltarPagina={
            voltar
          }
        />

        <div className="detalhe-feedback detalhe-feedback--error">

          <h1>
            Anúncio não encontrado
          </h1>

          <p>
            {erro ||
              "Este anúncio não está disponível."}
          </p>

          <button
            type="button"
            onClick={
              voltar
            }
          >
            Voltar para os anúncios
          </button>

        </div>

      </main>
    );
  }


  const modalidadeLabel =
    obterLabelModalidade(
      anuncio.modalidade
    );


  const disponibilidades =
    Array.isArray(
      anuncio.datas
    )
      ? anuncio.datas
      : [];


  const datasDisponiveis =
    disponibilidades.filter(
      (disponibilidade) =>
        disponibilidade.status ===
        "disponivel"
    );


  const podeSolicitarDoacao =
    anuncio.modalidade ===
      "doacao" &&
    Boolean(usuario) &&
    !souDono &&
    anuncio.status ===
      "disponivel";


  const solicitacaoPendente =
    minhaSolicitacao?.status ===
    "pendente";


  const solicitacaoConfirmada =
    minhaSolicitacao?.status ===
    "aceita";


  return (
    <main className="detalhe-anuncio-page">

      <MarketplaceNavbar
        pessoa={pessoa}
        tituloPagina="Anúncio"
        aoVoltarPagina={
          voltar
        }
      />


      <section className="detalhe-anuncio-content">

        <button
          type="button"
          className="detalhe-back-button"
          onClick={
            voltar
          }
          aria-label="Voltar para os anúncios"
        >
          ← Voltar para anúncios
        </button>


        <div className="detalhe-anuncio-grid">

          <section className="detalhe-galeria">

            <ImageCarousel
              imagens={
                anuncio.imagens
              }
              titulo={
                anuncio.titulo
              }
            />

          </section>


          <section className="detalhe-informacoes">

            <div className="detalhe-identificacao">

              <span
                className={`detalhe-badge detalhe-badge--${anuncio.modalidade}`}
              >
                {modalidadeLabel}
              </span>


              <span className="detalhe-categoria">
                {anuncio.categoria}
              </span>

            </div>


            <h1>
              {anuncio.titulo}
            </h1>


            <div className="detalhe-preco">

              {anuncio.modalidade ===
              "venda" ? (
                <strong>
                  {
                    formatarPreco(
                      anuncio.preco
                    )
                  }
                </strong>
              ) : anuncio.modalidade ===
                "doacao" ? (
                <strong>
                  Gratuito
                </strong>
              ) : (
                <strong>
                  Aceita troca
                </strong>
              )}

            </div>


            {anuncio.status ===
              "reservado" && (
              <div
                className="detalhe-status-reservado"
                role="status"
              >
                <strong>
                  Item reservado
                </strong>

                <p>
                  Este item já possui
                  uma reserva confirmada
                  e não está mais
                  disponível para novas
                  solicitações.
                </p>
              </div>
            )}


            <div className="detalhe-info-block">

              <h2>
                Sobre o item
              </h2>

              <p>
                {
                  anuncio.descricao
                }
              </p>

            </div>


            <div className="detalhe-info-list">

              <div>
                <span>
                  Condição
                </span>

                <strong>
                  {
                    CONDICOES[
                      anuncio.condicao
                    ] ||
                    anuncio.condicao
                  }
                </strong>
              </div>


              <div>
                <span>
                  Fotos
                </span>

                <strong>
                  {
                    anuncio.imagens
                      ?.length || 0
                  }

                  {
                    anuncio.imagens
                      ?.length === 1
                      ? " foto"
                      : " fotos"
                  }
                </strong>
              </div>

            </div>


            <div className="detalhe-entrega">

              <strong>
                Retirada segura na escola
              </strong>

              <p>
                A entrega ou retirada
                acontece em um espaço
                reservado no La Salle
                Bandeirante.
              </p>

            </div>


            <div className="detalhe-datas">

              <h2>
                Dias disponíveis
              </h2>


              {disponibilidades.length >
              0 ? (
                <div
                  className="detalhe-datas-lista"
                  role={
                    podeSolicitarDoacao
                      ? "radiogroup"
                      : undefined
                  }
                  aria-label={
                    podeSolicitarDoacao
                      ? "Escolha uma data para retirada"
                      : undefined
                  }
                >

                  {disponibilidades.map(
                    (
                      disponibilidade
                    ) => {
                      const estaDisponivel =
                        disponibilidade.status ===
                        "disponivel";

                      const selecionada =
                        Number(
                          dataSelecionada
                        ) ===
                        Number(
                          disponibilidade.id
                        );

                      const bloqueada =
                        !podeSolicitarDoacao ||
                        !estaDisponivel ||
                        solicitacaoPendente ||
                        solicitacaoConfirmada;


                      return (
                        <button
                          key={
                            disponibilidade.id
                          }
                          type="button"
                          className={`detalhe-data-option ${
                            selecionada
                              ? "detalhe-data-option--selecionada"
                              : ""
                          } ${
                            !estaDisponivel
                              ? "detalhe-data-option--indisponivel"
                              : ""
                          }`}
                          onClick={() =>
                            selecionarData(
                              disponibilidade
                            )
                          }
                          disabled={
                            bloqueada
                          }
                          role={
                            podeSolicitarDoacao
                              ? "radio"
                              : undefined
                          }
                          aria-checked={
                            podeSolicitarDoacao
                              ? selecionada
                              : undefined
                          }
                          aria-label={`${formatarData(
                            disponibilidade.data
                          )}${
                            !estaDisponivel
                              ? ", indisponível"
                              : ""
                          }`}
                        >
                          <span>
                            {
                              formatarData(
                                disponibilidade.data
                              )
                            }
                          </span>

                          {!estaDisponivel && (
                            <small>
                              Indisponível
                            </small>
                          )}
                        </button>
                      );
                    }
                  )}

                </div>
              ) : (
                <p>
                  Nenhuma data disponível
                  no momento.
                </p>
              )}

            </div>


            {anuncio.modalidade ===
              "doacao" && (
              <section className="detalhe-doacao-reserva">

                <div className="detalhe-doacao-reserva__cabecalho">

                  <span className="detalhe-doacao-reserva__icone">
                    ♡
                  </span>

                  <div>
                    <h2>
                      Solicitação de doação
                    </h2>

                    <p>
                      Escolha uma das
                      datas disponíveis
                      para demonstrar
                      interesse neste item.
                    </p>
                  </div>

                </div>


                {souDono ? (
                  <div className="detalhe-solicitacoes-recebidas">

                    <div className="detalhe-solicitacoes-recebidas__titulo">

                      <h3>
                        Solicitações recebidas
                      </h3>

                      <span>
                        {
                          solicitacoesRecebidas.filter(
                            (solicitacao) =>
                              solicitacao.status ===
                              "pendente"
                          ).length
                        }
                      </span>

                    </div>


                    {carregandoSolicitacoes ? (
                      <p className="detalhe-solicitacoes-feedback">
                        Carregando solicitações...
                      </p>
                    ) : solicitacoesRecebidas.filter(
                        (solicitacao) =>
                          solicitacao.status ===
                          "pendente"
                      ).length === 0 ? (
                      <p className="detalhe-solicitacoes-feedback">
                        Nenhuma solicitação
                        pendente no momento.
                      </p>
                    ) : (
                      <div className="detalhe-solicitacoes-lista">

                        {solicitacoesRecebidas
                          .filter(
                            (solicitacao) =>
                              solicitacao.status ===
                              "pendente"
                          )
                          .map(
                            (
                              solicitacao
                            ) => (
                              <article
                                key={
                                  solicitacao.id
                                }
                                className="detalhe-solicitacao-card"
                              >

                                <div className="detalhe-solicitacao-card__dados">

                                  <strong>
                                    {
                                      obterNomeSolicitante(
                                        solicitacao
                                      )
                                    }
                                  </strong>

                                  <span>
                                    Interesse para:
                                  </span>

                                  <b>
                                    {
                                      formatarData(
                                        obterDataSolicitacao(
                                          solicitacao
                                        )
                                      )
                                    }
                                  </b>

                                </div>


                                <div className="detalhe-solicitacao-card__acoes">

                                  <button
                                    type="button"
                                    className="detalhe-solicitacao-button detalhe-solicitacao-button--confirmar"
                                    onClick={() =>
                                      confirmarSolicitacao(
                                        solicitacao.id
                                      )
                                    }
                                    disabled={
                                      processandoSolicitacaoId !==
                                        null
                                    }
                                  >
                                    {
                                      processandoSolicitacaoId ===
                                      solicitacao.id
                                        ? "Processando..."
                                        : "Confirmar"
                                    }
                                  </button>


                                  <button
                                    type="button"
                                    className="detalhe-solicitacao-button detalhe-solicitacao-button--recusar"
                                    onClick={() =>
                                      recusarSolicitacao(
                                        solicitacao.id
                                      )
                                    }
                                    disabled={
                                      processandoSolicitacaoId !==
                                        null
                                    }
                                  >
                                    Recusar
                                  </button>

                                </div>

                              </article>
                            )
                          )}

                      </div>
                    )}

                  </div>
                ) : !usuario ? (
                  <div className="detalhe-doacao-aviso">
                    <strong>
                      Entre com uma conta de usuário
                    </strong>

                    <p>
                      Apenas usuários podem
                      demonstrar interesse em
                      itens disponíveis para
                      doação.
                    </p>
                  </div>
                ) : anuncio.status !==
                  "disponivel" ? (
                  <div className="detalhe-doacao-aviso detalhe-doacao-aviso--reservado">

                    <strong>
                      Este item já foi reservado
                    </strong>

                    <p>
                      No momento, não é possível
                      enviar uma nova solicitação
                      para este anúncio.
                    </p>

                  </div>
                ) : solicitacaoConfirmada ? (
                  <div
                    className="detalhe-doacao-status detalhe-doacao-status--confirmada"
                    role="status"
                    aria-live="polite"
                  >

                    <strong>
                      Reserva confirmada
                    </strong>

                    <p>
                      Sua solicitação foi
                      confirmada para{" "}
                      <strong>
                        {
                          formatarData(
                            obterDataSolicitacao(
                              minhaSolicitacao
                            )
                          )
                        }
                      </strong>
                      .
                    </p>

                    <span>
                      A retirada acontece
                      no espaço reservado
                      no La Salle Bandeirante.
                    </span>

                  </div>
                ) : solicitacaoPendente ? (
                  <div
                    className="detalhe-doacao-status detalhe-doacao-status--pendente"
                    role="status"
                    aria-live="polite"
                  >

                    <strong>
                      Solicitação em análise
                    </strong>

                    <p>
                      Você demonstrou interesse
                      neste item para{" "}
                      <strong>
                        {
                          formatarData(
                            obterDataSolicitacao(
                              minhaSolicitacao
                            )
                          )
                        }
                      </strong>
                      .
                    </p>

                    <span>
                      Aguarde a confirmação
                      do responsável pelo item.
                    </span>

                  </div>
                ) : (
                  <>
                    <p className="detalhe-doacao-instrucao">
                      Selecione uma data acima
                      e envie sua solicitação.
                    </p>


                    {mensagemSolicitacao && (
                      <div
                        className="detalhe-mensagem detalhe-mensagem--sucesso"
                        role="status"
                        aria-live="polite"
                      >
                        {mensagemSolicitacao}
                      </div>
                    )}


                    {erroSolicitacao && (
                      <div
                        className="detalhe-mensagem detalhe-mensagem--erro"
                        role="alert"
                      >
                        {erroSolicitacao}
                      </div>
                    )}


                    <button
                      type="button"
                      className="detalhe-doacao-button"
                      onClick={
                        solicitarDoacao
                      }
                      disabled={
                        enviandoSolicitacao ||
                        !dataSelecionada ||
                        datasDisponiveis.length ===
                          0
                      }
                    >
                      {enviandoSolicitacao
                        ? "Enviando solicitação..."
                        : "Tenho interesse nesta data"}
                    </button>

                  </>
                )}


                {souDono &&
                  mensagemSolicitacao && (
                    <div
                      className="detalhe-mensagem detalhe-mensagem--sucesso"
                      role="status"
                      aria-live="polite"
                    >
                      {mensagemSolicitacao}
                    </div>
                  )}


                {souDono &&
                  erroSolicitacao && (
                    <div
                      className="detalhe-mensagem detalhe-mensagem--erro"
                      role="alert"
                    >
                      {erroSolicitacao}
                    </div>
                  )}

              </section>
            )}

          </section>

        </div>

      </section>

    </main>
  );
}


export default DetalheAnuncio;
