const pool = require('./db');

class Prestamo {
    constructor({
        idPrestamo = null,
        idSolicitud,
        clienteRut,
        monto,
        tasa,
        plazo,
        estado
    }) {
        this._idPrestamo = idPrestamo;
        this._idSolicitud = idSolicitud;
        this._clienteRut = clienteRut;
        this._monto = monto;
        this._tasa = tasa;
        this._plazo = plazo;
        this._estado = estado;
    }

    get idPrestamo() { return this._idPrestamo; }
    get idSolicitud() { return this._idSolicitud; }
    get clienteRut() { return this._clienteRut; }
    get monto() { return this._monto; }
    get tasa() { return this._tasa; }
    get plazo() { return this._plazo; }
    get estado() { return this._estado; }

    set idSolicitud(v) { this._idSolicitud = v; }
    set clienteRut(v) { this._clienteRut = v; }
    set monto(v) { this._monto = v; }
    set tasa(v) { this._tasa = v; }
    set plazo(v) { this._plazo = v; }
    set estado(v) { this._estado = v; }

    async save() {
        const sql = `
        INSERT INTO prestamo (idSolicitud, clienteRut, monto, tasa, plazo, estado)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING idPrestamo, idSolicitud, clienteRut, monto, tasa, plazo, estado
        `;
        const vals = [this._idSolicitud, this._clienteRut, this._monto, this._tasa, this._plazo, this._estado];
        const { rows: [row] } = await pool.query(sql, vals);
        this._idPrestamo = row.idprestamo;
        return this;
    }

    async update() {
        if (this._idPrestamo == null) throw new Error('idPrestamo requerido para update');
        const sql = `
        UPDATE prestamo
        SET monto = $1, tasa = $2, plazo = $3, estado = $4
        WHERE idPrestamo = $5 AND idSolicitud = $6 AND clienteRut = $7
        RETURNING idPrestamo
        `;
        const vals = [this._monto, this._tasa, this._plazo, this._estado, this._idPrestamo, this._idSolicitud, this._clienteRut];
        await pool.query(sql, vals);
        return this;
    }

    async delete() {
        if (this._idPrestamo == null) throw new Error('idPrestamo requerido para delete');
        await pool.query(
        `DELETE FROM prestamo
        WHERE idPrestamo = $1 AND idSolicitud = $2 AND clienteRut = $3`,
        [this._idPrestamo, this._idSolicitud, this._clienteRut]
        );
    }

    static async getById(clienteRut, idSolicitud, idPrestamo) {
        const { rows: [row] } = await pool.query(
        `SELECT idPrestamo, idSolicitud, clienteRut, monto, tasa, plazo, estado
        FROM prestamo
        WHERE clienteRut = $1 AND idSolicitud = $2 AND idPrestamo = $3`,
        [clienteRut, idSolicitud, idPrestamo]
        );
        return row ? new Prestamo({
        idPrestamo: row.idprestamo,
        idSolicitud: row.idsolicitud,
        clienteRut: row.clienterut,
        monto: row.monto,
        tasa: row.tasa,
        plazo: row.plazo,
        estado: row.estado
        }) : null;
    }

    static async getAllByCliente(clienteRut) {
        const { rows } = await pool.query(
        `SELECT idPrestamo, idSolicitud, clienteRut, monto, tasa, plazo, estado
        FROM prestamo WHERE clienteRut = $1
        ORDER BY idPrestamo DESC`,
        [clienteRut]
        );
        return rows.map(r => new Prestamo({
        idPrestamo: r.idprestamo,
        idSolicitud: r.idsolicitud,
        clienteRut: r.clienterut,
        monto: r.monto,
        tasa: r.tasa,
        plazo: r.plazo,
        estado: r.estado
        }));
    }
}

module.exports = Prestamo;
