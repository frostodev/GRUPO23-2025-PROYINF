// backend/controlador/registrar.js
const Cliente = require('../modelo/Cliente');

exports.postRegistrar = async (req, res) => {
  try {
    const { rut, nombre, correo, direccion, telefono, contrasena } = req.body || {};

    // Validación mínima
    if (!rut || !nombre || !correo || !direccion || !telefono || !contrasena) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios.' });
    }

    // Crea SOLO el cliente (sin hashing, tal cual tu modelo actual)
    const nuevo = new Cliente(rut, nombre, correo, direccion, telefono, contrasena);
    await nuevo.save(); // debe setear numero_cuenta y saldo_cuenta en la instancia

    // (Opcional) iniciar sesión automáticamente
    if (req.session) {
      req.session.user = {
        rut: nuevo.rut,
        nombre: nuevo.nombre,
        correo: nuevo.correo,
        numero_cuenta: nuevo.numero_cuenta,
      };
    }

    return res.status(201).json({
      ok: true,
      mensaje: 'Cliente registrado',
      cliente: {
        rut: nuevo.rut,
        nombre: nuevo.nombre,
        numero_cuenta: nuevo.numero_cuenta,
        saldo_cuenta: nuevo.saldo_cuenta ?? 0
      }
    });

  } catch (e) {
    console.error('POST /registrar error:', e);
    if (e && e.code === '23505') {
      // PK rut duplicado
      return res.status(409).json({ ok: false, error: 'RUT ya registrado.' });
    }
    return res.status(500).json({ ok: false, error: e.message || 'Error interno' });
  }
};
