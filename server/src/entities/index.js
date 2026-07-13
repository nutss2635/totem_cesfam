const Paciente = require('./Paciente');
const Casilla = require('./Casilla');
const Ticket = require('./Ticket');

Paciente.hasMany(Ticket, { foreignKey: 'pacienteId' });
Ticket.belongsTo(Paciente, { foreignKey: 'pacienteId' });

Casilla.hasMany(Ticket, { foreignKey: 'casillaId' });
Ticket.belongsTo(Casilla, { foreignKey: 'casillaId' });

module.exports = { Paciente, Casilla, Ticket };