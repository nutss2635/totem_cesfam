const Paciente = require('./Paciente');
const Casilla = require('./Casilla');
const Ticket = require('./Ticket');
const VinculoApoderado = require('./vinculoApoderado');

Paciente.hasMany(Ticket, { foreignKey: 'pacienteId' });
Ticket.belongsTo(Paciente, { foreignKey: 'pacienteId' });

Casilla.hasMany(Ticket, { foreignKey: 'casillaId' });
Ticket.belongsTo(Casilla, { foreignKey: 'casillaId' });

// Un apoderado puede tener varios dependientes a cargo (ej. discapacidad) y
// un dependiente puede tener más de un apoderado.
Paciente.belongsToMany(Paciente, {
  through: VinculoApoderado,
  as: 'Dependientes',
  foreignKey: 'apoderadoId',
  otherKey: 'dependienteId',
});
Paciente.belongsToMany(Paciente, {
  through: VinculoApoderado,
  as: 'Apoderados',
  foreignKey: 'dependienteId',
  otherKey: 'apoderadoId',
});

module.exports = { Paciente, Casilla, Ticket, VinculoApoderado };