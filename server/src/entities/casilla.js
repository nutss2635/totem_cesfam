const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');

const Casilla = sequelize.define('Casilla', {
  nombre: { type: DataTypes.STRING(50), allowNull: false },
  tipo: { type: DataTypes.CHAR(1), allowNull: false }, // 'G' o 'P'
  activa: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'casillas', timestamps: false });

module.exports = Casilla;