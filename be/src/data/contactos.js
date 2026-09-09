import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// import.meta.url da la ruta de este archivo; de ahí armamos la ruta
// absoluta al JSON, sin importar desde dónde se ejecute "npm run dev".
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_PATH = path.join(__dirname, "contactos.json");

async function leerContactos() {
  try {
    const contenido = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(contenido);
  } catch (err) {
    // Si el archivo no existe todavía (ENOENT), arrancamos con un array vacío.
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

export async function guardarContacto({ nombre, email, mensaje }) {
  const contactos = await leerContactos();

  const nuevoContacto = {
    id: contactos.length + 1,
    nombre,
    email,
    mensaje,
    fecha: new Date().toISOString(),
  };

  contactos.push(nuevoContacto);

  // null, 2 = formatea el JSON con indentación, para que sea legible si lo abrís.
  await fs.writeFile(FILE_PATH, JSON.stringify(contactos, null, 2));

  return nuevoContacto;
}
