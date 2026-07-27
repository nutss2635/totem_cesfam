const { faker } = require('@faker-js/faker/locale/es');
const sequelize = require('./connection');
const { Paciente, VinculoApoderado } = require('../src/entities');

// Dígito verificador con módulo 11
function dv(rutNum) {
  let suma = 0, mult = 2;
  for (const d of String(rutNum).split('').reverse()) {
    suma += Number(d) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = 11 - (suma % 11);
  return resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
}

function rutAleatorio() {
  const num = faker.number.int({ min: 5_000_000, max: 26_000_000 });
  return `${num}-${dv(num)}`;
}

async function seed() {
  await sequelize.sync();

  const pacientes = [];
  for (let i = 0; i < 30; i++) {
    // ~40% adultos mayores para probar la clasificación automática
    const esMayor = Math.random() < 0.4;
    const fechaNacimiento = faker.date.birthdate(
      esMayor ? { min: 60, max: 90, mode: 'age' }
              : { min: 18, max: 59, mode: 'age' }
    );
    pacientes.push({
      rut: rutAleatorio(),
      nombre: faker.person.fullName(),
      fechaNacimiento,
      atencionPreferencial: esMayor,
    });
  }
  await Paciente.bulkCreate(pacientes);

  console.log('✔ 30 pacientes simulados insertados');

  // Vínculo de prueba: un apoderado (adulto, sin preferencial propia) a cargo
  // de un dependiente con discapacidad, para probar la pregunta "¿es para ti o para X?".
  const apoderado = await Paciente.create({
    rut: rutAleatorio(),
    nombre: 'Pedro Soto Rojas',
    fechaNacimiento: faker.date.birthdate({ min: 30, max: 45, mode: 'age' }),
    atencionPreferencial: false,
  });
  const dependiente = await Paciente.create({
    rut: rutAleatorio(),
    nombre: 'Valentina Soto Rojas',
    fechaNacimiento: faker.date.birthdate({ min: 15, max: 25, mode: 'age' }),
    atencionPreferencial: true, // discapacidad registrada
  });
  await VinculoApoderado.create({ apoderadoId: apoderado.id, dependienteId: dependiente.id });

  console.log(`✔ Vínculo de prueba creado: apoderado ${apoderado.rut} → dependiente ${dependiente.rut} (${dependiente.nombre}, preferencial)`);

  await sequelize.close();
}

seed();
