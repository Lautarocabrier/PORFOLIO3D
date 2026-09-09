import rateLimit from "express-rate-limit";

// Limita cuántos POST puede hacer la misma IP en una ventana de tiempo,
// para evitar que un bot spamee el formulario de contacto.
export const contactoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 requests por IP en esa ventana
  message: { error: "Demasiados mensajes enviados. Probá de nuevo más tarde." },
});
