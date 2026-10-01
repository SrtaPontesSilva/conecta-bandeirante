import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconTicket,
  IconPlus,
} from "../../components/Icons/Icons";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

import api from "../../services/api";

import "./DashboardParceiro.css";


function DashboardParceiro() {
  const navigate = useNavigate();

  const [cupons, setCupons] = useState([]);
  const [carregando, setCarregando] = useState(true);


  useEffect(() => {
    carregarCupons();
  }, []);


  async function carregarCupons() {
    try {
      setCarregando(true);

      const resposta = await api.get(
        "/cupons/meus"
      );

      setCupons(
        resposta.data?.cupons || []
      );

    } catch (erro) {
      console.error(
        "Erro ao carregar cupons:",
        erro
      );

      setCupons([]);

    } finally {
      setCarregando(false);
    }
  }


  const cuponsAtivos = cupons.filter(
    (cupom) => cupom.ativo
  );


  function formatarData(data) {
    if (!data) {
      return "";
    }

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
      return "";
    }

    return dataFormatada.toLocaleDateString(
      "pt-BR"
    );
  }


  function obterStatusCupom(cupom) {
    if (!cupom.ativo) {
      return {
        texto: "Arquivado",
        classe: "arquivado",
      };
    }

    const agora = new Date();

    const inicio = new Date(
      cupom.validade_inicio
    );

    const fim = new Date(
      cupom.validade_fim
    );

    if (agora < inicio) {
      return {
        texto: "Agendado",
        classe: "agendado",
      };
    }

    if (agora >= fim) {
      return {
        texto: "Expirado",
        classe: "expirado",
      };
    }

    return {
      texto: "Ativo",
      classe: "ativo",
    };
  }


  return (
    <div className="dashboard-parceiro">

      <MarketplaceNavbar
        tipo="parceiro"
      />


      <main className="dashboard-parceiro__main">

        {/* ==================================================
            CABEÇALHO
        ================================================== */}

        <section className="dashboard-parceiro__header">

          <div>
            <span className="dashboard-parceiro__eyebrow">
              Área do parceiro
            </span>

            <h1>
              Olá! 👋
            </h1>

            <p>
              Acompanhe seus benefícios
              e a participação da comunidade.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-parceiro__primary-action"
            onClick={() =>
              navigate(
                "/parceiro/cupons/novo"
              )
            }
          >
            <IconPlus
              size={19}
              aria-hidden="true"
            />

            <span>
              Novo cupom
            </span>
          </button>

        </section>


        {/* ==================================================
            RESUMO
        ================================================== */}

        <section
          className="dashboard-parceiro__stats"
          aria-label="Resumo do parceiro"
        >

          <article className="dashboard-stat">

            <span className="dashboard-stat__label">
              Cupons ativos
            </span>

            <strong className="dashboard-stat__value">
              {carregando
                ? "—"
                : cuponsAtivos.length}
            </strong>

            <span className="dashboard-stat__description">
              benefícios disponíveis
            </span>

          </article>


          <article className="dashboard-stat">

            <span className="dashboard-stat__label">
              Cupons cadastrados
            </span>

            <strong className="dashboard-stat__value">
              {carregando
                ? "—"
                : cupons.length}
            </strong>

            <span className="dashboard-stat__description">
              no seu espaço
            </span>

          </article>


          <article className="dashboard-stat dashboard-stat--highlight">

            <span className="dashboard-stat__label">
              Participação
            </span>

            <strong className="dashboard-stat__value">
              Ativa
            </strong>

            <span className="dashboard-stat__description">
              conectado à comunidade
            </span>

          </article>

        </section>


        {/* ==================================================
            AÇÕES RÁPIDAS
        ================================================== */}

        <section className="dashboard-parceiro__section">

          <div className="dashboard-parceiro__section-header">

            <div>
              <span className="dashboard-parceiro__eyebrow">
                Atalhos
              </span>

              <h2>
                O que você deseja fazer?
              </h2>
            </div>

          </div>


          <div className="dashboard-parceiro__actions">

            <button
              type="button"
              className="dashboard-action"
              onClick={() =>
                navigate(
                  "/parceiro/cupons/novo"
                )
              }
            >
              <span className="dashboard-action__icon">
                <IconPlus
                  size={22}
                  aria-hidden="true"
                />
              </span>

              <span className="dashboard-action__content">

                <strong>
                  Criar cupom
                </strong>

                <small>
                  Publique um novo benefício
                  para a comunidade.
                </small>

              </span>
            </button>


            <button
              type="button"
              className="dashboard-action"
              onClick={() =>
                navigate(
                  "/parceiro/cupons"
                )
              }
            >
              <span className="dashboard-action__icon dashboard-action__icon--secondary">
                <IconTicket
                  size={22}
                  aria-hidden="true"
                />
              </span>

              <span className="dashboard-action__content">

                <strong>
                  Gerenciar cupons
                </strong>

                <small>
                  Veja, edite e arquive
                  seus benefícios.
                </small>

              </span>
            </button>

          </div>

        </section>


        {/* ==================================================
            CUPONS RECENTES
        ================================================== */}

        <section className="dashboard-parceiro__section">

          <div className="dashboard-parceiro__section-header">

            <div>
              <span className="dashboard-parceiro__eyebrow">
                Seus benefícios
              </span>

              <h2>
                Cupons recentes
              </h2>
            </div>


            {cupons.length > 0 && (
              <button
                type="button"
                className="dashboard-parceiro__link"
                onClick={() =>
                  navigate(
                    "/parceiro/cupons"
                  )
                }
              >
                Ver todos
              </button>
            )}

          </div>


          {carregando ? (

            <div className="dashboard-empty">
              <span>
                Carregando seus cupons...
              </span>
            </div>

          ) : cupons.length === 0 ? (

            <div className="dashboard-empty">

              <div className="dashboard-empty__icon">
                <IconTicket
                  size={24}
                  aria-hidden="true"
                />
              </div>

              <div>

                <strong>
                  Você ainda não possui cupons.
                </strong>

                <p>
                  Crie seu primeiro benefício
                  para começar a participar
                  da comunidade.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/parceiro/cupons/novo"
                  )
                }
              >
                Criar primeiro cupom
              </button>

            </div>

          ) : (

            <div className="dashboard-coupons">

              {cupons
                .slice(0, 3)
                .map((cupom) => {

                  const status =
                    obterStatusCupom(
                      cupom
                    );

                  return (
                    <article
                      className="dashboard-coupon"
                      key={cupom.id}
                    >

                      <div className="dashboard-coupon__image">

                        {cupom.imagem_url ? (

                          <img
                            src={
                              cupom.imagem_url
                            }
                            alt=""
                          />

                        ) : (

                          <IconTicket
                            size={25}
                            aria-hidden="true"
                          />

                        )}

                      </div>


                      <div className="dashboard-coupon__body">

                        <div className="dashboard-coupon__top">

                          <span
                            className={
                              `dashboard-coupon__status ` +
                              `dashboard-coupon__status--${status.classe}`
                            }
                          >
                            {status.texto}
                          </span>

                        </div>


                        <h3>
                          {cupom.titulo}
                        </h3>

                        <p>
                          {cupom.pontos} pontos
                        </p>

                        <small>
                          Válido até{" "}
                          {formatarData(
                            cupom.validade_fim
                          )}
                        </small>

                      </div>

                    </article>
                  );

                })}

            </div>

          )}

        </section>

      </main>


      <BottomNavigation
        tipo="parceiro"
      />

    </div>
  );
}


export default DashboardParceiro;