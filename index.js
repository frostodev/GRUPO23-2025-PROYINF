const express = require('express');
const pool = require('./backend/modelo/db'); // Importar la conexión (no lo usamos aún)
const app = express();
const port = 3000;
const path = require('path');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

app.disable('x-powered-by');

// ---------- Middlewares base ----------

const authCtrl = require('./backend/controlador/autentificacion');
const registrarCtrl = require('./backend/controlador/registrar');
const solicitudesCtrl = require('./backend/controlador/solicitudes');

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

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
  // Corregido: Devolver JSON para que el frontend lo entienda
  return res.status(401).json({ ok: false, error: 'No autenticado' }); 
}

// ---------- Estáticos ----------
app.use(express.static(path.join(__dirname, 'frontend'), {
  index: ['index.html', 'index.htm']
}));

app.get('/api/me', (req, res) => {
  res.json({ ok: true, user: req.session.user || null });
});

// ---------- Diagnóstico ----------
app.get('/api/ping', (_req, res) => res.json({ ok: true, now: Date.now() }));

app.get('/api/ping-session', (req, res) => {
  // ... (código sin cambios)
  if (!req.session.test) req.session.test = 0;
  req.session.test += 1;
  res.json({ ok: true, counter: req.session.test });
});

// ---------- API de Login y Registro ----------
app.post('/api/login', authCtrl.postLogin);
app.post('/api/registrar', registrarCtrl.postRegistrar); // <-- Corregido (tenía /api/registrar)
app.get('/api/logout', authCtrl.logout); // <-- Corregido (movido y renombrado a /api)

// ---------- API de Solicitudes y Simulaciones ----------
app.post('/api/solicitudes/cotizar', requireAuth, solicitudesCtrl.cotizar);
app.post('/api/simulaciones/guardar', requireAuth, solicitudesCtrl.guardarSimulacion);
app.get('/api/simulaciones/guardadas', requireAuth, solicitudesCtrl.obtenerSimulacionesGuardadas);
app.post('/api/solicitudes/crear', requireAuth, solicitudesCtrl.crearDesdeSimulacion);


// ---------- 404 ----------
app.use((req, res) => {
  if (!req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
  res.status(404).json({ ok: false, error: '404 Not Found' });
});

// ---------- Error handler global ----------
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