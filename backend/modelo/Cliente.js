// Cliente.js
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
    const vals = [this.rut, this.nombre, this.correo, this.direccion, this.telefono, this.contrasena];
    const { rows: [row] } = await pool.query(sql, vals);
    this.numero_cuenta = row.numero_cuenta;
    this.saldo_cuenta = row.saldo_cuenta;
    return this;
  }

  async depositar(monto, client = null) {
  if (!isFinite(monto) || monto <= 0) {
    throw new Error("Monto inválido para deposito");
  }
  const q = client || pool;

  // Actualiza en BD y sincroniza el objeto en memoria
  const { rows: [row] } = await q.query(
    `UPDATE clientes
       SET saldo_cuenta = COALESCE(saldo_cuenta, 0) + $1
     WHERE rut = $2
     RETURNING saldo_cuenta`,
    [monto, this.rut]
  );

  this.saldo = row.saldo_cuenta;
  return this;
}


  static async getByRut(rut) {
    const { rows: [row] } = await pool.query(
      `SELECT rut, nombre, correo, direccion, telefono, numero_cuenta, saldo_cuenta
       FROM clientes WHERE rut = $1`, [rut]
    );
    return row || null;
  }

  static async getForLogin(rut) {
    const { rows: [row] } = await pool.query(
      `SELECT rut, contrasena FROM clientes WHERE rut = $1`, [rut]
    );
    return row || null;
  }

  //  Nuevo: autenticar (retorna datos públicos si OK, null si falla)
  static async authenticate(rut, contrasena) {
    const { rows: [row] } = await pool.query(
      `SELECT rut, nombre, correo, numero_cuenta, saldo_cuenta, contrasena
       FROM clientes WHERE rut = $1`,
      [rut]
    );
    if (!row) return null;
    // Hoy comparación simple. En producción: bcrypt.compare(contrasena, row.contrasenaHash)
    if (row.contrasena !== contrasena) return null;

    // Nunca retornes la contraseña
    return {
      rut: row.rut,
      nombre: row.nombre,
      correo: row.correo,
      numero_cuenta: row.numero_cuenta,
      saldo_cuenta: row.saldo_cuenta
    };
  }
  static async getCliente(rut) {
  const { rows: [row] } = await pool.query(
    `SELECT rut, nombre, correo, direccion, telefono, numero_cuenta, saldo_cuenta
     FROM clientes WHERE rut = $1`, [rut]
  );
  if (!row) return null;

  const c = new Cliente(
    row.rut,
    row.nombre,
    row.correo,
    row.direccion,
    row.telefono,
    null
  );
  c.numero_cuenta = row.numero_cuenta;
  c.saldo = row.saldo_cuenta;
  return c;
}
}



module.exports = Cliente;
