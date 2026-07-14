import { Link } from 'react-router-dom';

export default function Encabezado({ titulo }) {
  return (
    <header className="encabezado">
      <img className="logo" src="/logo-cesfam.png" alt="CESFAM Tucapel" />
      <h1>{titulo}</h1>
      <nav>
        <Link to="/">Tótem</Link>
        <Link to="/sala">Pantalla de sala</Link>
        <Link to="/panel">Panel funcionario</Link>
      </nav>
    </header>
  );
}
