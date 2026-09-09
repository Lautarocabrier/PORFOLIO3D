import { Router } from "express";
import { proyectos } from "../data/proyectos.js";
import { AppError } from "../errors/AppError.js";

// Router es como una "mini app" de Express: agrupa rutas relacionadas
// para no tener todo amontonado en server.js.
const router = Router();

router.get("/", (req, res) => {
  const { tecnologia } = req.query;

  const resultado = tecnologia
    ? proyectos.filter((p) => p.tecnologias.includes(tecnologia))
    : proyectos;

  res.json(resultado);
});

router.get("/:id", (req, res, next) => {
  const id = Number(req.params.id);
  const proyecto = proyectos.find((p) => p.id === id);

  if (!proyecto) {
    return next(new AppError("Proyecto no encontrado", 404));
  }

  res.json(proyecto);
});

export default router;
