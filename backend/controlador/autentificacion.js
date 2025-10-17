// backend/controlador/autentificacion.js
const Cliente = require('../modelo/Cliente');

// Login en texto plano, igual que tu versión que funcionaba
exports.postLogin = async (req, res) => {
  try {
    const { rut, contrasena } = req.body || {};
    if (!rut || !contrasena) {
      return res.status(400).json({ ok: false, error: 'Falta rut o contraseña.' });
    }

    // 👇 MISMA llamada que usabas antes en tu index.js que funcionaba
    const user = await Cliente.authenticate(rut, contrasena);

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    // MISMO shape que usabas para la sesión
    req.session.user = {
      rut: user.rut,
      nombre: user.nombre,
      correo: user.correo,
      numero_cuenta: user.numero_cuenta
    };

    return res.json({ ok: true });
  } catch (e) {
    console.error('Error en postLogin:', e);
    // No pasamos a next() para evitar tu “Unhandled error”
    return res.status(500).json({ ok: false, error: 'Error interno en login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('No se pudo cerrar sesión');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
