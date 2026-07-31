function Inicio() {
  const usuario = JSON.parse(
    localStorage.getItem("usuario")
  );

  const parceiro = JSON.parse(
    localStorage.getItem("parceiro")
  );

  const pessoa = usuario || parceiro;

  return (
    <main>
      <h1>
        Olá, {pessoa?.nome || pessoa?.nome_estabelecimento}!
      </h1>

      <p>
        Bem-vindo ao Conecta Bandeirante.
      </p>

      <p>
        Tipo de conta: {pessoa?.tipo}
      </p>
    </main>
  );
}

export default Inicio;
