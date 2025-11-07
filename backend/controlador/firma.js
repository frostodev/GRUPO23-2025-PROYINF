// backend/controlador/firma.js
const pool = require('../modelo/db');
const nodemailer = require("nodemailer");
const Solicitud = require('../modelo/Solicitud');
const Evaluacion = require('../modelo/Evaluacion');
const Prestamo = require('../modelo/Prestamo');
const Cliente = require('../modelo/Cliente');


function generarOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.vista = async (req, res) => {
  return res.sendFile('firma.html', { root: 'frontend/vista' });
};

exports.datos = async (req, res) => {
  try {
    const idSolicitud = Number(req.params.id);
    const rut = req.session.user?.rut;
    if (!rut) return res.status(401).json({ ok:false, error:'No autenticado' });

    const sol = await Solicitud.getById(rut, idSolicitud);
    if (!sol) return res.status(404).json({ ok:false, error:'Solicitud no encontrada' });
    if (sol.estado !== 'aceptada') return res.status(400).json({ ok:false, error:'La solicitud no está aceptada' });

    const otp = generarOTP();
    const expires = Date.now() + 5 * 60 * 1000;
    req.session.otpFirma = { idSolicitud, otp, expires };

    return res.json({ ok:true, idSolicitud, rut, otp }); // QA: mostramos OTP
  } catch (e) {
    console.error('firma.datos error:', e);
    return res.status(500).json({ ok:false, error:'Error interno' });
  }
};

exports.validar = async (req, res) => {
  const client = await pool.connect();
  try {
    const idSolicitud = Number(req.params.id);
    const rutSesion = req.session?.user?.rut;
    if (!rutSesion) return res.status(401).json({ ok:false, error:'No autenticado' });

    const { rut, otp } = req.body || {};
    if (!rut || !otp) return res.status(400).json({ ok:false, error:'RUT y OTP son requeridos' });
    if (rut !== rutSesion) return res.status(401).json({ ok:false, error:'RUT no coincide con la sesión' });

    const reg = req.session.otpFirma;
    if (!reg || reg.idSolicitud !== idSolicitud) {
      return res.status(400).json({ ok:false, error:'OTP no generado o inválido' });
    }
    if (Date.now() > reg.expires) return res.status(400).json({ ok:false, error:'OTP expirado' });
    if (reg.otp !== otp) return res.status(400).json({ ok:false, error:'OTP incorrecto' });

    // Carga de snapshot y validaciones básicas
    const sol = await Solicitud.getById(rutSesion, idSolicitud);
    if (!sol) return res.status(404).json({ ok:false, error:'Solicitud no encontrada' });
    if (!sol.documentos) return res.status(400).json({ ok:false, error:'Snapshot vacío' });

    let snap = {};
    try { snap = JSON.parse(sol.documentos); } catch {}
    const monto  = Number(snap.monto);
    const cuotas = Number(snap.cuotas);
    const tasa   = Number(snap.tasaSimulada);
    if (!isFinite(monto) || monto <= 0 || !isFinite(cuotas) || cuotas <= 0 || !isFinite(tasa) || tasa < 0) {
      return res.status(400).json({ ok:false, error:'Snapshot incompleto para otorgar préstamo' });
    }

    // Debe existir evaluación
    const evals = await Evaluacion.getAllBySolicitud({ idSolicitud, clienteRut: rutSesion });
    if (!evals || evals.length === 0) {
      return res.status(400).json({ ok:false, error:'Sin evaluación registrada para esta solicitud' });
    }

    await client.query('BEGIN');

    // PASO CLAVE: cambiar estado atómicamente. Solo uno podrá hacerlo.
    const updSol = await client.query(
      `UPDATE solicitud
          SET estado = 'otorgada'
        WHERE idSolicitud = $1 AND clienteRut = $2 AND estado = 'aceptada'
        RETURNING idSolicitud`,
      [idSolicitud, rutSesion]
    );
    if (updSol.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ ok:false, error:'La solicitud ya fue procesada' });
    }

    // Crear préstamo usando TU OBJETO con el mismo client (transacción)
    const p = new Prestamo({
      idPrestamo: null,
      idSolicitud,
      clienteRut: rutSesion,
      monto,
      tasa,
      plazo: cuotas,
      estado: true // BOOLEAN
    });
    await p.save(client);

    // Depositar al cliente usando TU OBJETO, dentro de la misma transacción
    const cliente = await Cliente.getCliente(rutSesion);
    if (!cliente) {
      await client.query('ROLLBACK');
      return res.status(404).json({ ok:false, error:'Cliente no encontrado' });
    }
    await cliente.depositar(monto, client);

    await client.query('COMMIT');
    req.session.otpFirma = null; // invalidar OTP

    return res.json({
      ok: true,
      idPrestamo: p.idPrestamo,
      monto,
      tasa,
      cuotas,
      saldo: cliente.saldo
    });
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('firma.validar error:', e?.message || e);
    return res.status(500).json({ ok:false, error:'No se pudo otorgar el préstamo' });
  } finally {
    client.release();
  }
};
