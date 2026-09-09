import { Router } from "express";
import { AppError } from "../errors/AppError.js";
import { validarContacto } from "../validators/contacto.validator.js";
import { guardarContacto } from "../data/contactos.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { nombre, email, mensaje } = req.body;

    const errores = validarContacto({ nombre, email, mensaje });

    if (errores.length > 0) {
      // .join(", ") convierte el array de errores en un solo string legible.
      return next(new AppError(errores.join(", "), 400));
    }

    const contacto = await guardarContacto({ nombre, email, mensaje });

    res.status(201).json({ ok: true, mensaje: "Contacto recibido", id: contacto.id });
  } catch (err) {
    next(err);
  }
});

export default router;
