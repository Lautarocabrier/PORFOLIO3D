import { Router } from "express";
import { proyectos } from "../data/proyectos.js";

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

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const proyecto = proyectos.find((p) => p.id === id);

  if (!proyecto) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }

  res.json(proyecto);
});

export default router;
