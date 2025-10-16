const pool = require('./db');

class HistorialCrediticio {
    constructor({
        clienteRut,
        prestamos_historicos = 0,
        prestamos_pagados_al_dia_historicos = 0,
        prestamos_atrasados_historicos = 0,
        prestamos_activos = 0,
        maximos_dias_atraso_historico = 0,
        deuda_actual = 0
    }) {
        this._clienteRut = clienteRut;
        this._prestamos_historicos = prestamos_historicos;
        this._prestamos_pagados_al_dia_historicos = prestamos_pagados_al_dia_historicos;
        this._prestamos_atrasados_historicos = prestamos_atrasados_historicos;
        this._prestamos_activos = prestamos_activos;
        this._maximos_dias_atraso_historico = maximos_dias_atraso_historico;
        this._deuda_actual = deuda_actual;
    }

    get clienteRut() { return this._clienteRut; }
    get prestamos_historicos() { return this._prestamos_historicos; }
    get prestamos_pagados_al_dia_historicos() { return this._prestamos_pagados_al_dia_historicos; }
    get prestamos_atrasados_historicos() { return this._prestamos_atrasados_historicos; }
    get prestamos_activos() { return this._prestamos_activos; }
    get maximos_dias_atraso_historico() { return this._maximos_dias_atraso_historico; }
    get deuda_actual() { return this._deuda_actual; }

    set prestamos_historicos(v) { this._prestamos_historicos = v; }
    set prestamos_pagados_al_dia_historicos(v) { this._prestamos_pagados_al_dia_historicos = v; }
    set prestamos_atrasados_historicos(v) { this._prestamos_atrasados_historicos = v; }
    set prestamos_activos(v) { this._prestamos_activos = v; }
    set maximos_dias_atraso_historico(v) { this._maximos_dias_atraso_historico = v; }
    set deuda_actual(v) { this._deuda_actual = v; }

    async save() {
        const sql = `
        INSERT INTO historialCrediticio (
            clienteRut, prestamos_historicos, prestamos_pagados_al_dia_historicos,
            prestamos_atrasados_historicos, prestamos_activos,
            maximos_dias_atraso_historico, deuda_actual
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING clienteRut
        `;
        const vals = [
        this._clienteRut, this._prestamos_historicos, this._prestamos_pagados_al_dia_historicos,
        this._prestamos_atrasados_historicos, this._prestamos_activos,
        this._maximos_dias_atraso_historico, this._deuda_actual
        ];
        await pool.query(sql, vals);
        return this;
    }

    async update() {
        const sql = `
        UPDATE historialCrediticio
        SET prestamos_historicos = $1,
            prestamos_pagados_al_dia_historicos = $2,
            prestamos_atrasados_historicos = $3,
            prestamos_activos = $4,
            maximos_dias_atraso_historico = $5,
            deuda_actual = $6
        WHERE clienteRut = $7
        RETURNING clienteRut
        `;
        const vals = [
        this._prestamos_historicos, this._prestamos_pagados_al_dia_historicos,
        this._prestamos_atrasados_historicos, this._prestamos_activos,
        this._maximos_dias_atraso_historico, this._deuda_actual,
        this._clienteRut
        ];
        await pool.query(sql, vals);
        return this;
    }

    async delete() {
        await pool.query(
        `DELETE FROM historialCrediticio WHERE clienteRut = $1`,
        [this._clienteRut]
        );
    }

    static async getByCliente(clienteRut) {
        const { rows: [r] } = await pool.query(
        `SELECT * FROM historialCrediticio WHERE clienteRut = $1`,
        [clienteRut]
        );
        return r ? new HistorialCrediticio({
        clienteRut: r.clienterut,
        prestamos_historicos: r.prestamos_historicos,
        prestamos_pagados_al_dia_historicos: r.prestamos_pagados_al_dia_historicos,
        prestamos_atrasados_historicos: r.prestamos_atrasados_historicos,
        prestamos_activos: r.prestamos_activos,
        maximos_dias_atraso_historico: r.maximos_dias_atraso_historico,
        deuda_actual: r.deuda_actual
        }) : null;
    }
}

module.exports = HistorialCrediticio;
