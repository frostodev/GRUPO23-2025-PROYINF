const pool = require('./db');

class Cliente {
    constructor(rut, nombre, correo, direccion, telefono, contrasena) {
        this.rut = rut;
        this.nombre = nombre;
        this.correo = correo;
        this.direccion = direccion;
        this.telefono = telefono;
        this.contrasena = contrasena;
        this.numero_cuenta = null;
        this.saldo = 0;
    }

    async save() {
    const sql = `
      INSERT INTO clientes (rut, nombre, correo, direccion, telefono, contrasena)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING rut, nombre, correo, direccion, telefono, numero_cuenta, saldo_cuenta
    `;
    const vals = [
      this.rut, this.nombre, this.correo,
      this.direccion, this.telefono, this.contrasena
    ];
    const { rows: [row] } = await pool.query(sql, vals);
    // completar campos que genera la DB
    this.numero_cuenta = row.numero_cuenta;
    this.saldo_cuenta = row.saldo_cuenta;
    return this;
  }

    static async getByRut(rut) {
    const sql = `
        SELECT rut, nombre, correo, direccion, telefono, numero_cuenta, saldo_cuenta
        FROM clientes
        WHERE rut = $1
        `;
    const { rows: [row] } = await pool.query(sql, [rut]);
    return row || null;
    }

    static async getForLogin(rut) {
    const sql = `
    SELECT rut, contrasena
    FROM clientes
    WHERE rut = $1
  `;
    const { rows: [row] } = await pool.query(sql, [rut]);
    return row || null;
}


}

module.exports = Cliente;