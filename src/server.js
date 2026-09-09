import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import proyectosRoutes from "./routes/proyectos.routes.js";
import experienciaRoutes from "./routes/experiencia.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { contactoLimiter } from "./middlewares/contactoLimiter.js";

// process.env lee las variables definidas en el archivo .env.
// El "|| 3000" es un valor por defecto por si no existe la variable.
const PORT = process.env.PORT || 3000;
const app = express();

// cors() permite que un frontend corriendo en otro puerto/dominio
// (ej: http://localhost:5173) pueda llamar a esta API sin que el
// navegador lo bloquee por política de "same-origin".
// helmet setea varios headers HTTP de seguridad recomendados por defecto
// (ej: evita que el navegador adivine el tipo de contenido, oculta qué
// tecnología corre el server, etc.). Es una sola línea pero buena práctica real.
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hola, este es el backend del portfolio");
});

// Endpoint estándar para que servicios de hosting/monitoreo chequeen
// que el server está vivo, sin necesidad de golpear una ruta "real".
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Todo lo que llegue a "/proyectos..." se delega al router correspondiente.
app.use("/proyectos", proyectosRoutes);
app.use("/experiencia", experienciaRoutes);
// El middleware se aplica solo a este router, antes de que la request
// llegue a la lógica de la ruta.
app.use("/contacto", contactoLimiter, contactoRoutes);

// Estos dos van SIEMPRE al final: primero atrapa rutas inexistentes,
// después cualquier error (incluido el de notFound) cae en errorHandler.
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
