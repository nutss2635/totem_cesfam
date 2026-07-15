const { Router } = require('express');
const { Casilla } = require('../entities');

const router = Router();

// GET /api/casillas — para que el panel del funcionario elija dónde atender
router.get('/', async (req, res) => {
  const casillas = await Casilla.findAll({ where: { activa: true }, order: [['nombre', 'ASC']] });
  res.json(casillas);
});

module.exports = router;
