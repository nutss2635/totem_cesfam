const { DataTypes } = require("sequelize");
const sequelize = require("../../db/connection");

const Paciente = sequelize.define(
  "Paciente",
  {
    rut: { type: DataTypes.STRING(12), unique: true, allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    fechaNacimiento: { type: DataTypes.DATEONLY, allowNull: false },
    atencionPreferencial: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "pacientes", timestamps: false },
);

module.exports = Paciente;
