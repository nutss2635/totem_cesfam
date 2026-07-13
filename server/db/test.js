const sequelize = require('./connection');
const { Casilla } = require('../src/entities');

Casilla.findAll({ attributes: ['nombre', 'tipo'], raw: true })
  .then(rows => {
    console.table(rows);
    return sequelize.close();
  })
  .catch(err => console.error('Error de conexión:', err.message));
