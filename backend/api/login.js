const express = require('express');
const router = express.Router();
const pool = require('../modelo/db'); // tu conexión a PostgreSQL

router.post('/login', async (req, res) => {
  const { rut, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE rut = $1 AND contrasena = $2',
      [rut, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Rut o contraseña incorrectos' });
    }
  } catch (err) {
    console.error(err); // <-- Agrega esto para ver el error real
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;