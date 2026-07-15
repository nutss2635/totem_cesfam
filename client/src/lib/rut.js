export function normalizarRut(rut) {
  return rut.replace(/\./g, '').trim().toUpperCase();
}

// Formatea en vivo mientras se escribe: 123456789 -> 12.345.678-9
export function formatearRutInput(valor) {
  const limpio = valor
    .replace(/[^0-9kK]/g, '')
    .toUpperCase()
    .slice(0, 9); // 8 dígitos de cuerpo + dígito verificador

  if (!limpio) return '';

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return cuerpo ? `${cuerpoFormateado}-${dv}` : dv;
}
