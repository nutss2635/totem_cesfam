const { Router } = require('express');
const sequelize = require('../../db/connection');
const { Ticket, Paciente, Casilla } = require('../entities');
const { esAtencionPreferencial } = require('../lib/clasificacion');
const { hoyISO } = require('../lib/fecha');

const router = Router();

const TICKET_INCLUDES = [
  { model: Paciente, attributes: ['id', 'rut', 'nombre'] },
  { model: Casilla, attributes: ['id', 'nombre'] },
];

// GET /api/tickets — cola del día (en espera + llamados) para pantalla de sala y panel
router.get('/', async (req, res) => {
  const estados = req.query.estado ? [req.query.estado] : ['en_espera', 'llamado'];

  const tickets = await Ticket.findAll({
    where: { fecha: hoyISO(), estado: estados },
    include: TICKET_INCLUDES,
    order: [['tipo', 'ASC'], ['numero', 'ASC']],
  });
  res.json(tickets);
});

// POST /api/tickets — el tótem emite un ticket clasificando automáticamente al paciente
router.post('/', async (req, res) => {
  const { rut } = req.body;
  if (!rut) return res.status(400).json({ error: 'rut es obligatorio' });

  const paciente = await Paciente.findOne({ where: { rut } });
  if (!paciente) {
    return res.status(404).json({ error: 'Paciente no registrado' });
  }

  const tipo = esAtencionPreferencial(paciente) ? 'P' : 'G';
  const fecha = hoyISO();

  const ticket = await sequelize.transaction(async (transaction) => {
    const ultimo = await Ticket.findOne({
      where: { fecha, tipo },
      order: [['numero', 'DESC']],
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
    return Ticket.create(
      { pacienteId: paciente.id, numero: (ultimo?.numero ?? 0) + 1, tipo, fecha, estado: 'en_espera' },
      { transaction },
    );
  });

  res.status(201).json(await ticket.reload({ include: TICKET_INCLUDES }));
});

async function transicion(req, res, { desde, hasta, extra }) {
  const ticket = await Ticket.findByPk(req.params.id, { include: TICKET_INCLUDES });
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
  if (desde && ticket.estado !== desde) {
    return res.status(409).json({ error: `El ticket debe estar en estado "${desde}"` });
  }
  await ticket.update({ estado: hasta, ...(extra ? extra(req) : {}) });
  res.json(await ticket.reload({ include: TICKET_INCLUDES }));
}

// PATCH /api/tickets/:id/llamar — asigna casilla y anuncia al paciente
router.patch('/:id/llamar', (req, res) => {
  const { casillaId } = req.body;
  if (!casillaId) return res.status(400).json({ error: 'casillaId es obligatorio' });
  return transicion(req, res, {
    desde: 'en_espera',
    hasta: 'llamado',
    extra: () => ({ casillaId, llamadoAt: new Date() }),
  });
});

// PATCH /api/tickets/:id/re-llamar — repite el anuncio de voz sin cambiar el estado
router.patch('/:id/re-llamar', (req, res) =>
  transicion(req, res, { desde: 'llamado', hasta: 'llamado', extra: () => ({ llamadoAt: new Date() }) }),
);

// PATCH /api/tickets/:id/no-presentado
router.patch('/:id/no-presentado', (req, res) =>
  transicion(req, res, { desde: 'llamado', hasta: 'no_presentado' }),
);

// PATCH /api/tickets/:id/finalizar
router.patch('/:id/finalizar', (req, res) =>
  transicion(req, res, { desde: 'llamado', hasta: 'atendido', extra: () => ({ finalizadoAt: new Date() }) }),
);

module.exports = router;
