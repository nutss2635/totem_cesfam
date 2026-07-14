const { Router } = require('express');
const { Paciente } = require('../entities');

const router = Router();

// GET /api/pacientes/:rut — el tótem consulta si el paciente ya está registrado
router.get('/:rut', async (req, res) => {
  const paciente = await Paciente.findOne({ where: { rut: req.params.rut } });
  if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
  res.json(paciente);
});

// POST /api/pacientes — registro cuando el RUT no existe todavía
router.post('/', async (req, res) => {
  const { rut, nombre, fechaNacimiento, atencionPreferencial } = req.body;
  if (!rut || !nombre || !fechaNacimiento) {
    return res.status(400).json({ error: 'rut, nombre y fechaNacimiento son obligatorios' });
  }

  try {
    const paciente = await Paciente.create({
      rut,
      nombre,
      fechaNacimiento,
      atencionPreferencial: !!atencionPreferencial,
    });
    res.status(201).json(paciente);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un paciente con ese RUT' });
    }
    throw err;
  }
});

module.exports = router;
