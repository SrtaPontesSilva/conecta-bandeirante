import logo from '../../assets/logo.png';

function Logo({ variant = 'default' }) {
  return (
    <img
      src={logo}
      alt="Conecta Bandeirante"
      className={`logo logo--${variant}`}
    />
  );
}

export default Logo;