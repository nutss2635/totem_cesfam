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

function fechaPorEdad(min, max) {
  return faker.date.birthdate({ min, max, mode: 'age' });
}

function crearPaciente({ nombre, min, max, atencionPreferencial = false }) {
  return Paciente.create({
    rut: rutAleatorio(),
    nombre: nombre ?? faker.person.fullName(),
    fechaNacimiento: fechaPorEdad(min, max),
    atencionPreferencial,
  });
}

async function vincular(apoderado, dependientes) {
  for (const dependiente of dependientes) {
    await VinculoApoderado.create({ apoderadoId: apoderado.id, dependienteId: dependiente.id });
  }
}

async function seed() {
  await sequelize.sync();

  // Limpia lo anterior para que el script se pueda correr las veces que se necesite.
  await sequelize.query('TRUNCATE TABLE tickets, vinculos_apoderado, pacientes RESTART IDENTITY CASCADE');

  // --- Menores de 18 ---
  const menores = Array.from({ length: 8 }, () => ({
    rut: rutAleatorio(),
    nombre: faker.person.fullName(),
    fechaNacimiento: fechaPorEdad(1, 17),
    atencionPreferencial: false,
  }));

  // --- Adultos (18-59), un par marcados manualmente como preferencial (embarazo/discapacidad) ---
  const adultos = Array.from({ length: 12 }, (_, i) => ({
    rut: rutAleatorio(),
    nombre: faker.person.fullName(),
    fechaNacimiento: fechaPorEdad(18, 59),
    atencionPreferencial: i < 2,
  }));

  // --- Adultos mayores (60+): preferenciales automáticamente por edad ---
  const adultosMayores = Array.from({ length: 10 }, () => ({
    rut: rutAleatorio(),
    nombre: faker.person.fullName(),
    fechaNacimiento: fechaPorEdad(60, 95),
    atencionPreferencial: false,
  }));

  await Paciente.bulkCreate([...menores, ...adultos, ...adultosMayores]);
  console.log(
    `✔ ${menores.length} menores de edad, ${adultos.length} adultos y ${adultosMayores.length} adultos mayores insertados`,
  );

  // --- Casos de apoderados/dependientes, para probar la pregunta "¿es para ti o para X?" ---
  // El vínculo apoderado→dependiente solo tiene sentido cuando el dependiente
  // tiene una discapacidad registrada (no por ser menor de edad o adulto mayor:
  // eso ya se clasifica solo, sin necesitar un apoderado).

  // Caso 1: madre a cargo de su hija menor de edad con discapacidad.
  const madre = await crearPaciente({ nombre: 'Carla Reyes Muñoz', min: 30, max: 45 });
  const hijaDisc = await crearPaciente({
    nombre: 'Martina Reyes Soto',
    min: 4,
    max: 16,
    atencionPreferencial: true,
  });
  await vincular(madre, [hijaDisc]);

  // Caso 2: apoderado adulto a cargo de un dependiente adulto con discapacidad.
  const apoderadoDisc = await crearPaciente({ nombre: 'Pedro Soto Rojas', min: 30, max: 45 });
  const dependienteDisc = await crearPaciente({
    nombre: 'Valentina Soto Rojas',
    min: 15,
    max: 25,
    atencionPreferencial: true,
  });
  await vincular(apoderadoDisc, [dependienteDisc]);

  // Caso 3: abuelo adulto mayor, apoderado de un nieto menor con discapacidad.
  const abuelo = await crearPaciente({ nombre: 'Jorge Cid Bravo', min: 65, max: 80 });
  const nietoDisc = await crearPaciente({ nombre: 'Maximiliano Cid Fuentes', min: 6, max: 12, atencionPreferencial: true });
  await vincular(abuelo, [nietoDisc]);

  console.log('✔ Casos de apoderados creados (dependiente siempre con discapacidad registrada):');
  console.log(`  - ${madre.rut}  ${madre.nombre} → apoderada de ${hijaDisc.nombre} (menor con discapacidad)`);
  console.log(`  - ${apoderadoDisc.rut}  ${apoderadoDisc.nombre} → apoderado de ${dependienteDisc.nombre} (adulta con discapacidad)`);
  console.log(`  - ${abuelo.rut}  ${abuelo.nombre} (adulto mayor) → apoderado de ${nietoDisc.nombre} (menor con discapacidad)`);

  await sequelize.close();
}

seed();
