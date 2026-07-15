const formatoFechaCL = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santiago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Fecha de hoy en Chile (no en UTC), para que el corte de día ocurra a
// medianoche real y no 3-4 horas antes por la diferencia de huso horario.
function hoyISO() {
  return formatoFechaCL.format(new Date());
}

module.exports = { hoyISO };
