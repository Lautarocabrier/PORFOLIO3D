import { Router } from "express";
import { AppError } from "../errors/AppError.js";
import { validarContacto } from "../validators/contacto.validator.js";

const router = Router();

router.post("/", (req, res, next) => {
  const { nombre, email, mensaje } = req.body;

  const errores = validarContacto({ nombre, email, mensaje });

  if (errores.length > 0) {
    // .join(", ") convierte el array de errores en un solo string legible.
    return next(new AppError(errores.join(", "), 400));
  }

  console.log("Nuevo contacto:", { nombre, email, mensaje });

  res.status(201).json({ ok: true, mensaje: "Contacto recibido" });
});

export default router;
