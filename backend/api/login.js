const express = require('express');
const router = express.Router();
const Cliente = require('../modelo/Cliente');

// POST /api/login
router.post('/login', async (req, res) => {
  const { rut, contrasena } = req.body;
  if (!rut || !contrasena) {
    return res.status(400).json({ ok: false, error: 'Faltan datos' });
  }
  try {
    const cliente = await Cliente.getForLogin(rut);
    if (!cliente) {
      return res.status(401).json({ ok: false, error: 'Usuario no encontrado' });
    }
    // Aquí deberías comparar la contraseña (idealmente hasheada)
    if (cliente.contrasena !== contrasena) {
      return res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
    }
    // Si todo bien
    return res.json({ ok: true, cliente: { rut: cliente.rut, nombre: cliente.nombre } });
  } catch (e) {
    console.error('Error en login:', e);
    return res.status(500).json({ ok: false, error: 'Error interno' });
  }
});

module.exports = router;
