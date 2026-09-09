import { Router } from "express";
import { findAll, findById } from "../data/experiencia.js";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const resultado = await findAll();
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await findById(id);

    if (!item) {
      return next(new AppError("Experiencia no encontrada", 404));
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
});

export default router;
