# Proyecto: API Node.js con Docker y PostgreSQL

Una plantilla de proyecto Node.js (Express) preparada para ejecutarse en contenedores Docker con PostgreSQL. Contiene el backend y el frontend básicos, además de ejemplos de controladores, modelos y vistas.

## Contenido del repositorio

- `backend/` — código del servidor (controladores, modelos, vistas de ejemplo).
- `frontend/` — aplicación web cliente (Vite + React).
- `docker-compose.yml` — orquestación de servicios (app, db, etc.).
- `Dockerfile` — imagen del backend.
- `Create_DB/` — scripts para crear la base de datos (si aplica).

## Requisitos previos

- Docker (https://docs.docker.com/get-docker/)
- Docker Compose (v2+)
- Node.js (opcional para desarrollo local): https://nodejs.org/
- curl o Postman para probar endpoints (opcional)

## Inicio rápido (Docker)

1. Abre una terminal y posicionate en la raíz del proyecto.
2. Construye y levanta los servicios:

```bash
docker compose up --build
```

3. Para levantar en segundo plano:

```bash
docker compose up -d
```

4. Para detener y eliminar volúmenes:

```bash
docker compose down -v
```

Si ya construiste las imágenes anteriormente y solo quieres iniciar los contenedores:

```bash
docker compose up
```

## Comandos útiles

- Ver servicios en ejecución:

```bash
docker compose ps
```

- Ver logs en tiempo real (todos los servicios):

```bash
docker compose logs -f
```

- Ver logs de un servicio en particular:

```bash
docker compose logs -f <nombre_servicio>
```

- Reiniciar un servicio específico:

```bash
docker compose restart <nombre_servicio>
```

## Ejecutar comandos dentro del contenedor backend

Instalar dependencias o ejecutar comandos npm dentro del contenedor `app`:

```bash
docker compose exec app sh -lc "npm install --save express-session && npm ls express-session"
docker compose exec app sh -lc "npm install --save-dev nodemon"
```

Si necesitas abrir una shell en el contenedor (ejemplo: `grupo23-2025-proyinf`):

```bash
docker exec -it grupo23-2025-proyinf sh
# luego dentro del contenedor:
npm install bcrypt
```

Nota: adapta el nombre del contenedor según el que muestre `docker compose ps`.

## Desarrollo local (sin Docker)

1. Instala dependencias:

```bash
npm install
```

2. Ejecuta el backend (por ejemplo con nodemon si está instalado):

```bash
npm run dev
```

3. Ejecuta el frontend (desde `frontend/`):

```bash
cd frontend
npm install
npm run dev
```

## Estructura y archivos importantes

- `backend/modelo/` — modelos (Cliente, Prestamo, Pago, etc.).
- `backend/controlador/` — lógica de rutas y autenticación.
- `frontend/src/` — componentes React y páginas.

## Enlace a video de demostración

Video de demostración del avance:

https://drive.google.com/file/d/1uH1eU-WkwLLAg3DSotu1IK1EoL0yeTex/view?usp=sharing

## Consejos y notas

- Si trabajas en Windows usa WSL2 y habilita la integración con Docker Desktop.
- Si el proyecto falla al iniciar, revisa los logs con `docker compose logs -f` y confirma las variables de entorno (si existen).
- Para cambios en la base de datos, usa los scripts dentro de `Create_DB/` o ejecuta migraciones si las agregas.
