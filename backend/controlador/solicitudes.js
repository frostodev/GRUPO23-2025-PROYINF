const Solicitud = require('../modelo/Solicitud');
const Simulacion = require('../modelo/Simulacion');

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


exports.guardarSimulacion = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ ok:false, error:'No autenticado' });

    const { monto, renta, cuotas, tasaAnual, cuota } = req.body;

    const sim = new Simulacion({
        cliente_rut: user.rut,
        monto: Number(monto),
        renta: Number(renta),
        cuotas: Number(cuotas),
        tasa_anual: Number(tasaAnual),
        valor_cuota: Number(cuota),
        fecha_creacion: new Date() 
    });

    await sim.save();
    return res.status(201).json({ ok: true, idSimulacion: sim.idSimulacion });

  } catch (e) {
    console.error('POST /simulaciones/guardar error:', e);
    return res.status(500).json({ ok:false, error: e.message || 'Error interno' });
  }
};

exports.obtenerSimulacionesGuardadas = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ ok:false, error:'No autenticado' });

   
    const simulaciones = await Simulacion.getAllByCliente(user.rut);
    return res.json({ ok: true, simulaciones });

  } catch (e) {
    console.error('GET /simulaciones/guardadas error:', e);
    return res.status(500).json({ ok:false, error: e.message || 'Error interno' });
  }
};


// 4. CREAR SOLICITUD (Modificada)
exports.crearDesdeSimulacion = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ ok:false, error:'No autenticado' });

    // Ahora recibimos el ID de la simulación
    const { idSimulacion } = req.body;
    if (!idSimulacion) {
      return res.status(400).json({ ok:false, error:'idSimulacion requerido' });
    }

    // Buscamos la simulación
    const simElegida = await Simulacion.getById(idSimulacion, user.rut);

    if (!simElegida || simElegida.estado !== 'activa') {
      return res.status(404).json({ ok:false, error:'Simulación no encontrada o ya utilizada' });
    }

    // Creamos el 'snapshot'
    const snapshot = {
        idSimulacion: simElegida.idSimulacion,
        monto: simElegida.monto,
        renta: simElegida.renta,
        cuotas: simElegida.cuotas,
        tasa: simElegida.tasaAnual,
        cuotaEstimada: Math.round(simElegida.valorCuota)
    };
    const fechaSolicitud = new Date().toISOString().slice(0,10);

    // Creamos la Solicitud formal
    const sol = await new Solicitud({
      clienteRut: user.rut,
      fechaSolicitud,
      documentos: JSON.stringify(snapshot),
      estado: 'pendiente'
    }).save();

    // Actualizamos la simulación a 'solicitada'
    await simElegida.updateState('solicitada');

    return res.status(201).json({ ok:true, idSolicitud: sol.idSolicitud, estado: sol.estado });
  } catch (e) {
    console.error('POST /solicitudes/crear error:', e);
    return res.status(500).json({ ok:false, error: e.message || 'Error interno' });
  }
};