const Solicitud = require('../modelo/Solicitud');

exports.listar = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ ok:false, error:'No autenticado' });

    const solicitudes = await Solicitud.getAllByCliente(user.rut);

    // Mapeo a objeto plano con las claves que espera el front
    const out = solicitudes.map(s => ({
      idSolicitud: s.idSolicitud,
      clienteRut: s.clienteRut,
      fechaSolicitud: s.fechaSolicitud instanceof Date
        ? s.fechaSolicitud.toISOString().slice(0,10)
        : s.fechaSolicitud,
      documentos: s.documentos,
      estado: s.estado
    }));

    return res.json({ ok:true, solicitudes: out });
  } catch (err) {
    console.error('Error en listar solicitudes:', err);
    return res.status(500).json({ ok:false, error:'Error interno' });
  }
};
