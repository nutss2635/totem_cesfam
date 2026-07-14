import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { normalizarRut } from '../lib/rut.js';

export default function Totem() {
  const [rut, setRut] = useState('');
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function reiniciar() {
    setRut('');
    setTicket(null);
    setError('');
  }

  async function handleIngresar(e) {
    e.preventDefault();
    if (!rut.trim()) return;
    setError('');
    setCargando(true);
    try {
      const nuevoTicket = await api.crearTicket(normalizarRut(rut));
      setTicket(nuevoTicket);
      setTimeout(reiniciar, 8000);
    } catch (err) {
      if (err.status === 404) {
        setError('No encontramos tu RUT en el sistema. Acércate a mesón para que te ayuden.');
      } else {
        setError(err.message);
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="totem">
      <div className="totem-hero">
        <nav className="totem-nav">
          <Link to="/sala">Pantalla de sala</Link>
          <Link to="/panel">Panel funcionario</Link>
        </nav>
        <div className="totem-logo-halo">
          <img src="/logo-cesfam.png" alt="CESFAM Tucapel" />
        </div>
        <h1>CESFAM Tucapel</h1>
        <p className="totem-subtitulo">Farmacia · Tótem de atención a pacientes</p>
      </div>

      <div className="totem-contenido">
        {!ticket ? (
          <form className="totem-card" onSubmit={handleIngresar}>
            <h2>Bienvenido/a</h2>
            <p className="totem-ayuda">Ingresa tu RUT para registrar tu atención</p>
            <div className="campo">
              <label htmlFor="rut">RUT</label>
              <input
                id="rut"
                autoFocus
                placeholder="12345678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="boton boton-primario boton-grande" disabled={cargando} type="submit">
              {cargando ? 'Buscando…' : 'Continuar'}
            </button>
          </form>
        ) : (
          <div className="ticket">
            <p className="tipo">{ticket.tipo === 'P' ? 'Atención preferencial' : 'Atención general'}</p>
            <p className="nombre">{ticket.Paciente.nombre}</p>
            <p className="numero">
              {ticket.tipo}-{ticket.numero}
            </p>
            <p>Te llamaremos cuando sea tu turno</p>
          </div>
        )}
      </div>
    </div>
  );
}
