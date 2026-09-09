// Clase de error propia: nos permite adjuntar un status HTTP a cada error,
// en vez de repetir res.status(...).json(...) en cada ruta.
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}
