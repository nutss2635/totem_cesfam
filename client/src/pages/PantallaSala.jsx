import { useEffect, useRef, useState } from 'react';
import Encabezado from '../components/Encabezado.jsx';
import { api } from '../api.js';
import { socket } from '../socket.js';
import { useTitulo } from '../lib/useTitulo.js';

const MAX_HISTORIAL = 6;

function anunciar(ticket) {
  if (!('speechSynthesis' in window)) return;
  const tipoTexto = ticket.tipo === 'P' ? 'atención preferencial' : 'atención general';
  const casilla = ticket.Casilla?.nombre ?? 'su atención';
  const texto = `${ticket.Paciente.nombre}, acercarse a ${tipoTexto} ${casilla}`;
  const utterancia = new SpeechSynthesisUtterance(texto);
  utterancia.lang = 'es-CL';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterancia);
}

function formatearHora(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

export default function PantallaSala() {
  useTitulo('Pantalla de sala');
  const [llamando, setLlamando] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [sonidoActivado, setSonidoActivado] = useState(false);
  const sonidoActivadoRef = useRef(false);

  useEffect(() => {
    // Si la pantalla se recarga a mitad de turno, recupera los últimos llamados ya hechos.
    api
      .listarCola('llamado')
      .then((llamados) => {
        const ordenados = [...llamados].sort((a, b) => new Date(b.llamadoAt) - new Date(a.llamadoAt));
        setHistorial(ordenados.slice(0, MAX_HISTORIAL));
        setLlamando(ordenados[0] ?? null);
      })
      .catch(() => {});

    function onLlamado(ticket) {
      setLlamando(ticket);
      if (sonidoActivadoRef.current) anunciar(ticket);
      setHistorial((prev) => [ticket, ...prev.filter((t) => t.id !== ticket.id)].slice(0, MAX_HISTORIAL));
    }

    socket.on('ticket:llamado', onLlamado);

    return () => {
      socket.off('ticket:llamado', onLlamado);
    };
  }, []);

  function activarSonido() {
    // Los navegadores bloquean el audio hasta el primer clic del usuario en la página.
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    sonidoActivadoRef.current = true;
    setSonidoActivado(true);
  }

  return (
    <div className="pantalla">
      <Encabezado titulo="Sala de espera" />
      {!sonidoActivado && (
        <button className="boton boton-primario activar-sonido" onClick={activarSonido}>
          Activar sonido de anuncios
        </button>
      )}
      <div className="sala">
        <div className="sala-llamando">
          {llamando ? (
            <>
              <p className="tipo">
                Llamando ahora · {llamando.tipo === 'P' ? 'Atención preferencial' : 'Atención general'}
              </p>
              <p className="nombre">{llamando.Paciente.nombre}</p>
              <p className="casilla">{llamando.Casilla?.nombre ?? '—'}</p>
            </>
          ) : (
            <p>Esperando el próximo llamado…</p>
          )}
        </div>

        <div className="sala-historial">
          <h2>Últimos llamados</h2>
          {historial.length === 0 ? (
            <p className="vacio">Aún no hay llamados</p>
          ) : (
            <div className="tabla-historial-wrap">
              <table className="tabla-historial">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Nombre</th>
                    <th>Casilla</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((t) => (
                    <tr key={t.id}>
                      <td className="numero">
                        {t.tipo}-{t.numero}
                      </td>
                      <td>{t.Paciente.nombre}</td>
                      <td>{t.Casilla?.nombre ?? '—'}</td>
                      <td>{formatearHora(t.llamadoAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
