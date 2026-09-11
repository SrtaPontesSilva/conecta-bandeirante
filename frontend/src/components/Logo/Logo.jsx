import logoAzul from "../../assets/LogoConectaNB_Azul.png";
import logoLaranja from "../../assets/LogoNB_Laranja.png";

const logos = {
  login: logoAzul,
  navbar: logoLaranja,
};

function Logo({ variant = "login" }) {
  const logoSelecionada =
    logos[variant] || logos.login;

  return (
    <img
      src={logoSelecionada}
      alt="Conecta Bandeirante"
      className={`logo logo--${variant}`}
    />
  );
}

export default Logo;