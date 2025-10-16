const express = require('express');
const pool = require('./backend/modelo/db'); // Importar la conexión (no lo usamos aún)
const app = express();
const port = 3000;
const path = require('path');
const session = require('express-session');

app.disable('x-powered-by');

// ===== Modelos (no usados por ahora, pero los dejamos) =====
const Cliente = require('./backend/modelo/Cliente');
const Evaluacion = require('./backend/modelo/Evaluacion');
const Solicitud = require('./backend/modelo/Solicitud');
const Prestamo = require('./backend/modelo/Prestamo');
const Pago = require('./backend/modelo/Pago');
const HistorialCrediticio = require('./backend/modelo/HistorialCrediticio');

// ---------- Middlewares base ----------
app.use(express.json());

// (Opcional) si alguna vez activas cookie.secure=true detrás de proxy (nginx), descomenta:
// app.set('trust proxy', 1);

// ---------- Sesiones ----------
app.use(session({
  secret: '1234',          // ⚠️ cámbialo en prod
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    // secure: true,       // usa true solo con HTTPS
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));

// ---------- Helpers ----------
function requireAuth(req, res, next) {
  // sin optional chaining para evitar problemas de versión
  if (req.session && req.session.user) return next();
  return res.status(401).send('No autenticado');
}

// ---------- Estáticos ----------
app.use(express.static(path.join(__dirname, 'frontend'), {
  index: ['index.html', 'index.htm']
}));

// ---------- Diagnóstico ----------
app.get('/api/ping', (_req, res) => res.json({ ok: true, now: Date.now() }));

app.get('/api/ping-session', (req, res) => {
  // debe incrementar entre requests si la cookie de sesión está funcionando
  if (!req.session.test) req.session.test = 0;
  req.session.test += 1;
  res.json({ ok: true, counter: req.session.test });
});

// ---------- Login ----------
app.post('/api/login', async (req, res) => {
  try {
    const { rut, contrasena } = req.body || {};
    if (!rut || !contrasena) {
      return res.status(400).json({ ok: false, error: 'Falta rut o contraseña.' });
    }

    // usa tu modelo existente
    const user = await Cliente.authenticate(rut, contrasena);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }

    // guarda datos mínimos en la sesión (nunca contraseñas)
    req.session.user = {
      rut: user.rut,
      nombre: user.nombre,
      correo: user.correo,
      numero_cuenta: user.numero_cuenta
    };

    return res.json({ ok: true });
  } catch (e) {
    console.error('Error /api/login:', e);
    return res.status(500).json({ ok: false, error: 'Error interno' });
  }
});

// ---------- Página protegida ----------
app.get('/exito', requireAuth, (req, res) => {
  const u = req.session.user;
  res.send(`
    <!doctype html>
    <html lang="es">
    <head><meta charset="utf-8"><title>Éxito</title></head>
    <body style="font-family:system-ui;max-width:720px;margin:40px auto;">
      <h1>Inicio de sesión exitoso</h1>
      <p>¡Hola, ${u.nombre}!</p>
      <p>RUT: ${u.rut}</p>
      <p>N° Cuenta: ${u.numero_cuenta}</p>
      <p><a href="/logout">Cerrar sesión</a></p>
    </body>
    </html>
  `);
});

