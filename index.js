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

const authCtrl = require('./backend/controlador/autentificacion');
const registrarCtrl = require('./backend/controlador/registrar');

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
app.post('/api/login', authCtrl.postLogin);
app.get('/logout', authCtrl.logout);
app.post('/registrar', registrarCtrl.postRegistrar); 

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
