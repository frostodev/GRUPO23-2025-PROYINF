# Documentación rápida de las APIs

Este documento lista las rutas HTTP (endpoints) expuestas por el backend del proyecto, el método, los parámetros esperados, requisitos de autenticación y ejemplos de uso (curl). También indico qué archivo controla cada endpoint y qué modelos de datos usa.

BASE: http://<HOST>:3000 (en dev con Docker suele ser http://localhost:3000 o http://192.168.1.88:3000)

IMPORTANTE: la app usa sesiones basadas en cookies (express-session). Para llamadas autenticadas desde curl usa `-c cookies.txt -b cookies.txt` o en fetch del navegador incluye `credentials: 'include'`.

---

## Endpoints

### GET /api/me
- Propósito: obtener información del usuario de la sesión actual.
- Auth: requiere sesión (cookie).
- Controlador: definido inline en `index.js`.
- Respuesta (200):
```json
{ "ok": true, "user": { "rut": "...", "nombre": "...", "correo": "...", "numero_cuenta": "..." } }
```
- Ejemplo curl (después de login):
```bash
curl -s -c cookies.txt -b cookies.txt http://localhost:3000/api/me
```

---

### GET /api/ping
- Propósito: health-check / diagnóstico simple.
- Auth: no.
- Respuesta (200):
```json
{ "ok": true, "now": 1670000000000 }
```

---

### GET /api/ping-session
- Propósito: test de sesión (incrementa un contador en la sesión).
- Auth: si la cookie de sesión está presente retorna contador.
- Respuesta (200):
```json
{ "ok": true, "counter": 1 }
```

---

### POST /api/login
- Propósito: autenticar y crear sesión.
- Auth: no.
- Body (JSON):
```json
{ "rut": "11111111-1", "contrasena": "1234" }
```
- Controlador: `backend/controlador/autentificacion.js` (usa `backend/modelo/Cliente.js`).
- Respuesta (200):
```json
{ "ok": true }
```
- Errores: 400 (faltan campos), 401 (credenciales inválidas), 500 (error interno)
- Ejemplo curl:
```bash
curl -v -c cookies.txt -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"rut":"1","contrasena":"1"}'
```

---

### POST /api/registrar
- Propósito: crear un nuevo cliente.
- Auth: no.
- Body (JSON):
```json
{ "rut":"...", "nombre":"...", "correo":"...", "direccion":"...", "telefono":"...", "contrasena":"..." }
```
- Controlador: `backend/controlador/registrar.js` (usa `backend/modelo/Cliente.js`).
- Respuesta (201):
```json
{ "ok": true, "mensaje": "Cliente registrado", "cliente": {"rut":"...","nombre":"...","numero_cuenta":"...","saldo_cuenta":0} }
```
- Errores: 400 (faltan campos), 409 (RUT ya registrado), 500 (error interno)
- Ejemplo curl:
```bash
curl -v -X POST http://localhost:3000/api/registrar \
  -H 'Content-Type: application/json' \
  -d '{"rut":"1","nombre":"1","correo":"1@1.cl","direccion":"1","telefono":"1","contrasena":"1"}'
```

---

### GET /api/logout
- Propósito: destruir la sesión.
- Auth: sí (borra la cookie del servidor).
- Controlador: `backend/controlador/autentificacion.js`.
- Ejemplo curl:
```bash
curl -v -b cookies.txt -c cookies.txt http://localhost:3000/api/logout
```

---

### POST /api/solicitudes/cotizar
- Propósito: calcular oferta (tasa, cuota, total, intereses) según monto/renta/cuotas.
- Auth: requiere sesión.
- Body (JSON):
```json
{ "monto": 5000000, "renta": 1000000, "cuotas": 24 }
```
- Controlador: `backend/controlador/solicitudes.js` (función `cotizar`).
- Respuesta (200): ejemplo
```json
{ "ok": true, "tasaAnual": 18.00, "cuota": 12345.67, "total": 12345.67*24, "intereses": ..., "carga": 12.3 }
```
- Ejemplo curl:
```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/solicitudes/cotizar \
  -H 'Content-Type: application/json' \
  -d '{"monto":5000000,"renta":1000000,"cuotas":24}'
```

---

### POST /api/simulaciones/guardar
- Propósito: guardar una simulación en la BD para el cliente autenticado.
- Auth: requiere sesión (usa `req.session.user.rut`).
- Body (JSON):
```json
{ "monto":5000000, "renta":1000000, "cuotas":24, "tasaAnual":18, "cuota":12345.67 }
```
- Controlador: `backend/controlador/solicitudes.js` -> usa `backend/modelo/Simulacion.js`.
- Respuesta (201):
```json
{ "ok": true, "idSimulacion": 1 }
```
- Errores comunes: 401 (no autenticado), 500 (error interno). Si ves `clienteRut no puede ser nulo` significa que la sesión no tiene `user.rut`.
- Ejemplo curl (suponiendo login previo):
```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/simulaciones/guardar \
  -H 'Content-Type: application/json' \
  -d '{"monto":5000000,"renta":1000000,"cuotas":24,"tasaAnual":18,"cuota":12345.67}'
```

---

### GET /api/simulaciones/guardadas
- Propósito: listar simulaciones activas del cliente.
- Auth: requiere sesión.
- Controlador: `backend/controlador/solicitudes.js` -> `Simulacion.getAllByCliente`.
- Respuesta (200):
```json
{ "ok": true, "simulaciones": [ {"id_simulacion":1, "clienteRut":"...", ...}, ... ] }
```

---

### POST /api/solicitudes/crear
- Propósito: crear una solicitud formal a partir de una simulación guardada.
- Auth: requiere sesión.
- Body (JSON): `{ "idSimulacion": 1 }`
- Controlador: `backend/controlador/solicitudes.js` -> crea `Solicitud` y actualiza la simulación a `solicitada`.
- Respuesta (201): `{ "ok": true, "idSolicitud": 1, "estado": "pendiente" }

---

## Archivos relevantes (ubicación en el repo)
- Rutas / wiring: `index.js`
- Controladores (handlers HTTP): `backend/controlador/autentificacion.js`, `backend/controlador/registrar.js`, `backend/controlador/solicitudes.js`
- Modelos / operaciones BD: `backend/modelo/Cliente.js`, `backend/modelo/Simulacion.js`, `backend/modelo/Solicitud.js`, `backend/modelo/Prestamo.js`, `backend/modelo/Pago.js`, `backend/modelo/Evaluacion.js`, `backend/modelo/HistorialCrediticio.js`
- DB connection: `backend/modelo/db.js` (usa `pg`)

---

## Consejos para pruebas locales
- Antes de probar rutas que requieren sesión:
  1. `POST /api/login` con curl y guarda cookies: `-c cookies.txt`
  2. Reusar cookies en llamadas posteriores: `-b cookies.txt`
- En el navegador: configura `fetch(..., { credentials: 'include' })` (ya está usado en el frontend).

---

Si quieres, puedo:
- Generar un `docs/Postman_collection.json` con ejemplos para importar en Postman.
- Añadir ejemplos `curl` para cada endpoint en un archivo `docs/EXAMPLES.sh`.
- Añadir la verificación automática de rutas en desarrollo (un endpoint que liste todas las rutas registradas).

Dime cuál de esas opciones quieres que haga y lo creo automáticamente en el repo.
