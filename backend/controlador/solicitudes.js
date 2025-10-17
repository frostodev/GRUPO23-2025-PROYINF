// backend/controlador/solicitudes.js
const Solicitud = require('../modelo/Solicitud');

// --- helpers ---
function cuotaConTasa(monto, cuotas, tasaAnual) {
  const i = (tasaAnual / 100) / 12;
  if (i === 0) return monto / cuotas;
  return monto * i / (1 - Math.pow(1 + i, -cuotas));
}

function calcularTasaOfrecida({ monto, renta, cuotas }) {
  const tasaBase = 18;
  const cuotaPre = cuotaConTasa(monto, cuotas, tasaBase);
  const carga = renta > 0 ? (cuotaPre / renta) : 1e9;

  let tasa = 0;
  if (carga <= 0.25) tasa = 14;
  else if (carga <= 0.35) tasa = 18;
  else if (carga <= 0.45) tasa = 24;
  else tasa = 32;

  if (cuotas > 36 && cuotas <= 48) tasa += 2;
  else if (cuotas > 48) tasa += 4;

  if (monto >= 5_000_000) tasa -= 1;
  if (monto < 500_000) tasa += 1.5;

  if (tasa < 8) tasa = 8;
  if (tasa > 39) tasa = 39;

  const cuota = cuotaConTasa(monto, cuotas, tasa);
  const total = cuota * cuotas;
  const intereses = total - monto;
  const cargaFinal = renta > 0 ? (cuota / renta) * 100 : 100;

  return { tasaAnual: Number(tasa.toFixed(2)), cuota, total, intereses, carga: cargaFinal };
}

// --- endpoints ---
exports.cotizar = (req, res) => {
  const user = req.session?.user;
  if (!user) return res.status(401).json({ ok:false, error:'No autenticado' });

  const { monto, renta, cuotas } = req.body || {};
  const M = Number(monto), R = Number(renta), N = Number(cuotas);
  if (!isFinite(M) || M<=0 || !isFinite(R) || R<=0 || !isFinite(N) || N<=0) {
    return res.status(400).json({ ok:false, error:'Parámetros inválidos' });
  }

  const r = calcularTasaOfrecida({ monto:M, renta:R, cuotas:N });
  return res.json({ ok:true, ...r });
};

exports.crearDesdeSimulacion = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ ok:false, error:'No autenticado' });

    const { monto, renta, cuotas, tasaAnual, cuotaEstimada } = req.body || {};
    const M = Number(monto), R = Number(renta), N = Number(cuotas), T = Number(tasaAnual);
    if (!isFinite(M) || M<=0 || !isFinite(R) || R<=0 || !isFinite(N) || N<=0 || !isFinite(T)) {
      return res.status(400).json({ ok:false, error:'Parámetros inválidos' });
    }

    const snapshot = { monto:M, renta:R, cuotas:N, tasa:T, cuotaEstimada: Math.round(Number(cuotaEstimada||0)) };
    const fechaSolicitud = new Date().toISOString().slice(0,10);

    const sol = await new Solicitud({
      clienteRut: user.rut,
      fechaSolicitud,
      documentos: JSON.stringify(snapshot),
      estado: 'pendiente'
    }).save();

    return res.status(201).json({ ok:true, idSolicitud: sol.idSolicitud, estado: sol.estado });
  } catch (e) {
    console.error('POST /solicitudes/crear error:', e);
    return res.status(500).json({ ok:false, error: e.message || 'Error interno' });
  }
};
