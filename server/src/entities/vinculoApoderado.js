const { DataTypes } = require('sequelize');
const sequelize = require('../../db/connection');

// Relación N:M sobre Paciente: un apoderado puede representar a varios
// dependientes (ej. personas con discapacidad a su cargo) y viceversa.
const VinculoApoderado = sequelize.define(
  'VinculoApoderado',
  {
    apoderadoId: { type: DataTypes.INTEGER, allowNull: false },
    dependienteId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'vinculos_apoderado',
    timestamps: false,
    indexes: [{ unique: true, fields: ['apoderadoId', 'dependienteId'] }],
  },
);

module.exports = VinculoApoderado;
