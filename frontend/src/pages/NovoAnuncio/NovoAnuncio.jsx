import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./NovoAnuncio.css";

const CATEGORIAS = [
  "Livro didático",
  "Livro paradidático",
  "Uniforme",
  "Material escolar",
  "Material de desenho",
  "Material de laboratório",
  "Outro",
];

const CONDICOES = [
  {
    value: "novo",
    label: "Novo",
  },
  {
    value: "bom_estado",
    label: "Bom estado",
  },
  {
    value: "usado",
    label: "Usado",
  },
];

const MODALIDADES = [
  {
    value: "doacao",
    label: "Doação",
    description:
      "Quero disponibilizar este item gratuitamente.",
  },
  {
    value: "troca",
    label: "Troca",
    description:
      "Quero trocar este item por outro da comunidade.",
  },
  {
    value: "venda",
    label: "Venda",
    description:
      "Quero vender este item por um valor acessível.",
  },
];

function formatarMes(data) {
  return data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function obterDiasDoMes(data) {
  const ano = data.getFullYear();
  const mes = data.getMonth();

  const primeiroDia = new Date(
    ano,
    mes,
    1
  );

  const ultimoDia = new Date(
    ano,
    mes + 1,
    0
  );

  const primeiroDiaSemana =
    primeiroDia.getDay();

  const quantidadeDias =
    ultimoDia.getDate();

  const dias = [];

  for (
    let i = 0;
    i < primeiroDiaSemana;
    i++
  ) {
    dias.push(null);
  }

  for (
    let dia = 1;
    dia <= quantidadeDias;
    dia++
  ) {
    dias.push(
      new Date(
        ano,
        mes,
        dia
      )
    );
  }

  return dias;
}

function formatarDataAPI(data) {
  const ano = data.getFullYear();
  const mes = String(
    data.getMonth() + 1
  ).padStart(2, "0");
  const dia = String(
    data.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function dataJaSelecionada(data, datasSelecionadas) {
  return datasSelecionadas.includes(
    formatarDataAPI(data)
  );
}

function NovoAnuncio() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    modalidade: "",
    condicao: "",
    preco: "",
  });

  const [mesAtual, setMesAtual] = useState(
    new Date()
  );

  const [datasSelecionadas, setDatasSelecionadas] =
    useState([]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] =
    useState(false);

  const usuario = JSON.parse(
    localStorage.getItem("usuario")
  );

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormulario(
      (estadoAnterior) => ({
        ...estadoAnterior,
        [name]: value,
      })
    );
  }

  function selecionarData(data) {
    if (!data) {
      return;
    }

    const dataFormatada =
      formatarDataAPI(data);

    setDatasSelecionadas(
      (datasAnteriores) => {
        if (
          datasAnteriores.includes(
            dataFormatada
          )
        ) {
          return datasAnteriores.filter(
            (item) =>
              item !== dataFormatada
          );
        }

        return [
          ...datasAnteriores,
          dataFormatada,
        ].sort();
      }
    );
  }

  function mudarMes(direcao) {
    setMesAtual(
      (mesAnterior) =>
        new Date(
          mesAnterior.getFullYear(),
          mesAnterior.getMonth() +
            direcao,
          1
        )
    );
  }

  function voltarInicio() {
    navigate("/inicio");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!usuario?.id) {
      setErro(
        "Não foi possível identificar o usuário. Faça login novamente."
      );

      return;
    }

    if (datasSelecionadas.length === 0) {
      setErro(
        "Selecione pelo menos um dia disponível para entrega."
      );

      return;
    }

    setCarregando(true);

    try {
      const payload = {
        titulo: formulario.titulo,
        descricao: formulario.descricao,
        categoria: formulario.categoria,
        modalidade: formulario.modalidade,
        condicao: formulario.condicao,
        preco:
          formulario.modalidade === "venda"
            ? formulario.preco
            : null,
        usuario_id: usuario.id,
        datas: datasSelecionadas,
      };

      const resposta = await api.post(
        "/anuncios",
        payload
      );

      setSucesso(
        resposta.data.mensagem
      );

      setTimeout(() => {
        navigate("/inicio");
      }, 1000);
    } catch (error) {
      if (
        error.response?.data?.erro
      ) {
        setErro(
          error.response.data.erro
        );
      } else {
        setErro(
          "Não foi possível publicar o anúncio."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  const diasDoMes =
    obterDiasDoMes(mesAtual);

  const mesAnterior =
    new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth() - 1,
      1
    );

  const mesSeguinte =
    new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth() + 1,
      1
    );

  return (
    <main className="novo-anuncio-page">
      <header className="novo-anuncio-header">
        <button
          type="button"
          className="novo-anuncio-back"
          onClick={voltarInicio}
        >
          ← Voltar
        </button>

        <h1>
          Novo anúncio
        </h1>

        <div />
      </header>

      <form
        className="novo-anuncio-content"
        onSubmit={handleSubmit}
      >
        <section className="anuncio-section">
          <div className="anuncio-section-header">
            <span>01</span>

            <div>
              <h2>
                Sobre o item
              </h2>

              <p>
                Conte um pouco sobre o que você
                deseja disponibilizar.
              </p>
            </div>
          </div>

          <div className="anuncio-form-grid">
            <div className="form-group form-group--full">
              <label htmlFor="titulo">
                Título
              </label>

              <input
                id="titulo"
                name="titulo"
                value={formulario.titulo}
                onChange={handleChange}
                placeholder="Ex.: Livro de matemática do 2º ano"
                maxLength={150}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoria">
                Categoria
              </label>

              <select
                id="categoria"
                name="categoria"
                value={formulario.categoria}
                onChange={handleChange}
                required
              >
                <option value="">
                  Selecione uma categoria
                </option>

                {CATEGORIAS.map(
                  (categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condicao">
                Condição
              </label>

              <select
                id="condicao"
                name="condicao"
                value={formulario.condicao}
                onChange={handleChange}
                required
              >
                <option value="">
                  Selecione a condição
                </option>

                {CONDICOES.map(
                  (condicao) => (
                    <option
                      key={condicao.value}
                      value={condicao.value}
                    >
                      {condicao.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="descricao">
                Descrição
              </label>

              <textarea
                id="descricao"
                name="descricao"
                value={formulario.descricao}
                onChange={handleChange}
                placeholder="Descreva o estado do item, tamanho, série, edição ou outras informações importantes."
                rows={5}
                required
              />
            </div>
          </div>
        </section>

        <section className="anuncio-section">
          <div className="anuncio-section-header">
            <span>02</span>

            <div>
              <h2>
                Como você deseja disponibilizar?
              </h2>

              <p>
                Escolha uma modalidade para o seu item.
              </p>
            </div>
          </div>

          <div className="modalidade-options">
            {MODALIDADES.map(
              (modalidade) => (
                <label
                  key={modalidade.value}
                  className={
                    formulario.modalidade ===
                    modalidade.value
                      ? "modalidade-option modalidade-option--active"
                      : "modalidade-option"
                  }
                >
                  <input
                    type="radio"
                    name="modalidade"
                    value={
                      modalidade.value
                    }
                    checked={
                      formulario.modalidade ===
                      modalidade.value
                    }
                    onChange={handleChange}
                    required
                  />

                  <span className="modalidade-radio" />

                  <span className="modalidade-content">
                    <strong>
                      {modalidade.label}
                    </strong>

                    <small>
                      {
                        modalidade.description
                      }
                    </small>
                  </span>
                </label>
              )
            )}
          </div>

          {formulario.modalidade ===
            "venda" && (
            <div className="form-group preco-group">
              <label htmlFor="preco">
                Preço
              </label>

              <div className="price-input">
                <span>
                  R$
                </span>

                <input
                  id="preco"
                  name="preco"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formulario.preco}
                  onChange={handleChange}
                  placeholder="0,00"
                  required
                />
              </div>

              <small>
                A venda terá pontuação menor que
                doações e trocas.
              </small>
            </div>
          )}
        </section>

        <section className="anuncio-section">
          <div className="anuncio-section-header">
            <span>03</span>

            <div>
              <h2>
                Escolha os dias
              </h2>

              <p>
                Selecione os dias em que você poderá
                entregar ou receber o item no ponto
                definido pela escola.
              </p>
            </div>
          </div>

          <div className="calendar-wrapper">
            <div className="calendar-header">
              <button
                type="button"
                onClick={() =>
                  mudarMes(-1)
                }
                aria-label="Mês anterior"
              >
                ‹
              </button>

              <strong>
                {formatarMes(mesAtual)}
              </strong>

              <button
                type="button"
                onClick={() =>
                  mudarMes(1)
                }
                aria-label="Próximo mês"
              >
                ›
              </button>
            </div>

            <div className="calendar-weekdays">
              {[
                "Dom",
                "Seg",
                "Ter",
                "Qua",
                "Qui",
                "Sex",
                "Sáb",
              ].map(
                (dia) => (
                  <span key={dia}>
                    {dia}
                  </span>
                )
              )}
            </div>

            <div className="calendar-grid">
              {diasDoMes.map(
                (data, index) => {
                  if (!data) {
                    return (
                      <span
                        key={`vazio-${index}`}
                        className="calendar-day calendar-day--empty"
                      />
                    );
                  }

                  const selecionada =
                    dataJaSelecionada(
                      data,
                      datasSelecionadas
                    );

                  return (
                    <button
                      type="button"
                      key={data.toISOString()}
                      className={
                        selecionada
                          ? "calendar-day calendar-day--selected"
                          : "calendar-day"
                      }
                      onClick={() =>
                        selecionarData(
                          data
                        )
                      }
                    >
                      {data.getDate()}
                    </button>
                  );
                }
              )}
            </div>

            <div className="calendar-footer">
              <span>
                {datasSelecionadas.length}
                {" "}
                {datasSelecionadas.length ===
                1
                  ? "dia selecionado"
                  : "dias selecionados"}
              </span>

              {datasSelecionadas.length >
                0 && (
                <button
                  type="button"
                  onClick={() =>
                    setDatasSelecionadas([])
                  }
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="delivery-notice">
          <div
            className="delivery-notice-icon"
            aria-hidden="true"
          >
            📍
          </div>

          <div>
            <strong>
              Entrega segura dentro da comunidade
            </strong>

            <p>
              Inicialmente, as entregas serão realizadas
              em um espaço reservado no La Salle
              Bandeirante. Não é necessário compartilhar
              telefone, endereço ou marcar encontros
              diretamente com outros usuários.
            </p>
          </div>
        </section>

        {erro && (
          <div
            className="anuncio-message anuncio-message--error"
            role="alert"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            className="anuncio-message anuncio-message--success"
            role="status"
          >
            {sucesso}
          </div>
        )}

        <div className="anuncio-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={voltarInicio}
            disabled={carregando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={carregando}
          >
            {carregando
              ? "Publicando..."
              : "Publicar anúncio"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default NovoAnuncio;
