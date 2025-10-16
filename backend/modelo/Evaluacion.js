// Evaluacion.js
const pool = require('./db');

class Evaluacion {
  constructor({
    idEvaluacion = null,
    idSolicitud,
    clienteRut,
    riesgo
  }) {
    this._idEvaluacion = idEvaluacion;
    this._idSolicitud = idSolicitud;
    this._clienteRut = clienteRut;
    this._riesgo = riesgo;
  }

  // Getters / Setters
  get idEvaluacion() { return this._idEvaluacion; }
  get idSolicitud()   { return this._idSolicitud; }
  get clienteRut()    { return this._clienteRut; }
  get riesgo()        { return this._riesgo; }

  set idSolicitud(v)  { this._idSolicitud = v; }
  set clienteRut(v)   { this._clienteRut = v; }
  set riesgo(v)       { this._riesgo = v; }

  // Crea una evaluación ligada a (idSolicitud, clienteRut)
  async save() {
    const sql = `
      INSERT INTO evaluacion (idSolicitud, clienteRut, riesgo)
      VALUES ($1, $2, $3)
      RETURNING idEvaluacion, idSolicitud, clienteRut, riesgo
    `;
    const vals = [this._idSolicitud, this._clienteRut, this._riesgo];
    const { rows: [row] } = await pool.query(sql, vals);
    this._idEvaluacion = row.idevaluacion; // viene en minúsculas desde PG
    return this;
  }

  // Actualiza por PK compuesta
  async update() {
    if (this._idEvaluacion == null) throw new Error('idEvaluacion requerido para update');
    const sql = `
      UPDATE evaluacion
      SET riesgo = $1
      WHERE idEvaluacion = $2 AND clienteRut = $3 AND idSolicitud = $4
      RETURNING idEvaluacion
    `;
    const vals = [this._riesgo, this._idEvaluacion, this._clienteRut, this._idSolicitud];
    await pool.query(sql, vals);
    return this;
  }

  // Elimina por PK compuesta
  async delete() {
    if (this._idEvaluacion == null) throw new Error('idEvaluacion requerido para delete');
    await pool.query(
      `DELETE FROM evaluacion
       WHERE idEvaluacion = $1 AND clienteRut = $2 AND idSolicitud = $3`,
      [this._idEvaluacion, this._clienteRut, this._idSolicitud]
    );
  }

  // ---------- Estáticos (lectura) ----------

  // Por PK compuesta
  static async getById({ idEvaluacion, clienteRut, idSolicitud }) {
    const { rows: [r] } = await pool.query(
      `SELECT idEvaluacion, idSolicitud, clienteRut, riesgo
       FROM evaluacion
       WHERE idEvaluacion = $1 AND clienteRut = $2 AND idSolicitud = $3`,
      [idEvaluacion, clienteRut, idSolicitud]
    );
    return r ? new Evaluacion({
      idEvaluacion: r.idevaluacion,
      idSolicitud: r.idsolicitud,
      clienteRut: r.clienterut,
      riesgo: r.riesgo
    }) : null;
  }

  // Todas las evaluaciones de una solicitud específica
  static async getAllBySolicitud({ idSolicitud, clienteRut }) {
    const { rows } = await pool.query(
      `SELECT idEvaluacion, idSolicitud, clienteRut, riesgo
       FROM evaluacion
       WHERE idSolicitud = $1 AND clienteRut = $2
       ORDER BY idEvaluacion DESC`,
      [idSolicitud, clienteRut]
    );
    return rows.map(r => new Evaluacion({
      idEvaluacion: r.idevaluacion,
      idSolicitud: r.idsolicitud,
      clienteRut: r.clienterut,
      riesgo: r.riesgo
    }));
  }

  // Todas las evaluaciones de un cliente (todas sus solicitudes)
  static async getAllByCliente(clienteRut) {
    const { rows } = await pool.query(
      `SELECT idEvaluacion, idSolicitud, clienteRut, riesgo
       FROM evaluacion
       WHERE clienteRut = $1
       ORDER BY idSolicitud DESC, idEvaluacion DESC`,
      [clienteRut]
    );
    return rows.map(r => new Evaluacion({
      idEvaluacion: r.idevaluacion,
      idSolicitud: r.idsolicitud,
      clienteRut: r.clienterut,
      riesgo: r.riesgo
    }));
  }
}

module.exports = Evaluacion;
