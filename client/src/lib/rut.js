export function normalizarRut(rut) {
  return rut.replace(/\./g, '').trim().toUpperCase();
}
