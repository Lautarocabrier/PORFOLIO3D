const API_URL = "http://localhost:3000";

// fetch devuelve una Promise, por eso la función es async y usamos await
// (mismo concepto que ya vimos en el backend).
async function cargarProyectos() {
  const respuesta = await fetch(`${API_URL}/proyectos`);
  const proyectos = await respuesta.json();

  const contenedor = document.getElementById("proyectos-grid");

  // Por cada proyecto, generamos el HTML de una card y lo insertamos.
  contenedor.innerHTML = proyectos
    .map(
      (p) => `
        <div class="card">
          <h3>${p.titulo}</h3>
          <p>${p.descripcion}</p>
          <p><strong>${p.tecnologias.join(", ")}</strong></p>
        </div>
      `
    )
    .join("");
}

async function cargarExperiencia() {
  const respuesta = await fetch(`${API_URL}/experiencia`);
  const experiencia = await respuesta.json();

  const contenedor = document.getElementById("experiencia-grid");

  contenedor.innerHTML = experiencia
    .map(
      (e) => `
        <div class="card">
          <h3>${e.puesto} · ${e.empresa}</h3>
          <p>${e.periodo}</p>
          <p>${e.descripcion}</p>
        </div>
      `
    )
    .join("");
}

cargarProyectos();
cargarExperiencia();
