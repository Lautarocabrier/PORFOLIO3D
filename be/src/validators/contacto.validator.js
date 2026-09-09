// Regex simple para email: texto@texto.texto. No cubre el 100% del RFC,
// pero es suficiente para filtrar los casos obvios sin librerías extra.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve un array de errores. Vacío = todo válido.
export function validarContacto({ nombre, email, mensaje }) {
  const errores = [];

  // .trim() saca espacios al principio/final, así "   " no cuenta como texto real.
  if (!nombre || nombre.trim().length < 2) {
    errores.push("El nombre debe tener al menos 2 caracteres");
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errores.push("El email no tiene un formato válido");
  }

  if (!mensaje || mensaje.trim().length < 10) {
    errores.push("El mensaje debe tener al menos 10 caracteres");
  }

  if (mensaje && mensaje.length > 1000) {
    errores.push("El mensaje no puede superar los 1000 caracteres");
  }

  return errores;
}
