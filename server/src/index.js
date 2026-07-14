const express = require('express');
const cors = require('cors');
const sequelize = require('../db/connection');
const { Casilla } = require('./entities');
const pacientesRouter = require('./routes/pacientes');
const ticketsRouter = require('./routes/tickets');
const casillasRouter = require('./routes/casillas');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true }));
app.use('/api/pacientes', pacientesRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/casillas', casillasRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

async function main() {
  await sequelize.sync(); // ← aquí se crean las tablas si no existen
  console.log('✔ Base de datos sincronizada');

  // Casillas fijas: se crean solo si no existen
  const total = await Casilla.count();
  if (total === 0) {
    await Casilla.bulkCreate([
      { nombre: 'Atención General 1', tipo: 'G' },
      { nombre: 'Atención General 2', tipo: 'G' },
      { nombre: 'Atención Preferencial 1', tipo: 'P' },
    ]);
    console.log('✔ Casillas iniciales creadas');
  }

  app.listen(3000, () => console.log('✔ Server en http://localhost:3000'));
}

main().catch(err => console.error('Error al iniciar:', err.message));