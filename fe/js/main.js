const API_URL = "http://localhost:3000";

// Función genérica: recibe la URL a pedir, dónde renderizar, y cómo
// convertir cada item en HTML. Evita repetir la misma lógica dos veces.
async function cargarSeccion(url, contenedorId, renderItem) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "<p>Cargando...</p>";

  try {
    const respuesta = await fetch(url);

    // fetch SOLO lanza una excepción si hay un problema de red (sin conexión,
    // servidor caído). Un 404 o 500 igual llega acá como respuesta "normal",
    // por eso hay que chequear response.ok a mano.
    if (!respuesta.ok) {
      throw new Error(`Error del servidor: ${respuesta.status}`);
    }

    const items = await respuesta.json();

    if (items.length === 0) {
      contenedor.innerHTML = "<p>No hay datos para mostrar.</p>";
      return;
    }

    contenedor.innerHTML = items.map(renderItem).join("");
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "<p>No se pudo cargar la información. Intentá más tarde.</p>";
  }
}

function renderProyecto(p) {
  return `
    <div class="card">
      <h3>${p.titulo}</h3>
      <p>${p.descripcion}</p>
      <p><strong>${p.tecnologias.join(", ")}</strong></p>
    </div>
  `;
}

function renderExperiencia(e) {
  return `
    <div class="card">
      <h3>${e.puesto} · ${e.empresa}</h3>
      <p>${e.periodo}</p>
      <p>${e.descripcion}</p>
    </div>
  `;
}

cargarSeccion(`${API_URL}/proyectos`, "proyectos-grid", renderProyecto);
cargarSeccion(`${API_URL}/experiencia`, "experiencia-grid", renderExperiencia);
