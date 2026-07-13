const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');

const Ticket = sequelize.define('Ticket', {
  numero: { type: DataTypes.SMALLINT, allowNull: false },
  tipo: { type: DataTypes.CHAR(1), allowNull: false },
  fecha: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  estado: {
    type: DataTypes.ENUM('en_espera', 'llamado', 'atendido', 'no_presentado'),
    defaultValue: 'en_espera',
  },
  llamadoAt: { type: DataTypes.DATE },
  finalizadoAt: { type: DataTypes.DATE },
}, {
  tableName: 'tickets',
  timestamps: true,
  updatedAt: false,
  createdAt: 'creadoAt',
  indexes: [
    { unique: true, fields: ['fecha', 'tipo', 'numero'] },
    { fields: ['fecha', 'tipo', 'estado', 'numero'] },
  ],
});

module.exports = Ticket;