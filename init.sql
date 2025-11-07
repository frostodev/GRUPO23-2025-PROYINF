
CREATE TABLE clientes (
	rut VARCHAR(20) PRIMARY KEY,
	nombre 	VARCHAR(200) NOT NULL,
	correo VARCHAR(200) NOT NULL,
	direccion VARCHAR(400) NOT NULL,
	telefono VARCHAR(200) NOT NULL,
	numero_cuenta INT NOT NULL,
	saldo_cuenta REAL DEFAULT 0,
	contrasena VARCHAR(200) NOT NULL

);

CREATE TABLE solicitud (
	idSolicitud SERIAL,
	clienteRut VARCHAR(20),
	fechaSolicitud DATE NOT NULL,
	documentos TEXT,
	estado VARCHAR(30) NOT NULL,
	PRIMARY KEY (idSolicitud, clienteRut),
	FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE

);

CREATE TABLE historialCrediticio (
	clienteRut VARCHAR(20) PRIMARY KEY,
	prestamos_historicos INT DEFAULT 0,
	prestamos_pagados_al_dia_historicos INT DEFAULT 0,
	prestamos_atrasados_historicos INT DEFAULT 0,
	prestamos_activos INT DEFAULT 0,
	maximos_dias_atraso_historico INT DEFAULT 0,
	deuda_actual REAL default 0,
	FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE

);

CREATE TABLE evaluacion (
    idEvaluacion SERIAL,
    idSolicitud INT NOT NULL,
    clienteRut VARCHAR(20) NOT NULL,
    riesgo INT NOT NULL,
    PRIMARY KEY (idEvaluacion, clienteRut, idSolicitud),
    FOREIGN KEY (idSolicitud, clienteRut)
        REFERENCES solicitud(idSolicitud, clienteRut) ON DELETE CASCADE
);


CREATE TABLE prestamo (
    idPrestamo SERIAL,
    idSolicitud INT NOT NULL,
    clienteRut VARCHAR(20) NOT NULL,
    monto INT NOT NULL,
    tasa REAL NOT NULL,
    plazo INT NOT NULL,
    estado BOOLEAN NOT NULL,
    PRIMARY KEY (idPrestamo, idSolicitud, clienteRut),
    FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE,
    FOREIGN KEY (idSolicitud, clienteRut) REFERENCES solicitud(idSolicitud, clienteRut) ON DELETE CASCADE
);


CREATE TABLE pago (
	idPago SERIAL,
	clienteRut VARCHAR(20),
	fechaPago DATE NOT NULL,
	dias_atraso INT DEFAULT 0,
	monto INT,
	montoAtraso REAL,
	PRIMARY KEY (idPago, clienteRut),
	FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE

);


CREATE TABLE simulaciones (
  id_simulacion SERIAL PRIMARY KEY,
	clienteRut VARCHAR(20) NOT NULL,
  fecha_creacion DATE NOT NULL,   
  monto INT NOT NULL,
  renta INT NOT NULL,
  cuotas INT NOT NULL,
  tasa_anual DECIMAL NOT NULL,
  valor_cuota DECIMAL NOT NULL,
  estado VARCHAR(20) DEFAULT 'activa', 
	FOREIGN KEY (clienteRut) REFERENCES clientes(rut) ON DELETE CASCADE
);


-- 1) Crea la secuencia si no existe
CREATE SEQUENCE IF NOT EXISTS cuenta_num_seq START 1;

-- 2) Cambia tipo de numero_cuenta a CHAR(16) y setea el DEFAULT correcto
ALTER TABLE clientes
  ALTER COLUMN numero_cuenta TYPE CHAR(16)
    USING LPAD(numero_cuenta::text, 16, '0'),
  ALTER COLUMN numero_cuenta SET DEFAULT LPAD(nextval('cuenta_num_seq')::text, 16, '0');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_numero_cuenta_digits'
  ) THEN
    ALTER TABLE clientes
      ADD CONSTRAINT chk_numero_cuenta_digits
      CHECK (numero_cuenta ~ '^[0-9]{16}$');
  END IF;
END$$;

-- Usuario(s) inicial(es)
-- Inserción corregida: dejar que el DEFAULT genere el número de cuenta (16 dígitos)
INSERT INTO clientes (rut, nombre, correo, direccion, telefono, numero_cuenta, saldo_cuenta, contrasena)
VALUES ('1', '1', '1@1.cl', '1', '1', DEFAULT, 1, '1');
