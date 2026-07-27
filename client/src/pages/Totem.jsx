import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { normalizarRut, formatearRutInput } from '../lib/rut.js';
import { useTitulo } from '../lib/useTitulo.js';

export default function Totem() {
  useTitulo('Tótem');
  const [rut, setRut] = useState('');
  const [paciente, setPaciente] = useState(null); // con Dependientes, cuando hay que preguntar para quién es la atención
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const timeoutRef = useRef(null);

  function reiniciar() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setRut('');
    setPaciente(null);
    setTicket(null);
    setError('');
  }

  async function emitirTicket(pacienteId) {
    setError('');
    setCargando(true);
    try {
      const nuevoTicket = await api.crearTicket(normalizarRut(rut), pacienteId);
      setPaciente(null);
      setTicket(nuevoTicket);
      timeoutRef.current = setTimeout(reiniciar, 8000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleIngresar(e) {
    e.preventDefault();
    if (!rut.trim()) return;
    setError('');
    setCargando(true);
    try {
      const encontrado = await api.buscarPaciente(normalizarRut(rut));
      // Si el RUT es apoderado de alguien más, se pregunta para quién es la atención
      // antes de emitir el ticket, en vez de asumir que siempre es para quien lo ingresa.
      if (encontrado.Dependientes?.length > 0) {
        setPaciente(encontrado);
        setCargando(false);
      } else {
        await emitirTicket();
      }
    } catch (err) {
      setCargando(false);
      if (err.status === 404) {
        setError('No encontramos tu RUT en el sistema. Acércate a mesón para que te ayuden.');
      } else {
        setError(err.message);
      }
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
        <p className="totem-subtitulo">Tótem de atención a pacientes · Farmacia</p>
      </div>

      <div className="totem-contenido">
        {ticket ? (
          <div className="ticket" onClick={reiniciar} role="button" tabIndex={0}>
            <p className="tipo">{ticket.tipo === 'P' ? 'Atención preferencial' : 'Atención general'}</p>
            <p className="nombre">{ticket.Paciente.nombre}</p>
            <p className="numero">
              {ticket.tipo}-{ticket.numero}
            </p>
            <p>Te llamaremos cuando sea tu turno</p>
            <p className="ticket-ayuda">Toca la pantalla para continuar</p>
          </div>
        ) : paciente ? (
          <div className="totem-card">
            <h2>¿Para quién es la atención?</h2>
            <p className="totem-ayuda">Vimos que también estás registrado/a como apoderado/a de otra persona</p>
            <div className="totem-opciones">
              <button
                className="boton boton-primario boton-grande"
                disabled={cargando}
                onClick={() => emitirTicket(paciente.id)}
              >
                Para mí, {paciente.nombre}
              </button>
              {paciente.Dependientes.map((dependiente) => (
                <button
                  key={dependiente.id}
                  className="boton boton-secundario boton-grande"
                  disabled={cargando}
                  onClick={() => emitirTicket(dependiente.id)}
                >
                  Para {dependiente.nombre}
                </button>
              ))}
            </div>
            {error && <p className="error">{error}</p>}
          </div>
        ) : (
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
                onChange={(e) => setRut(formatearRutInput(e.target.value))}
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="boton boton-primario boton-grande" disabled={cargando} type="submit">
              {cargando ? 'Buscando…' : 'Continuar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
