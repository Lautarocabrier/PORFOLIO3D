// Por ahora, datos hardcodeados en memoria. Después se puede reemplazar
// por una base de datos sin tocar el resto del código, si hace falta.
const proyectos = [
  {
    id: 1,
    titulo: "Estudio de Danza",
    descripcion: "Landing page para una escuela de danza",
    tecnologias: ["Angular"],
  },
  {
    id: 2,
    titulo: "API de Notas",
    descripcion: "API REST para gestionar notas",
    tecnologias: ["Node", "Express"],
  },
];

// Simula el tiempo que tardaría una consulta real a una base de datos.
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Estas funciones son "async" y devuelven una Promise, igual que devolvería
// una librería real de base de datos (ej: mongoose, prisma, etc.).
export async function findAll(tecnologia) {
  await delay(300);

  return tecnologia
    ? proyectos.filter((p) => p.tecnologias.includes(tecnologia))
    : proyectos;
}

export async function findById(id) {
  await delay(300);

  return proyectos.find((p) => p.id === id);
}
