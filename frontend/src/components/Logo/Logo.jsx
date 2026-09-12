import logoAzul from "../../assets/LogoConectaNB_Azul.png";
import logoLaranja from "../../assets/LogoNB_Laranja.png";
import logoBranca from "../../assets/LogoConectaNB_Branca.png";

const logos = {
  login: logoAzul,
  navbar: logoLaranja,
  white: logoBranca,
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