app.get('/prueba', async (req, res) => {
  const rut = '11.111.111-1';

  try {
    // Limpiar datos previos (hijos -> padres)
    await pool.query('DELETE FROM pago WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM prestamo WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM evaluacion WHERE clienteRut = $1', [rut]); // 👈 borrar evaluaciones antes de solicitudes
    await pool.query('DELETE FROM solicitud WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM historialCrediticio WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM clientes WHERE rut = $1', [rut]);

    // 1) Cliente
    const c = new Cliente(
      rut,
      'Ada Lovelace',
      'ada@correo.com',
      'Londres 123',
      '123456789',
      'secreta'
    );
    await c.save();

    // 2) Solicitud (primero, porque Evaluación depende de esto)
    const sol = await new Solicitud({
      clienteRut: rut,
      fechaSolicitud: '2025-09-28',
      documentos: 'CI.pdf;Liquidacion.pdf',
      estado: 'pendiente'
    }).save();

    // 3) Evaluaciones (ligadas a la solicitud) 👇 SIN sueldo
    const eva1 = await new Evaluacion({
      idSolicitud: sol.idSolicitud,
      clienteRut: rut,
      riesgo: 2
    }).save();

    // 4) Préstamo (ligado a la solicitud)
    const prest = await new Prestamo({
      idSolicitud: sol.idSolicitud,
      clienteRut: rut,
      monto: 1000000,
      tasa: 0.12,
      plazo: 12,
      estado: true
    }).save();

    // 5) Pago
    const pago1 = await new Pago({
      clienteRut: rut,
      fechaPago: '2025-10-01',
      dias_atraso: 0,
      monto: 100000,
      montoAtraso: 0
    }).save();

    // 6) Historial crediticio
    const hist = await new HistorialCrediticio({
      clienteRut: rut,
      prestamos_historicos: 1,
      prestamos_pagados_al_dia_historicos: 0,
      prestamos_atrasados_historicos: 0,
      prestamos_activos: 1,
      maximos_dias_atraso_historico: 0,
      deuda_actual: 900000
    }).save();

    res.json({
      ok: true,
      mensaje: 'Datos de prueba insertados',
      cliente: {
        rut: c.rut,
        nombre: c.nombre,
        numero_cuenta: c.numero_cuenta,
        saldo_cuenta: c.saldo_cuenta
      },
      solicitud: { idSolicitud: sol.idSolicitud, estado: sol.estado },
      evaluaciones: [
        { idEvaluacion: eva1.idEvaluacion, idSolicitud: sol.idSolicitud, riesgo: eva1.riesgo },
      ],
      prestamo: { idPrestamo: prest.idPrestamo, monto: prest.monto, tasa: prest.tasa },
      pago: { idPago: pago1.idPago, monto: pago1.monto },
      historial: {
        prestamos_activos: hist.prestamos_activos,
        deuda_actual: hist.deuda_actual
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/prueba', async (req, res) => {
  const rut = '11.111.111-1';

  try {
    // Limpiar datos previos (hijos -> padres)
    await pool.query('DELETE FROM pago WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM prestamo WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM evaluacion WHERE clienteRut = $1', [rut]); // 👈 borrar evaluaciones antes de solicitudes
    await pool.query('DELETE FROM solicitud WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM historialCrediticio WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM clientes WHERE rut = $1', [rut]);

    // 1) Cliente
    const c = new Cliente(
      rut,
      'Ada Lovelace',
      'ada@correo.com',
      'Londres 123',
      '123456789',
      'secreta'
    );
    await c.save();

    // 2) Solicitud (primero, porque Evaluación depende de esto)
    const sol = await new Solicitud({
      clienteRut: rut,
      fechaSolicitud: '2025-09-28',
      documentos: 'CI.pdf;Liquidacion.pdf',
      estado: 'pendiente'
    }).save();

    // 3) Evaluaciones (ligadas a la solicitud) 👇 SIN sueldo
    const eva1 = await new Evaluacion({
      idSolicitud: sol.idSolicitud,
      clienteRut: rut,
      riesgo: 2
    }).save();

    // 4) Préstamo (ligado a la solicitud)
    const prest = await new Prestamo({
      idSolicitud: sol.idSolicitud,
      clienteRut: rut,
      monto: 1000000,
      tasa: 0.12,
      plazo: 12,
      estado: true
    }).save();

    // 5) Pago
    const pago1 = await new Pago({
      clienteRut: rut,
      fechaPago: '2025-10-01',
      dias_atraso: 0,
      monto: 100000,
      montoAtraso: 0
    }).save();

    // 6) Historial crediticio
    const hist = await new HistorialCrediticio({
      clienteRut: rut,
      prestamos_historicos: 1,
      prestamos_pagados_al_dia_historicos: 0,
      prestamos_atrasados_historicos: 0,
      prestamos_activos: 1,
      maximos_dias_atraso_historico: 0,
      deuda_actual: 900000
    }).save();

    res.json({
      ok: true,
      mensaje: 'Datos de prueba insertados',
      cliente: {
        rut: c.rut,
        nombre: c.nombre,
        numero_cuenta: c.numero_cuenta,
        saldo_cuenta: c.saldo_cuenta
      },
      solicitud: { idSolicitud: sol.idSolicitud, estado: sol.estado },
      evaluaciones: [
        { idEvaluacion: eva1.idEvaluacion, idSolicitud: sol.idSolicitud, riesgo: eva1.riesgo },
      ],
      prestamo: { idPrestamo: prest.idPrestamo, monto: prest.monto, tasa: prest.tasa },
      pago: { idPago: pago1.idPago, monto: pago1.monto },
      historial: {
        prestamos_activos: hist.prestamos_activos,
        deuda_actual: hist.deuda_actual
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});
// ---------- Logout ----------
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('No se pudo cerrar sesión');
    }
    res.clearCookie('connect.sid'); // nombre por defecto
    res.redirect('/');
  });
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// ---------- Error handler global (no deja que el server muera sin mensaje) ----------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  try {
    res.status(500).json({ ok: false, error: 'Unhandled error' });
  } catch {}
});

// ---------- Arranque ----------
app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor escuchando en http://0.0.0.0:3000');
});
