# --- STAGE 1: Build ---
# Esta es la etapa de construcción, donde creamos la versión de producción de la app.
# Usa una versión más reciente de Node compatible con Vite
FROM node:20-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instalamos las dependencias del proyecto
RUN npm install

# Copiamos el resto de los archivos del proyecto al contenedor
COPY . .

# Creamos la build de producción
RUN npm run build

# --- STAGE 2: Run ---
# Esta es la etapa final, donde servimos los archivos generados.
FROM nginx:alpine AS runner

# Establecemos el directorio de trabajo donde Nginx sirve los archivos estáticos
WORKDIR /usr/share/nginx/html

# Copiamos los archivos de la build (desde la etapa 'builder') a la carpeta de Nginx
COPY --from=builder /app/dist .

# Exponemos el puerto 80 para poder acceder a la aplicación
EXPOSE 80

# Comando para iniciar el servidor Nginx cuando el contenedor se inicie
CMD ["nginx", "-g", "daemon off;"]
