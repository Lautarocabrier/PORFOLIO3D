import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: "Faltan campos: nombre, email o mensaje" });
  }

  console.log("Nuevo contacto:", { nombre, email, mensaje });

  res.status(201).json({ ok: true, mensaje: "Contacto recibido" });
});

export default router;
