// Middleware para rutas que no matchean ninguna definida (404 genérico).
// Va DESPUÉS de todas las rutas, porque Express las prueba en orden.
export function notFound(req, res, next) {
  next(new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Middleware de errores: Express lo reconoce porque tiene 4 parámetros (err primero).
// Cualquier "next(error)" en cualquier ruta termina acá, en un solo lugar.
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  console.error(err.message);

  res.status(status).json({ error: err.message });
}
