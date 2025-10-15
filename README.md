# Grupo 23

Este es el repositorio del *Grupo 23*, cuyos integrantes son:

* Fabian San Martin - 202304650-7
* Nicolás Muñoz  - 202273641-0
* Arturo Almonacid - 202373515-9
* Sergio Cárcamo - 202273512-0
* **Tutor**: Ignacio Muñoz

## Wiki

Puede acceder a la Wiki mediante el siguiente [enlace](https://github.com/frostodev/GRUPO23-2025-PROYINF/wiki)

## Videos

* [Video presentación cliente](https://aula.usm.cl/pluginfile.php/7621199/mod_resource/content/2/video1352931478.mp4)

## Aspectos técnicos relevantes

_Todo aspecto relevante cuando para poder usar el proyecto o consideraciones del proyecto base a ser entregado_

## Montado de Frontend

** Para instalar npm

sudo apt install nodejs npm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

npm create vite@latest frontend -- --template react

El comando anterior creara la carpeta frontend.

Opciones de la pantilla React (Vite)
Use rolldown-vite (Experimental)?:
│  No
│
◇  Install with npm and start now?
│  Yes

ahora usar
npm run dev
para inicar la app

npm run dev & 
para usarlo sin la terminal, pero ahi es tu problema como lo cierras.