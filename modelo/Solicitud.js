const pool = require('./db');

class Solicitud {
  constructor({ idSolicitud = null, clienteRut, fechaSolicitud, documentos = null, estado }) {
    this._idSolicitud = idSolicitud;
    this._clienteRut = clienteRut;
    this._fechaSolicitud = fechaSolicitud; 
    this._documentos = documentos;
    this._estado = estado;
  }

  get idSolicitud() { return this._idSolicitud; }
  get clienteRut() { return this._clienteRut; }
  get fechaSolicitud() { return this._fechaSolicitud; }
  get documentos() { return this._documentos; }
  get estado() { return this._estado; }

  set clienteRut(v) { this._clienteRut = v; }
  set fechaSolicitud(v) { this._fechaSolicitud = v; }
  set documentos(v) { this._documentos = v; }
  set estado(v) { this._estado = v; }

  async save() {
    const sql = `
      INSERT INTO solicitud (clienteRut, fechaSolicitud, documentos, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING idSolicitud, clienteRut, fechaSolicitud, documentos, estado
    `;
    const vals = [this._clienteRut, this._fechaSolicitud, this._documentos, this._estado];
    const { rows: [row] } = await pool.query(sql, vals);
    this._idSolicitud = row.idsolicitud;
    return this;
  }

  async update() {
    if (this._idSolicitud == null) throw new Error('idSolicitud requerido para update');
    const sql = `
      UPDATE solicitud
      SET fechaSolicitud = $1, documentos = $2, estado = $3
      WHERE idSolicitud = $4 AND clienteRut = $5
      RETURNING idSolicitud
    `;
    const vals = [this._fechaSolicitud, this._documentos, this._estado, this._idSolicitud, this._clienteRut];
    await pool.query(sql, vals);
    return this;
  }

  async delete() {
    if (this._idSolicitud == null) throw new Error('idSolicitud requerido para delete');
    await pool.query(
      `DELETE FROM solicitud WHERE idSolicitud = $1 AND clienteRut = $2`,
      [this._idSolicitud, this._clienteRut]
    );
  }

  static async getById(clienteRut, idSolicitud) {
    const { rows: [row] } = await pool.query(
      `SELECT idSolicitud, clienteRut, fechaSolicitud, documentos, estado
       FROM solicitud WHERE clienteRut = $1 AND idSolicitud = $2`,
      [clienteRut, idSolicitud]
    );
    return row ? new Solicitud({
      idSolicitud: row.idsolicitud,
      clienteRut: row.clienterut,
      fechaSolicitud: row.fechasolicitud,
      documentos: row.documentos,
      estado: row.estado
    }) : null;
  }

  static async getAllByCliente(clienteRut) {
    const { rows } = await pool.query(
      `SELECT idSolicitud, clienteRut, fechaSolicitud, documentos, estado
       FROM solicitud WHERE clienteRut = $1 ORDER BY idSolicitud DESC`,
      [clienteRut]
    );
    return rows.map(r => new Solicitud({
      idSolicitud: r.idsolicitud,
      clienteRut: r.clienterut,
      fechaSolicitud: r.fechasolicitud,
      documentos: r.documentos,
      estado: r.estado
    }));
  }
}

module.exports = Solicitud;
