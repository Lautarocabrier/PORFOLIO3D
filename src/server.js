import "dotenv/config";
import express from "express";
import cors from "cors";
import proyectosRoutes from "./routes/proyectos.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

// process.env lee las variables definidas en el archivo .env.
// El "|| 3000" es un valor por defecto por si no existe la variable.
const PORT = process.env.PORT || 3000;
const app = express();

// cors() permite que un frontend corriendo en otro puerto/dominio
// (ej: http://localhost:5173) pueda llamar a esta API sin que el
// navegador lo bloquee por política de "same-origin".
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hola, este es el backend del portfolio");
});

// Todo lo que llegue a "/proyectos..." se delega al router correspondiente.
app.use("/proyectos", proyectosRoutes);
app.use("/contacto", contactoRoutes);

// Estos dos van SIEMPRE al final: primero atrapa rutas inexistentes,
// después cualquier error (incluido el de notFound) cae en errorHandler.
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
