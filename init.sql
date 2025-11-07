-- 1. Tabla Clientes (Simplificada)
-- Se eliminan numero_cuenta y saldo_cuenta para evitar la dependencia transitiva.
-- (rut -> numero_cuenta -> saldo_cuenta)
CREATE TABLE clientes (
  rut VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  correo VARCHAR(200) NOT NULL,
  direccion VARCHAR(400) NOT NULL,
  telefono VARCHAR(200) NOT NULL,
  contrasena VARCHAR(200) NOT NULL
);

-- 2. NUEVA Tabla Cuentas
-- Se crea esta tabla para cumplir 3FN. El saldo depende de la cuenta,
-- y la cuenta se asocia al cliente.
CREATE SEQUENCE IF NOT EXISTS cuenta_num_seq START 1;

CREATE TABLE cuentas (
  numero_cuenta CHAR(16) PRIMARY KEY DEFAULT LPAD(nextval('cuenta_num_seq')::text, 16, '0'),
  clienteRut VARCHAR(20) NOT NULL,
  saldo_cuenta REAL DEFAULT 0,
  FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE,
  CONSTRAINT chk_numero_cuenta_digits CHECK (numero_cuenta ~ '^[0-9]{16}$')
);

-- 3. Tabla Solicitud (Corregida 2FN)
-- La PK es solo 'idSolicitud'. 'clienteRut' es solo una FK.
CREATE TABLE solicitud (
  idSolicitud SERIAL PRIMARY KEY,
  clienteRut VARCHAR(20) NOT NULL,
  fechaSolicitud DATE NOT NULL,
  documentos TEXT,
  estado VARCHAR(30) NOT NULL,
  FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE
);

-- 4. Tabla HistorialCrediticio (Estaba bien)
CREATE TABLE historialCrediticio (
  clienteRut VARCHAR(20) PRIMARY KEY,
  prestamos_historicos INT DEFAULT 0,
  prestamos_pagados_al_dia_historicos INT DEFAULT 0,
  prestamos_atrasados_historicos INT DEFAULT 0,
  prestamos_activos INT DEFAULT 0,
  maximos_dias_atraso_historico INT DEFAULT 0,
  deuda_actual REAL DEFAULT 0,
  FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE
);

-- 5. Tabla Evaluacion (Corregida 2FN y Redundancia)
-- La PK es solo 'idEvaluacion'.
-- Se elimina 'clienteRut' (redundante) porque se puede obtener a través de 'idSolicitud'.
CREATE TABLE evaluacion (
  idEvaluacion SERIAL PRIMARY KEY,
  idSolicitud INT NOT NULL,
  riesgo INT NOT NULL,
  FOREIGN KEY (idSolicitud) REFERENCES solicitud(idSolicitud) ON DELETE CASCADE
);

-- 6. Tabla Prestamo (Corregida 2FN y Redundancia)
-- La PK es solo 'idPrestamo'.
-- Se elimina 'clienteRut' (redundante) porque se puede obtener a través de 'idSolicitud'.
CREATE TABLE prestamo (
  idPrestamo SERIAL PRIMARY KEY,
  idSolicitud INT NOT NULL,
  monto INT NOT NULL,
  tasa REAL NOT NULL,
  plazo INT NOT NULL,
  estado BOOLEAN NOT NULL,
  FOREIGN KEY (idSolicitud) REFERENCES solicitud(idSolicitud) ON DELETE CASCADE
);

-- 7. Tabla Pago (Corregida 2FN y Mejora Lógica)
-- La PK es solo 'idPago'.
-- Se reemplaza 'clienteRut' por 'idPrestamo' para que el pago se asocie
-- lógicamente al préstamo que está pagando, no solo al cliente.
CREATE TABLE pago (
  idPago SERIAL PRIMARY KEY,
  idPrestamo INT NOT NULL,
  fechaPago DATE NOT NULL,
  dias_atraso INT DEFAULT 0,
  monto INT,
  montoAtraso REAL,
  FOREIGN KEY (idPrestamo) REFERENCES prestamo(idPrestamo) ON DELETE CASCADE
);

-- 8. Tabla Simulaciones (Corregida 3FN)
-- Se elimina la columna 'valor_cuota' porque es un dato calculado
-- (dependencia transitiva de monto, cuotas, tasa_anual).
CREATE TABLE simulaciones (
  id_simulacion SERIAL PRIMARY KEY,
  clienteRut VARCHAR(20) NOT NULL,
  fecha_creacion DATE NOT NULL,  
  monto INT NOT NULL,
  renta INT NOT NULL,
  cuotas INT NOT NULL,
  tasa_anual DECIMAL NOT NULL,
  estado VARCHAR(20) DEFAULT 'activa', 
  FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE
);


-- 9. Inserción de prueba (Corregida para el nuevo esquema)
-- Ahora se debe insertar en 'clientes' y 'cuentas' por separado.

-- a) Crear el cliente
INSERT INTO clientes (rut, nombre, correo, direccion, telefono, contrasena)
VALUES ('1', '1', '1@1.cl', '1', '1', '1');

-- b) Crear la cuenta para ese cliente (usando el DEFAULT para numero_cuenta)
INSERT INTO cuentas (clienteRut, saldo_cuenta)
VALUES ('1', 1);