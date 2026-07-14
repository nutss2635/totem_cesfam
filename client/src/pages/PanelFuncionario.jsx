import { useEffect, useState } from 'react';
import Encabezado from '../components/Encabezado.jsx';
import { api } from '../api.js';
import { socket } from '../socket.js';

export default function PanelFuncionario() {
  const [casillas, setCasillas] = useState([]);
  const [casillaId, setCasillaId] = useState('');
  const [cola, setCola] = useState([]);
  const [actual, setActual] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listarCasillas().then(setCasillas).catch(() => {});
    refrescarCola();

    socket.on('ticket:creado', refrescarCola);
    socket.on('ticket:llamado', refrescarCola);
    socket.on('ticket:actualizado', refrescarCola);

    return () => {
      socket.off('ticket:creado', refrescarCola);
      socket.off('ticket:llamado', refrescarCola);
      socket.off('ticket:actualizado', refrescarCola);
    };
  }, []);

  function refrescarCola() {
    api.listarCola('en_espera').then(setCola).catch(() => {});
  }

  async function llamarSiguiente(tipo) {
    setError('');
    if (!casillaId) {
      setError('Selecciona tu casilla primero');
      return;
    }
    const siguiente = cola.find((t) => t.tipo === tipo);
    if (!siguiente) return;
    try {
      const ticket = await api.llamar(siguiente.id, Number(casillaId));
      setActual(ticket);
    } catch (err) {
      setError(err.message);
    }
  }

  async function reLlamar() {
    if (!actual) return;
    try {
      setActual(await api.reLlamar(actual.id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function noPresentado() {
    if (!actual) return;
    try {
      await api.noPresentado(actual.id);
      setActual(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function finalizar() {
    if (!actual) return;
    try {
      await api.finalizar(actual.id);
      setActual(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const generales = cola.filter((t) => t.tipo === 'G');
  const preferenciales = cola.filter((t) => t.tipo === 'P');

  return (
    <div className="pantalla">
      <Encabezado titulo="Panel del funcionario" />
      <div className="panel">
        <div className="panel-lateral">
          <div className="campo">
            <label htmlFor="casilla">Tu casilla</label>
            <select id="casilla" value={casillaId} onChange={(e) => setCasillaId(e.target.value)}>
              <option value="">Selecciona…</option>
              {casillas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <button className="boton boton-primario" onClick={() => llamarSiguiente('G')} disabled={!generales.length}>
            Llamar siguiente general ({generales.length})
          </button>
          <button
            className="boton boton-secundario"
            onClick={() => llamarSiguiente('P')}
            disabled={!preferenciales.length}
          >
            Llamar siguiente preferencial ({preferenciales.length})
          </button>

          {error && <p className="error">{error}</p>}

          <div className="panel-actual">
            <h2>Atendiendo ahora</h2>
            {actual ? (
              <>
                <p className="numero">
                  {actual.tipo}-{actual.numero}
                </p>
                <p>{actual.Paciente.nombre}</p>
                <div className="panel-acciones">
                  <button className="boton boton-secundario" onClick={reLlamar}>
                    Re-llamar
                  </button>
                  <button className="boton boton-peligro" onClick={noPresentado}>
                    No se presentó
                  </button>
                  <button className="boton boton-primario" onClick={finalizar}>
                    Finalizar
                  </button>
                </div>
              </>
            ) : (
              <p className="vacio">Nadie en atención</p>
            )}
          </div>
        </div>

        <div className="panel-cola">
          <h2>
            Cola general <span className="badge">{generales.length}</span>
          </h2>
          {generales.map((t) => (
            <div className="sala-fila" key={t.id}>
              <span className="numero">
                {t.tipo}-{t.numero}
              </span>
              <span>{t.Paciente.nombre}</span>
            </div>
          ))}

          <h2 style={{ marginTop: 24 }}>
            Cola preferencial <span className="badge">{preferenciales.length}</span>
          </h2>
          {preferenciales.map((t) => (
            <div className="sala-fila" key={t.id}>
              <span className="numero">
                {t.tipo}-{t.numero}
              </span>
              <span>{t.Paciente.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
