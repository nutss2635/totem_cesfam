const { DataTypes, fn, col, where } = require("sequelize");
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

// Compara el RUT sin puntos ni guion: en la BD real conviven RUTs cargados
// con distinto formato (con o sin puntos/guion), así que el match no puede
// depender de que coincidan carácter por carácter.
Paciente.buscarPorRut = function (rut) {
  const limpio = rut.replace(/[.-]/g, "").toUpperCase();
  return Paciente.findOne({
    where: where(fn("upper", fn("replace", fn("replace", col("rut"), ".", ""), "-", "")), limpio),
  });
};

module.exports = Paciente;
