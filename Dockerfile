# syntax=docker/dockerfile:1

########## BACKEND BASE (herramientas) ##########
FROM node:20-alpine AS backend-base
WORKDIR /app
# herramientas de dev que usas hoy
RUN npm install -g wait-port nodemon

########## BACKEND DEV (igual a tu flujo actual) ##########
FROM backend-base AS backend-dev
WORKDIR /app
# instalamos deps del root package.json (como ya venías haciendo)
COPY package*.json ./
RUN npm ci || npm install
# copiamos TODO (lo montarás con volumes, pero esto ayuda en el primer build)
COPY . .
EXPOSE 3000
# espera a Postgres y lanza nodemon contra index.js en la raíz
CMD ["sh","-c","wait-port ${DB_HOST:-postgres_db}:5432 && npx nodemon --legacy-watch --ext js,json --watch . index.js"]

########## BACKEND PROD (sin nodemon) ##########
FROM node:20-alpine AS backend-prod
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
EXPOSE 3000
CMD ["node","index.js"]

########## FRONTEND BUILD ##########
FROM node:20-alpine AS frontend-build
WORKDIR /web
# deps del frontend (aislado en /web)
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ .
RUN npm run build

########## FRONTEND RUN (Nginx) ##########
FROM nginx:alpine AS frontend
# copia la build al docroot de nginx
COPY --from=frontend-build /web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
