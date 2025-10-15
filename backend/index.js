const express = require('express');
const pool = require('./modelo/db');
const app = express();
const port = 3000;

// necesario para que pueda cominucarce fuera de docker
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.disable('x-powered-by');

const Cliente = require('./modelo/Cliente');
const Evaluacion = require('./modelo/Evaluacion');
const Solicitud = require('./modelo/Solicitud');
const Prestamo = require('./modelo/Prestamo');
const Pago = require('./modelo/Pago');
const HistorialCrediticio = require('./modelo/HistorialCrediticio');

// --- Aquí importa y usa tu router de login ---
const loginRouter = require('./api/login');
app.use('/api', loginRouter);

// Ruta de prueba que guarda un mensaje en la base de datos
app.get('/save', async (req, res) => {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, content TEXT)');
    await pool.query('INSERT INTO messages (content) VALUES ($1)', ['Hola desde PostgreSQL!']);
    res.send('Mensaje guardado en la base de datos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

// Ruta para obtener todos los mensajes
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.get('/prueba', async (req, res) => {
  // Usaremos un RUT fijo para poder limpiar y resembrar
  const rut = '11.111.111-1';

  try {
    // 0) Limpiar datos previos (por si llamas /prueba varias veces)
    //    Borra en orden de hijos -> padres para no chocar con FKs
    await pool.query('DELETE FROM pago WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM prestamo WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM solicitud WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM evaluacion WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM historialCrediticio WHERE clienteRut = $1', [rut]);
    await pool.query('DELETE FROM clientes WHERE rut = $1', [rut]);

    // 1) Cliente
    const c = new Cliente(
      rut,
      'Ada Lovelace',
      'ada@correo.com',
      'Londres 123',
      '123456789',
      'secreta' // recuerda: en real, guarda hash
    );
    await c.save(); // numero_cuenta y saldo_cuenta vienen desde la DB

    // 2) Evaluaciones (dos para probar historial)
    const eva1 = await new Evaluacion({ clienteRut: rut, sueldo: 900000, riesgo: 2 }).save();
    const eva2 = await new Evaluacion({ clienteRut: rut, sueldo: 950000, riesgo: 1 }).save();

    // 3) Solicitud
    const sol = await new Solicitud({
      clienteRut: rut,
      fechaSolicitud: '2025-09-28',
      documentos: 'CI.pdf;Liquidacion.pdf',
      estado: 'pendiente'
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

    // 5) Pagos (al menos uno)
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
      evaluaciones: [eva1, eva2],
      solicitud: { idSolicitud: sol.idSolicitud, estado: sol.estado },
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

app.get('/', (req, res) => {
  res.send('¡Bienvenido! Usa /save para guardar un mensaje y /messages para verlos.');
});

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(port, () => {
  console.log(`App corriendo en http://localhost:${port}`);
});