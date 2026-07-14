import { useEffect, useRef, useState } from 'react';
import Encabezado from '../components/Encabezado.jsx';
import { api } from '../api.js';
import { socket } from '../socket.js';

function anunciar(ticket) {
  if (!('speechSynthesis' in window)) return;
  const casilla = ticket.Casilla?.nombre ?? 'su atención';
  const texto = `${ticket.Paciente.nombre}, acercarse a ${casilla}`;
  const utterancia = new SpeechSynthesisUtterance(texto);
  utterancia.lang = 'es-CL';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterancia);
}

export default function PantallaSala() {
  const [cola, setCola] = useState([]);
  const [llamando, setLlamando] = useState(null);
  const [sonidoActivado, setSonidoActivado] = useState(false);
  const sonidoActivadoRef = useRef(false);

  useEffect(() => {
    function refrescar() {
      api.listarCola().then(setCola).catch(() => {});
    }

    refrescar();

    function onLlamado(ticket) {
      setLlamando(ticket);
      if (sonidoActivadoRef.current) anunciar(ticket);
      refrescar();
    }

    socket.on('ticket:creado', refrescar);
    socket.on('ticket:llamado', onLlamado);
    socket.on('ticket:actualizado', refrescar);

    return () => {
      socket.off('ticket:creado', refrescar);
      socket.off('ticket:llamado', onLlamado);
      socket.off('ticket:actualizado', refrescar);
    };
  }, []);

  function activarSonido() {
    // Los navegadores bloquean el audio hasta el primer clic del usuario en la página.
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    sonidoActivadoRef.current = true;
    setSonidoActivado(true);
  }

  const generales = cola.filter((t) => t.tipo === 'G' && t.estado === 'en_espera');
  const preferenciales = cola.filter((t) => t.tipo === 'P' && t.estado === 'en_espera');

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
              <p className="tipo">Llamando ahora</p>
              <p className="nombre">{llamando.Paciente.nombre}</p>
              <p className="casilla">{llamando.Casilla?.nombre ?? '—'}</p>
            </>
          ) : (
            <p>Esperando el próximo llamado…</p>
          )}
        </div>

        <div className="sala-columna">
          <h2>Atención general</h2>
          {generales.length === 0 && <p className="vacio">Sin pacientes en espera</p>}
          {generales.map((t) => (
            <div className="sala-fila" key={t.id}>
              <span className="numero">
                {t.tipo}-{t.numero}
              </span>
              <span>{t.Paciente.nombre}</span>
            </div>
          ))}
        </div>

        <div className="sala-columna">
          <h2>Atención preferencial</h2>
          {preferenciales.length === 0 && <p className="vacio">Sin pacientes en espera</p>}
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
