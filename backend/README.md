# Base de datos
Para ingresar a la consola de la Base de Datos

sudo docker exec -it (nombre del contenedor) psql -U user -d mydb

sudo docker exec -it grupo23-2025-proyinf-postgres_db-1 psql -U user -d mydb

luego usar para mostrar las tablas 
'\dt'
