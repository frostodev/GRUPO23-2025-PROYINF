// Evaluacion.js
const pool = require('./db');

class Evaluacion {
    constructor({ idEvaluacion = null, clienteRut, sueldo, riesgo }) {
        this._idEvaluacion = idEvaluacion;
        this._clienteRut = clienteRut;
        this._sueldo = sueldo;
        this._riesgo = riesgo;
    }

  // Getters / Setters
    get idEvaluacion() { return this._idEvaluacion; }
    get clienteRut() { return this._clienteRut; }
    get sueldo() { return this._sueldo; }
    get riesgo() { return this._riesgo; }

    set clienteRut(v) { this._clienteRut = v; }
    set sueldo(v) { this._sueldo = v; }
    set riesgo(v) { this._riesgo = v; }

    async save() {
        const sql = `
        INSERT INTO evaluacion (clienteRut, sueldo, riesgo)
        VALUES ($1, $2, $3)
        RETURNING idEvaluacion, clienteRut, sueldo, riesgo
        `;
        const vals = [this._clienteRut, this._sueldo, this._riesgo];
        const { rows: [row] } = await pool.query(sql, vals);
        this._idEvaluacion = row.idevaluacion;
        return this;
    }

    async update() {
        if (this._idEvaluacion == null) throw new Error('idEvaluacion requerido para update');
        const sql = `
        UPDATE evaluacion
        SET sueldo = $1, riesgo = $2
        WHERE idEvaluacion = $3 AND clienteRut = $4
        RETURNING idEvaluacion
        `;
        const vals = [this._sueldo, this._riesgo, this._idEvaluacion, this._clienteRut];
        await pool.query(sql, vals);
        return this;
    }

    async delete() {
        if (this._idEvaluacion == null) throw new Error('idEvaluacion requerido para delete');
        await pool.query(
        `DELETE FROM evaluacion WHERE idEvaluacion = $1 AND clienteRut = $2`,
        [this._idEvaluacion, this._clienteRut]
        );
    }

    // Static
    static async getById(clienteRut, idEvaluacion) {
        const { rows: [row] } = await pool.query(
        `SELECT idEvaluacion, clienteRut, sueldo, riesgo
        FROM evaluacion WHERE clienteRut = $1 AND idEvaluacion = $2`,
        [clienteRut, idEvaluacion]
        );
        return row ? new Evaluacion({
        idEvaluacion: row.idevaluacion,
        clienteRut: row.clienterut,
        sueldo: row.sueldo,
        riesgo: row.riesgo
        }) : null;
    }

    static async getAllByCliente(clienteRut) {
        const { rows } = await pool.query(
        `SELECT idEvaluacion, clienteRut, sueldo, riesgo
        FROM evaluacion WHERE clienteRut = $1 ORDER BY idEvaluacion DESC`,
        [clienteRut]
        );
        return rows.map(r => new Evaluacion({
        idEvaluacion: r.idevaluacion,
        clienteRut: r.clienterut,
        sueldo: r.sueldo,
        riesgo: r.riesgo
        }));
    }
}

module.exports = Evaluacion;
