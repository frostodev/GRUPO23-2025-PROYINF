# Servicios (Wiki) — Cómo usar la API en el prototipo
Resumen del escenario
---------------------
El prototipo es una aplicación de simulador y solicitudes de crédito. Flujo típico de uso:

1. Registro del cliente (opcional si ya existe cuenta de prueba).  
2. Login (crea sesión; cookie necesaria para llamadas autenticadas).  
3. Usar el simulador (cotizar) para obtener tasa, cuota y total.  
4. Guardar la simulación (persistir en BD).  
5. A partir de una simulación guardada crear una solicitud formal.

Autenticación y cookies
-----------------------
- La aplicación usa `express-session` y cookies para mantener sesión.  
- En el navegador el frontend ya incluye `credentials: 'include'` en los fetch.  
- Si pruebas con curl usa `-c cookies.txt` para guardar cookies en el login y `-b cookies.txt` para reusarlas en llamadas autenticadas.

Rutas principales y flujo de ejemplo
-----------------------------------
(Usar `http://<host>:3000` — en entorno local con Docker puede ser `http://localhost:3000` o `http://192.168.1.88:3000`)

1) Registrar (solo si no tienes cuenta de prueba)
- Método: POST
- URL: /api/registrar
- Body (JSON): { "rut","nombre","correo","direccion","telefono","contrasena" }
- Ejemplo:
```bash
curl -v -X POST http://localhost:3000/api/registrar \
  -H 'Content-Type: application/json' \
  -d '{"rut":"1","nombre":"1","correo":"1@1.cl","direccion":"1","telefono":"1","contrasena":"1"}'
```
- Resultado esperado: 201 Created con datos del cliente.

2) Login
- Método: POST
- URL: /api/login
- Body (JSON): { "rut", "contrasena" }
- Ejemplo (guardar cookies):
```bash
curl -v -c cookies.txt -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"rut":"1","contrasena":"1"}'
```
- Resultado esperado: { "ok": true }

3) Verificar sesión (opcional)
- GET /api/me (usar `-b cookies.txt`)
```bash
curl -s -b cookies.txt http://localhost:3000/api/me
```

4) Cotizar (simulador)
- POST /api/solicitudes/cotizar (requiere sesión)
- Body: { "monto": number, "renta": number, "cuotas": number }
- Ejemplo:
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/solicitudes/cotizar \
  -H 'Content-Type: application/json' \
  -d '{"monto":5000000,"renta":1000000,"cuotas":24}'
```
- Respuesta: { ok:true, tasaAnual, cuota, total, intereses, carga }

5) Guardar simulación
- POST /api/simulaciones/guardar (requiere sesión)
- Body: { monto, renta, cuotas, tasaAnual, cuota }
- Ejemplo:
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/simulaciones/guardar \
  -H 'Content-Type: application/json' \
  -d '{"monto":5000000,"renta":1000000,"cuotas":24,"tasaAnual":18,"cuota":12345.67}'
```
- Resultado: { ok:true, idSimulacion }
- Nota: si obtienes un error que diga "clienteRut no puede ser nulo", significa que la sesión no contiene `user.rut` — verifica `POST /api/login` y que estés reusando cookies.

6) Listar simulaciones guardadas
- GET /api/simulaciones/guardadas (requiere sesión)
- Ejemplo:
```bash
curl -b cookies.txt http://localhost:3000/api/simulaciones/guardadas
```

7) Crear solicitud a partir de simulación
- POST /api/solicitudes/crear (requiere sesión)
- Body: { "idSimulacion": <id> }
- Ejemplo:
```bash
curl -b cookies.txt -X POST http://localhost:3000/api/solicitudes/crear \
  -H 'Content-Type: application/json' -d '{"idSimulacion":1}'
```

Errores comunes y cómo interpretarlos
------------------------------------
- 401 No autenticado: la llamada requiere sesión; revisa `POST /api/login` y usa las cookies.
- 500 Error interno: revisar logs del backend (`sudo docker compose logs app --tail 200`) para ver stack trace.
- `clienteRut no puede ser nulo`: la sesión `req.session.user` no contiene `rut`; revisar login y middleware de sesiones.
- Al ejecutar `init.sql` como parte del arranque de Postgres, si ves `violates check constraint 'chk_numero_cuenta_digits'` fue porque un INSERT intentó meter un `numero_cuenta` corto; se corrigió en `init.sql` usando DEFAULT.

Recomendaciones para pruebas y entrega
------------------------------------
- Probar la secuencia completa con curl: registrar (si aplica), login (guardar cookies), cotizar, guardar simulación, listar simulaciones y crear solicitud.
- Incluir en la Wiki de GitHub esta página (`docs/Servicios.md`) o copiarla a la Wiki del repo.
- Para usuarios testers: proveer credenciales de prueba (ej. rut=`1`, contrasena=`1`) y la IP/host del servidor.

Siguiente paso — opciones que puedo generar ahora
------------------------------------------------
- Generar `docs/EXAMPLES.sh` con los comandos curl listos para ejecutar en orden (útil para QA).
- Generar `docs/Postman_collection.json` (importable en Postman).
- Añadir un endpoint dev `/__routes` que liste las rutas registradas (solo para desarrollo). 

Dime cuál de estas opciones quieres y la añado al repo (puedo crear `docs/EXAMPLES.sh` ahora si quieres).