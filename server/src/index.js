const http = require('http');
const express = require('express');
const cors = require('cors');
const sequelize = require('../db/connection');
const { Casilla } = require('./entities');
const { init: initSocket } = require('./socket');
const pacientesRouter = require('./routes/pacientes');
const ticketsRouter = require('./routes/tickets');
const casillasRouter = require('./routes/casillas');

const app = express();
const server = http.createServer(app);
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
      { nombre: 'Casilla 1' },
      { nombre: 'Casilla 2' },
      { nombre: 'Casilla 3' },
    ]);
    console.log('✔ Casillas iniciales creadas');
  }

  initSocket(server);

  server.listen(3000, () => console.log('✔ Server en http://localhost:3000'));
}

main().catch(err => console.error('Error al iniciar:', err.message));