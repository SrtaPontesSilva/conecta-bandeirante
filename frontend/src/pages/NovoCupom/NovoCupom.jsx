import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  IconArrowLeft,
  IconCamera,
  IconCheck,
  IconImage,
  IconX,
} from "../../components/Icons/Icons";

import MarketplaceNavbar from "../../components/MarketplaceNavbar/MarketplaceNavbar";
import BottomNavigation from "../../components/BottomNavigation/BottomNavigation";

import api from "../../services/api";

import "./NovoCupom.css";


const CATEGORIAS = [
  {
    value: "alimentacao",
    label: "Alimentação",
  },
  {
    value: "cafeteria",
    label: "Cafeteria",
  },
  {
    value: "papelaria",
    label: "Papelaria",
  },
  {
    value: "lazer",
    label: "Lazer",
  },
  {
    value: "servicos",
    label: "Serviços",
  },
  {
    value: "outros",
    label: "Outros",
  },
];


const TAMANHO_MAXIMO_IMAGEM =
  4 * 1024 * 1024;


const TIPOS_IMAGEM_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


function obterDataAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();

  const mes = String(
    hoje.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    hoje.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}


function formatarDataParaAPI(data) {
  if (!data) {
    return "";
  }

  return `${data}T00:00:00`;
}


function formatarDataFinalParaAPI(data) {
  if (!data) {
    return "";
  }

  return `${data}T23:59:59`;
}


