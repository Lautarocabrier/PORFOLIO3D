import { Router } from "express";
import { AppError } from "../errors/AppError.js";

const router = Router();

router.post("/", (req, res, next) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return next(new AppError("Faltan campos: nombre, email o mensaje", 400));
  }

  console.log("Nuevo contacto:", { nombre, email, mensaje });

  res.status(201).json({ ok: true, mensaje: "Contacto recibido" });
});

export default router;
