const experiencia = [
  {
    id: 1,
    puesto: "Desarrollador Frontend",
    empresa: "Freelance",
    periodo: "2024 - presente",
    descripcion: "Desarrollo de landing pages y aplicaciones con Angular",
  },
  {
    id: 2,
    puesto: "Estudiante",
    empresa: "IES",
    periodo: "2023 - presente",
    descripcion: "Formación en desarrollo de software",
  },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function findAll() {
  await delay(300);
  return experiencia;
}

export async function findById(id) {
  await delay(300);
  return experiencia.find((e) => e.id === id);
}
