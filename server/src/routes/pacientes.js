const { Router } = require('express');
const { Paciente } = require('../entities');

const router = Router();

// GET /api/pacientes/:rut — el tótem consulta si el paciente ya está registrado
// y de quién es apoderado, para preguntar si la atención es para él o para un dependiente
router.get('/:rut', async (req, res) => {
  const paciente = await Paciente.buscarPorRut(req.params.rut);
  if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
  const conDependientes = await paciente.reload({
    include: [{ model: Paciente, as: 'Dependientes', attributes: ['id', 'nombre'] }],
  });
  res.json(conDependientes);
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
