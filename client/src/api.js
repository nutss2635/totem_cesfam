const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // respuesta sin cuerpo (ej. 204)
  }
  if (!res.ok) {
    const error = new Error(data?.error || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  buscarPaciente: (rut) => request(`/pacientes/${encodeURIComponent(rut)}`),
  crearPaciente: (paciente) => request('/pacientes', { method: 'POST', body: JSON.stringify(paciente) }),
  crearTicket: (rut, pacienteId) =>
    request('/tickets', { method: 'POST', body: JSON.stringify({ rut, pacienteId }) }),
  listarCola: (estado) => request(`/tickets${estado ? `?estado=${estado}` : ''}`),
  listarCasillas: () => request('/casillas'),
  llamar: (id, casillaId) => request(`/tickets/${id}/llamar`, { method: 'PATCH', body: JSON.stringify({ casillaId }) }),
  reLlamar: (id) => request(`/tickets/${id}/re-llamar`, { method: 'PATCH' }),
  noPresentado: (id) => request(`/tickets/${id}/no-presentado`, { method: 'PATCH' }),
  finalizar: (id) => request(`/tickets/${id}/finalizar`, { method: 'PATCH' }),
};
