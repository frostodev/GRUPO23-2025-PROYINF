
const pool = require('./db');

class Pago {
    constructor({
        idPago = null,
        clienteRut,
        fechaPago, // el formato es ==='YYYY-MM-DD' si no funciona mira aca jsjsjs   
        dias_atraso = 0,
        monto = null,
        montoAtraso = null
    }) {
        this._idPago = idPago;
        this._clienteRut = clienteRut;
        this._fechaPago = fechaPago;
        this._dias_atraso = dias_atraso;
        this._monto = monto;
        this._montoAtraso = montoAtraso;
    }

    // Getters / Setters
    get idPago() { return this._idPago; }
    get clienteRut() { return this._clienteRut; }
    get fechaPago() { return this._fechaPago; }
    get dias_atraso() { return this._dias_atraso; }
    get monto() { return this._monto; }
    get montoAtraso() { return this._montoAtraso; }

    set clienteRut(v) { this._clienteRut = v; }
    set fechaPago(v) { this._fechaPago = v; }
    set dias_atraso(v) { this._dias_atraso = v; }
    set monto(v) { this._monto = v; }
    set montoAtraso(v) { this._montoAtraso = v; }

    async save() {
        const sql = `
        INSERT INTO pago (clienteRut, fechaPago, dias_atraso, monto, montoAtraso)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING idPago, clienteRut, fechaPago, dias_atraso, monto, montoAtraso
        `;
        const vals = [this._clienteRut, this._fechaPago, this._dias_atraso, this._monto, this._montoAtraso];
        const { rows: [row] } = await pool.query(sql, vals);
        this._idPago = row.idpago;
        return this;
    }

    async update() {
        if (this._idPago == null) throw new Error('idPago requerido para update');
        const sql = `
        UPDATE pago
        SET fechaPago = $1, dias_atraso = $2, monto = $3, montoAtraso = $4
        WHERE idPago = $5 AND clienteRut = $6
        RETURNING idPago
        `;
        const vals = [this._fechaPago, this._dias_atraso, this._monto, this._montoAtraso, this._idPago, this._clienteRut];
        await pool.query(sql, vals);
        return this;
    }

    async delete() {
        if (this._idPago == null) throw new Error('idPago requerido para delete');
        await pool.query(
        `DELETE FROM pago WHERE idPago = $1 AND clienteRut = $2`,
        [this._idPago, this._clienteRut]
        );
    }

    // Static
    static async getById(clienteRut, idPago) {
        const { rows: [row] } = await pool.query(
        `SELECT idPago, clienteRut, fechaPago, dias_atraso, monto, montoAtraso
        FROM pago WHERE clienteRut = $1 AND idPago = $2`,
        [clienteRut, idPago]
        );
        return row ? new Pago({
        idPago: row.idpago,
        clienteRut: row.clienterut,
        fechaPago: row.fechapago,
        dias_atraso: row.dias_atraso,
        monto: row.monto,
        montoAtraso: row.montoatraso
        }) : null;
    }

    static async getAllByCliente(clienteRut) {
        const { rows } = await pool.query(
        `SELECT idPago, clienteRut, fechaPago, dias_atraso, monto, montoAtraso
        FROM pago WHERE clienteRut = $1 ORDER BY idPago DESC`,
        [clienteRut]
        );
        return rows.map(r => new Pago({
        idPago: r.idpago,
        clienteRut: r.clienterut,
        fechaPago: r.fechapago,
        dias_atraso: r.dias_atraso,
        monto: r.monto,
        montoAtraso: r.montoatraso
        }));
    }
}

module.exports = Pago;