function NovoCupom() {
  const navigate = useNavigate();

  const inputImagemRef = useRef(null);

  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    pontos: "",
    limite_resgates: "",
    validade_inicio: "",
    validade_fim: "",
    regras: "",
  });

  const [imagemPreview, setImagemPreview] =
    useState("");

  const [arquivoImagem, setArquivoImagem] =
    useState(null);

  const [erros, setErros] =
    useState({});

  const [erroGeral, setErroGeral] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  const [salvando, setSalvando] =
    useState(false);

  /*
   * ============================================================
   * DATA MÍNIMA
   * ============================================================
   */

  const [dataMinima, setDataMinima] =
    useState("");


  useEffect(() => {
    setDataMinima(
      obterDataAtual()
    );
  }, []);


  /*
   * ============================================================
   * LIMPEZA DA PREVIEW
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (imagemPreview) {
        URL.revokeObjectURL(
          imagemPreview
        );
      }
    };
  }, [imagemPreview]);


  /*
   * ============================================================
   * FORMULÁRIO
   * ============================================================
   */

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

    setErros(
      (estadoAnterior) => ({
        ...estadoAnterior,
        [name]: "",
      })
    );

    setErroGeral("");
    setSucesso("");
  }


  /*
   * ============================================================
   * IMAGEM
   * ============================================================
   */

  function abrirSeletorImagem() {
    if (salvando) {
      return;
    }

    inputImagemRef.current?.click();
  }


  function handleImagemChange(event) {
    const arquivo =
      event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    setErros(
      (estadoAnterior) => ({
        ...estadoAnterior,
        imagem: "",
      })
    );

    setErroGeral("");
    setSucesso("");


    /*
     * ==========================================================
     * TIPO DO ARQUIVO
     * ==========================================================
     */

    if (
      !TIPOS_IMAGEM_PERMITIDOS.includes(
        arquivo.type
      )
    ) {
      setErros(
        (estadoAnterior) => ({
          ...estadoAnterior,
          imagem:
            "Use uma imagem JPG, PNG ou WebP.",
        })
      );

      event.target.value = "";

      return;
    }


    /*
     * ==========================================================
     * TAMANHO DO ARQUIVO
     * ==========================================================
     */

    if (
      arquivo.size >
      TAMANHO_MAXIMO_IMAGEM
    ) {
      setErros(
        (estadoAnterior) => ({
          ...estadoAnterior,
          imagem:
            "A imagem deve possuir no máximo 4 MB.",
        })
      );

      event.target.value = "";

      return;
    }


    /*
     * ==========================================================
     * LIMPA PREVIEW ANTERIOR
     * ==========================================================
     */

    if (imagemPreview) {
      URL.revokeObjectURL(
        imagemPreview
      );
    }


    /*
     * ==========================================================
     * NOVA PREVIEW
     * ==========================================================
     */

    const url =
      URL.createObjectURL(
        arquivo
      );

    setArquivoImagem(
      arquivo
    );

    setImagemPreview(
      url
    );

    event.target.value = "";
  }


  function removerImagem() {
    if (imagemPreview) {
      URL.revokeObjectURL(
        imagemPreview
      );
    }

    setImagemPreview("");

    setArquivoImagem(null);

    setErros(
      (estadoAnterior) => ({
        ...estadoAnterior,
        imagem: "",
      })
    );

    if (inputImagemRef.current) {
      inputImagemRef.current.value = "";
    }
  }


  /*
   * ============================================================
   * VALIDAÇÃO
   * ============================================================
   */

  function validarFormulario() {
    const novosErros = {};

    const titulo =
      formulario.titulo.trim();

    const descricao =
      formulario.descricao.trim();

    const regras =
      formulario.regras.trim();


    /*
     * ==========================================================
     * TÍTULO
     * ==========================================================
     */

    if (!titulo) {
      novosErros.titulo =
        "Informe o título do cupom.";

    } else if (
      titulo.length > 150
    ) {
      novosErros.titulo =
        "O título deve possuir no máximo 150 caracteres.";
    }


    /*
     * ==========================================================
     * DESCRIÇÃO
     * ==========================================================
     */

    if (!descricao) {
      novosErros.descricao =
        "Informe a descrição do benefício.";

    } else if (
      descricao.length > 600
    ) {
      novosErros.descricao =
        "A descrição deve possuir no máximo 600 caracteres.";
    }


    /*
     * ==========================================================
     * CATEGORIA
     * ==========================================================
     */

    if (!formulario.categoria) {
      novosErros.categoria =
        "Selecione uma categoria.";
    }


    /*
     * ==========================================================
     * PONTOS
     * ==========================================================
     */

    if (!formulario.pontos) {
      novosErros.pontos =
        "Informe a quantidade de pontos.";

    } else if (
      !Number.isInteger(
        Number(
          formulario.pontos
        )
      )
    ) {
      novosErros.pontos =
        "A quantidade de pontos deve ser um número inteiro.";

    } else if (
      Number(
        formulario.pontos
      ) <= 0
    ) {
      novosErros.pontos =
        "A quantidade de pontos deve ser maior que zero.";
    }


    /*
     * ==========================================================
     * LIMITE DE RESGATES
     * ==========================================================
     */

    if (
      formulario.limite_resgates !== ""
    ) {
      if (
        !Number.isInteger(
          Number(
            formulario.limite_resgates
          )
        )
      ) {
        novosErros.limite_resgates =
          "O limite deve ser um número inteiro.";

      } else if (
        Number(
          formulario.limite_resgates
        ) <= 0
      ) {
        novosErros.limite_resgates =
          "O limite deve ser maior que zero.";
      }
    }


    /*
     * ==========================================================
     * DATA INICIAL
     * ==========================================================
     */

    if (!formulario.validade_inicio) {
      novosErros.validade_inicio =
        "Informe a data inicial.";

    } else if (
      dataMinima &&
      formulario.validade_inicio <
        dataMinima
    ) {
      novosErros.validade_inicio =
        "A data inicial não pode ser anterior a hoje.";
    }


    /*
     * ==========================================================
     * DATA FINAL
     * ==========================================================
     */

    if (!formulario.validade_fim) {
      novosErros.validade_fim =
        "Informe a data final.";

    } else if (
      dataMinima &&
      formulario.validade_fim <
        dataMinima
    ) {
      novosErros.validade_fim =
        "A data final não pode ser anterior a hoje.";
    }


    /*
     * ==========================================================
     * ORDEM DAS DATAS
     * ==========================================================
     */

    if (
      formulario.validade_inicio &&
      formulario.validade_fim &&
      formulario.validade_fim <=
        formulario.validade_inicio
    ) {
      novosErros.validade_fim =
        "A data final deve ser posterior à data inicial.";
    }


    /*
     * ==========================================================
     * REGRAS
     * ==========================================================
     */

    if (
      regras.length > 1000
    ) {
      novosErros.regras =
        "As regras devem possuir no máximo 1000 caracteres.";
    }


    /*
     * ==========================================================
     * IMAGEM
     * ==========================================================
     *
     * A imagem é opcional.
     *
     * Quando selecionada, ela será enviada ao backend
     * como "imagem" em multipart/form-data.
     * ==========================================================
     */

    if (arquivoImagem) {

      if (
        !TIPOS_IMAGEM_PERMITIDOS.includes(
          arquivoImagem.type
        )
      ) {
        novosErros.imagem =
          "Use uma imagem JPG, PNG ou WebP.";

      } else if (
        arquivoImagem.size >
        TAMANHO_MAXIMO_IMAGEM
      ) {
        novosErros.imagem =
          "A imagem deve possuir no máximo 4 MB.";
      }
    }


    setErros(
      novosErros
    );

    return (
      Object.keys(
        novosErros
      ).length === 0
    );
  }


  /*
   * ============================================================
   * ENVIO
   * ============================================================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    setErroGeral("");
    setSucesso("");


    /*
     * ==========================================================
     * VALIDA FORMULÁRIO
     * ==========================================================
     */

    if (!validarFormulario()) {
      return;
    }


    setSalvando(true);


    try {

      /*
       * ========================================================
       * FORMDATA
       * ========================================================
       *
       * O backend recebe:
       *
       * request.form
       * request.files.get("imagem")
       *
       * Portanto os dados precisam ser enviados
       * como multipart/form-data.
       * ========================================================
       */

      const formData =
        new FormData();


      /*
       * ========================================================
       * DADOS PRINCIPAIS
       * ========================================================
       */

      formData.append(
        "titulo",
        formulario.titulo.trim()
      );

      formData.append(
        "descricao",
        formulario.descricao.trim()
      );

      formData.append(
        "categoria",
        formulario.categoria
      );


      /*
       * ========================================================
       * PONTOS
       * ========================================================
       */

      formData.append(
        "pontos",
        String(
          Number(
            formulario.pontos
          )
        )
      );


      /*
       * ========================================================
       * LIMITE DE RESGATES
       * ========================================================
       */

      if (
        formulario.limite_resgates !== ""
      ) {
        formData.append(
          "limite_resgates",
          String(
            Number(
              formulario.limite_resgates
            )
          )
        );

      } else {
        formData.append(
          "limite_resgates",
          ""
        );
      }


      /*
       * ========================================================
       * VALIDADE INICIAL
       * ========================================================
       */

      formData.append(
        "validade_inicio",
        formatarDataParaAPI(
          formulario.validade_inicio
        )
      );


      /*
       * ========================================================
       * VALIDADE FINAL
       * ========================================================
       */

      formData.append(
        "validade_fim",
        formatarDataFinalParaAPI(
          formulario.validade_fim
        )
      );


      /*
       * ========================================================
       * REGRAS
       * ========================================================
       */

      formData.append(
        "regras",
        formulario.regras.trim()
      );


      /*
       * ========================================================
       * IMAGEM
       * ========================================================
       *
       * O nome precisa ser exatamente:
       *
       * "imagem"
       *
       * porque o backend utiliza:
       *
       * request.files.get("imagem")
       * ========================================================
       */

      if (arquivoImagem) {
        formData.append(
          "imagem",
          arquivoImagem
        );
      }


      /*
       * ========================================================
       * ENVIO PARA API
       * ========================================================
       *
       * Não definimos Content-Type manualmente.
       *
       * O navegador/Axios adiciona automaticamente:
       *
       * multipart/form-data; boundary=...
       * ========================================================
       */

      const resposta =
        await api.post(
          "/cupons",
          formData
        );


      /*
       * ========================================================
       * MENSAGEM DE SUCESSO
       * ========================================================
       */

      setSucesso(
        resposta.data?.mensagem ||
          "Cupom criado com sucesso."
      );


      /*
       * ========================================================
       * LIMPA FORMULÁRIO
       * ========================================================
       */

      setFormulario({
        titulo: "",
        descricao: "",
        categoria: "",
        pontos: "",
        limite_resgates: "",
        validade_inicio: "",
        validade_fim: "",
        regras: "",
      });


      /*
       * ========================================================
       * LIMPA IMAGEM
       * ========================================================
       */

      if (imagemPreview) {
        URL.revokeObjectURL(
          imagemPreview
        );
      }

      setImagemPreview("");

      setArquivoImagem(null);

      if (inputImagemRef.current) {
        inputImagemRef.current.value = "";
      }


      /*
       * ========================================================
       * VOLTA PARA MEUS CUPONS
       * ========================================================
       */

      setTimeout(() => {
        navigate(
          "/parceiro/cupons"
        );
      }, 700);

    } catch (erro) {

      const resposta =
        erro?.response?.data;


      /*
       * ========================================================
       * ERROS DE CAMPOS
       * ========================================================
       */

      if (
        resposta?.campos
      ) {
        setErros(
          resposta.campos
        );
      }


      /*
       * ========================================================
       * ERRO GERAL
       * ========================================================
       */

      setErroGeral(
        resposta?.erro ||
          "Não foi possível criar o cupom. Tente novamente."
      );

    } finally {

      setSalvando(false);
    }
  }


  /*
   * ============================================================
   * CANCELAR / VOLTAR
   * ============================================================
   */

  function voltar() {
    if (salvando) {
      return;
    }

    navigate(
      "/parceiro/cupons"
    );
  }


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="novo-cupom-page">

      <MarketplaceNavbar
        tipo="parceiro"
      />


      <main className="novo-cupom-main">

        <div className="novo-cupom-container">

          <button
            type="button"
            className="novo-cupom-back"
            onClick={voltar}
            disabled={salvando}
            aria-label="Voltar para meus cupons"
          >
            <IconArrowLeft
              size={20}
            />

            <span>
              Meus cupons
            </span>
          </button>


          <header className="novo-cupom-header">

            <div>

              <span className="novo-cupom-eyebrow">
                Benefício
              </span>

              <h1>
                Criar cupom
              </h1>

              <p>
                Publique um novo benefício
                para a comunidade do
                ConectaBandeirante.
              </p>

            </div>

          </header>


          {
            erroGeral && (
              <div
                className="novo-cupom-alert novo-cupom-alert-error"
                role="alert"
              >
                <IconX
                  size={20}
                />

                <span>
                  {erroGeral}
                </span>

              </div>
            )
          }


          {
            sucesso && (
              <div
                className="novo-cupom-alert novo-cupom-alert-success"
                role="status"
              >
                <IconCheck
                  size={20}
                />

                <span>
                  {sucesso}
                </span>

              </div>
            )
          }


          <form
            className="novo-cupom-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* ==================================================
                INFORMAÇÕES DO BENEFÍCIO
            ================================================== */}

            <section className="novo-cupom-card">

              <div className="novo-cupom-card-header">

                <div>

                  <h2>
                    Informações do benefício
                  </h2>

                  <p>
                    Apresente de forma clara
                    o benefício oferecido.
                  </p>

                </div>

              </div>


              <div className="novo-cupom-grid">

                {/* =================================================
                    TÍTULO
                ================================================= */}

                <div className="novo-cupom-field novo-cupom-field-full">

                  <label
                    htmlFor="titulo"
                  >
                    Título do cupom

                    <span aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="titulo"
                    name="titulo"
                    type="text"
                    value={
                      formulario.titulo
                    }
                    onChange={
                      handleChange
                    }
                    maxLength={150}
                    placeholder="Ex.: 10% OFF em materiais escolares"
                    aria-invalid={
                      Boolean(
                        erros.titulo
                      )
                    }
                    aria-describedby={
                      erros.titulo
                        ? "erro-titulo"
                        : undefined
                    }
                  />

                  <div className="novo-cupom-field-footer">

                    {
                      erros.titulo && (
                        <span
                          id="erro-titulo"
                          className="novo-cupom-error"
                        >
                          {erros.titulo}
                        </span>
                      )
                    }

                    <span className="novo-cupom-counter">
                      {formulario.titulo.length}/150
                    </span>

                  </div>

                </div>


                {/* =================================================
                    DESCRIÇÃO
                ================================================= */}

                <div className="novo-cupom-field novo-cupom-field-full">

                  <label
                    htmlFor="descricao"
                  >
                    Descrição

                    <span aria-hidden="true">
                      *
                    </span>
                  </label>

                  <textarea
                    id="descricao"
                    name="descricao"
                    value={
                      formulario.descricao
                    }
                    onChange={
                      handleChange
                    }
                    rows={5}
                    maxLength={600}
                    placeholder="Explique de forma simples o benefício oferecido."
                    aria-invalid={
                      Boolean(
                        erros.descricao
                      )
                    }
                    aria-describedby={
                      erros.descricao
                        ? "erro-descricao"
                        : undefined
                    }
                  />

                  <div className="novo-cupom-field-footer">

                    {
                      erros.descricao && (
                        <span
                          id="erro-descricao"
                          className="novo-cupom-error"
                        >
                          {erros.descricao}
                        </span>
                      )
                    }

                    <span className="novo-cupom-counter">
                      {formulario.descricao.length}/600
                    </span>

                  </div>

                </div>


                {/* =================================================
                    CATEGORIA
                ================================================= */}

                <div className="novo-cupom-field">

                  <label
                    htmlFor="categoria"
                  >
                    Categoria

                    <span aria-hidden="true">
                      *
                    </span>
                  </label>

                  <select
                    id="categoria"
                    name="categoria"
                    value={
                      formulario.categoria
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        erros.categoria
                      )
                    }
                    aria-describedby={
                      erros.categoria
                        ? "erro-categoria"
                        : undefined
                    }
                  >

                    <option value="">
                      Selecione uma categoria
                    </option>

                    {
                      CATEGORIAS.map(
                        (categoria) => (
                          <option
                            key={
                              categoria.value
                            }
                            value={
                              categoria.value
                            }
                          >
                            {
                              categoria.label
                            }
                          </option>
                        )
                      )
                    }

                  </select>

                  {
                    erros.categoria && (
                      <span
                        id="erro-categoria"
                        className="novo-cupom-error"
                      >
                        {erros.categoria}
                      </span>
                    )
                  }

                </div>


                {/* =================================================
                    PONTOS
                ================================================= */}

                <div className="novo-cupom-field">

                  <label
                    htmlFor="pontos"
                  >
                    Pontos para resgate

                    <span aria-hidden="true">
                      *
                    </span>
                  </label>

                  <div className="novo-cupom-input-suffix">

                    <input
                      id="pontos"
                      name="pontos"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formulario.pontos
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Ex.: 80"
                      aria-invalid={
                        Boolean(
                          erros.pontos
                        )
                      }
                      aria-describedby={
                        erros.pontos
                          ? "erro-pontos"
                          : undefined
                      }
                    />

                    <span>
                      pontos
                    </span>

                  </div>

                  {
                    erros.pontos && (
                      <span
                        id="erro-pontos"
                        className="novo-cupom-error"
                      >
                        {erros.pontos}
                      </span>
                    )
                  }

                </div>

              </div>

            </section>


            {/* ==================================================
                IMAGEM
            ================================================== */}

            <section className="novo-cupom-card">

              <div className="novo-cupom-card-header">

                <div>

                  <h2>
                    Imagem do benefício
                  </h2>

                  <p>
                    Escolha uma imagem que
                    represente bem o benefício.
                  </p>

                </div>

              </div>


              <input
                ref={inputImagemRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="novo-cupom-file-input"
                onChange={
                  handleImagemChange
                }
                disabled={
                  salvando
                }
              />


              {
                imagemPreview ? (

                  <div className="novo-cupom-image-preview">

                    <img
                      src={
                        imagemPreview
                      }
                      alt="Pré-visualização do cupom"
                    />

                    <button
                      type="button"
                      className="novo-cupom-remove-image"
                      onClick={
                        removerImagem
                      }
                      disabled={
                        salvando
                      }
                      aria-label="Remover imagem"
                    >
                      <IconX
                        size={18}
                      />
                    </button>

                  </div>

                ) : (

                  <button
                    type="button"
                    className="novo-cupom-upload"
                    onClick={
                      abrirSeletorImagem
                    }
                    disabled={
                      salvando
                    }
                  >

                    <span className="novo-cupom-upload-icon">

                      <IconImage
                        size={30}
                      />

                    </span>

                    <strong>
                      Adicionar imagem
                    </strong>

                    <span>
                      JPG, PNG ou WebP
                      até 4 MB
                    </span>

                    <span className="novo-cupom-upload-button">

                      <IconCamera
                        size={17}
                      />

                      Escolher imagem

                    </span>

                  </button>

                )
              }


              {
                erros.imagem && (
                  <span className="novo-cupom-error">
                    {erros.imagem}
                  </span>
                )
              }


              {
                arquivoImagem && (
                  <p className="novo-cupom-file-name">
                    {arquivoImagem.name}
                  </p>
                )
              }

            </section>


            {/* ==================================================
                RESGATE E VALIDADE
            ================================================== */}

            <section className="novo-cupom-card">

              <div className="novo-cupom-card-header">

                <div>

                  <h2>
                    Resgate e validade
                  </h2>

                  <p>
                    Defina por quanto tempo
                    o benefício ficará disponível.
                  </p>

                </div>

              </div>


              <div className="novo-cupom-grid">

                {/* =================================================
                    LIMITE
                ================================================= */}

                <div className="novo-cupom-field">

                  <label
                    htmlFor="limite_resgates"
                  >
                    Limite de resgates
                  </label>

                  <input
                    id="limite_resgates"
                    name="limite_resgates"
                    type="number"
                    min="1"
                    step="1"
                    value={
                      formulario.limite_resgates
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Sem limite"
                    aria-invalid={
                      Boolean(
                        erros.limite_resgates
                      )
                    }
                    aria-describedby="ajuda-limite"
                  />

                  <span
                    id="ajuda-limite"
                    className="novo-cupom-help"
                  >
                    Deixe vazio para permitir
                    resgates sem limite.
                  </span>

                  {
                    erros.limite_resgates && (
                      <span className="novo-cupom-error">
                        {
                          erros.limite_resgates
                        }
                      </span>
                    )
                  }

                </div>


                {/* =================================================
                    ESPAÇAMENTO
                ================================================= */}

                <div className="novo-cupom-field">

                  <span className="novo-cupom-empty-space" />

                </div>


                {/* =================================================
                    DATA INICIAL
                ================================================= */}

                <div className="novo-cupom-field">

                  <label
                    htmlFor="validade_inicio"
                  >
                    Início

                    <span aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="validade_inicio"
                    name="validade_inicio"
                    type="date"
                    min={
                      dataMinima
                    }
                    value={
                      formulario.validade_inicio
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        erros.validade_inicio
                      )
                    }
                    aria-describedby={
                      erros.validade_inicio
                        ? "erro-validade-inicio"
                        : undefined
                    }
                  />

                  {
                    erros.validade_inicio && (
                      <span
                        id="erro-validade-inicio"
                        className="novo-cupom-error"
                      >
                        {
                          erros.validade_inicio
                        }
                      </span>
                    )
                  }

                </div>


                {/* =================================================
                    DATA FINAL
                ================================================= */}

                <div className="novo-cupom-field">

                  <label
                    htmlFor="validade_fim"
                  >
                    Término

                    <span aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="validade_fim"
                    name="validade_fim"
                    type="date"
                    min={
                      formulario.validade_inicio ||
                      dataMinima
                    }
                    value={
                      formulario.validade_fim
                    }
                    onChange={
                      handleChange
                    }
                    aria-invalid={
                      Boolean(
                        erros.validade_fim
                      )
                    }
                    aria-describedby={
                      erros.validade_fim
                        ? "erro-validade-fim"
                        : undefined
                    }
                  />

                  {
                    erros.validade_fim && (
                      <span
                        id="erro-validade-fim"
                        className="novo-cupom-error"
                      >
                        {
                          erros.validade_fim
                        }
                      </span>
                    )
                  }

                </div>

              </div>

            </section>


            {/* ==================================================
                REGRAS
            ================================================== */}

            <section className="novo-cupom-card">

              <div className="novo-cupom-card-header">

                <div>

                  <h2>
                    Regras do benefício
                  </h2>

                  <p>
                    Informe condições importantes
                    para utilização do cupom.
                  </p>

                </div>

              </div>


              <div className="novo-cupom-field">

                <label
                  htmlFor="regras"
                >
                  Regras e condições
                </label>

                <textarea
                  id="regras"
                  name="regras"
                  value={
                    formulario.regras
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={1000}
                  rows={5}
                  placeholder="Ex.: Válido uma vez por usuário. Não cumulativo com outras promoções."
                  aria-invalid={
                    Boolean(
                      erros.regras
                    )
                  }
                  aria-describedby="ajuda-regras"
                />

                <div className="novo-cupom-field-footer">

                  {
                    erros.regras && (
                      <span className="novo-cupom-error">
                        {erros.regras}
                      </span>
                    )
                  }

                  <span
                    id="ajuda-regras"
                    className="novo-cupom-counter"
                  >
                    {formulario.regras.length}/1000
                  </span>

                </div>

              </div>

            </section>


            {/* ==================================================
                AÇÕES
            ================================================== */}

            <div className="novo-cupom-actions">

              <button
                type="button"
                className="novo-cupom-button novo-cupom-button-secondary"
                onClick={
                  voltar
                }
                disabled={
                  salvando
                }
              >
                Cancelar
              </button>


              <button
                type="submit"
                className="novo-cupom-button novo-cupom-button-primary"
                disabled={
                  salvando
                }
              >
                {
                  salvando
                    ? "Publicando..."
                    : "Publicar cupom"
                }
              </button>

            </div>

          </form>

        </div>

      </main>


      <BottomNavigation
        tipo="parceiro"
      />

    </div>
  );
}


export default NovoCupom;