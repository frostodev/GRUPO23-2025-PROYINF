const pool = require('./db');

class Simulacion {
  constructor({
    id_simulacion = null,
    clienteRut, 
    fecha_creacion,
    monto,
    renta,
    cuotas,
    tasa_anual,
    valor_cuota,
    estado = 'activa'
  }) {
    this._id_simulacion = id_simulacion;
  // Asegurarse de usar el parámetro pasado; eliminar referencia a variable inexistente
    this._clienteRut = clienteRut;
    this._fecha_creacion = fecha_creacion;
    this._monto = monto;
    this._renta = renta;
    this._cuotas = cuotas;
    this._tasa_anual = tasa_anual;
    this._valor_cuota = valor_cuota;
    this._estado = estado;
  }


  get idSimulacion() { return this._id_simulacion; }
  get clienteRut() { return this._clienteRut; }
  get monto() { return this._monto; }
  get estado() { return this._estado; }

  async save() {
    

    const fechaActual = new Date().toISOString().slice(0, 10); 
    
    const sql = `
      INSERT INTO simulaciones (
        clienteRut, fecha_creacion, monto, renta, cuotas, tasa_anual, valor_cuota, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_simulacion
    `;

    const vals = [
      this._clienteRut, fechaActual, this._monto, this._renta,
      this._cuotas, this._tasa_anual, this._valor_cuota, this._estado
    ];
    
    // Verificación para evitar el error de NULL
    if (!this._clienteRut) {
      throw new Error('Error interno: clienteRut no puede ser nulo al guardar la simulación.');
    }
    
    const { rows: [row] } = await pool.query(sql, vals);
    this._id_simulacion = row.id_simulacion;
    this._fecha_creacion = fechaActual;
    return this;
  }
  
  // Método para actualizar el estado
  async updateState(nuevoEstado) {
    this._estado = nuevoEstado;
    const sql = `
      UPDATE simulaciones SET estado = $1 
      WHERE id_simulacion = $2 AND clienteRut = $3
    `;
    // CORRECCIÓN 1: Usamos 'clienteRut'
    await pool.query(sql, [nuevoEstado, this._id_simulacion, this._clienteRut]);
    return this;
  }

  // --- Métodos Estáticos (para leer) ---

  // Obtener UNA simulación por su ID
  static async getById(idSimulacion, clienteRut) {
    const { rows: [r] } = await pool.query(
      `SELECT * FROM simulaciones 
       WHERE id_simulacion = $1 AND clienteRut = $2`, 
      [idSimulacion, clienteRut]
    );
    
    // Al leer, PostgreSQL devuelve 'clienterut' (minúsculas)
    return r ? new Simulacion({
        id_simulacion: r.id_simulacion,
        clienteRut: r.clienterut, 
        fecha_creacion: r.fecha_creacion,
        monto: r.monto,
        renta: r.renta,
        cuotas: r.cuotas,
        tasa_anual: r.tasa_anual,
        valor_cuota: r.valor_cuota,
        estado: r.estado
    }) : null;
  }

  // Obtener TODAS las simulaciones 'activas' de un cliente
  static async getAllByCliente(clienteRut) {
    const { rows } = await pool.query(
      `SELECT * FROM simulaciones 
       WHERE clienteRut = $1 AND estado = 'activa' 
       ORDER BY fecha_creacion DESC`, 
      [clienteRut]
    );
    
    return rows.map(r => new Simulacion({
        id_simulacion: r.id_simulacion,
        clienteRut: r.clienterut, 
        fecha_creacion: r.fecha_creacion,
        monto: r.monto,
        renta: r.renta,
        cuotas: r.cuotas,
        tasa_anual: r.tasa_anual,
        valor_cuota: r.valor_cuota,
        estado: r.estado
    }));
  }
}

module.exports = Simulacion;