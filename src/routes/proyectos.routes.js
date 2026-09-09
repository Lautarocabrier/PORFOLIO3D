import { Router } from "express";
import { findAll, findById } from "../data/proyectos.js";
import { AppError } from "../errors/AppError.js";

// Router es como una "mini app" de Express: agrupa rutas relacionadas
// para no tener todo amontonado en server.js.
const router = Router();

// "async" en el callback nos permite usar "await" adentro: el código
// se lee como síncrono, aunque por dentro espere una Promise.
router.get("/", async (req, res, next) => {
  try {
    const { tecnologia } = req.query;
    const resultado = await findAll(tecnologia);
    res.json(resultado);
  } catch (err) {
    // Si findAll fallara (ej: la DB real se cae), el error cae acá
    // y lo mandamos al middleware centralizado en vez de romper el server.
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const proyecto = await findById(id);

    if (!proyecto) {
      return next(new AppError("Proyecto no encontrado", 404));
    }

    res.json(proyecto);
  } catch (err) {
    next(err);
  }
});

export default router;
