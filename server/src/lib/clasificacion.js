const EDAD_PREFERENCIAL = 60;

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const yaCumplioEsteAnio =
    hoy.getMonth() > nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
  if (!yaCumplioEsteAnio) edad--;
  return edad;
}

// Preferencial si está marcado en la ficha (embarazo/discapacidad) o por edad.
function esAtencionPreferencial(paciente) {
  return paciente.atencionPreferencial || calcularEdad(paciente.fechaNacimiento) >= EDAD_PREFERENCIAL;
}

module.exports = { calcularEdad, esAtencionPreferencial, EDAD_PREFERENCIAL };
