// src/pages/Registro.jsx
import React, { useState } from 'react';

function Registro({ setPage }) {
  // 1. Estados para todos los campos que tu backend pide
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  
  // Para mensajes de éxito o error
  const [mensaje, setMensaje] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null); // Limpia mensajes anteriores

    try {
      // --- ¡AQUÍ ESTÁ LA CONEXIÓN! ---
      // 1. Asumo que tu ruta es /api/registrar (basado en el nombre de tu archivo)
      const resp = await fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 2. Envía el body que 'registrar.js' espera
        body: JSON.stringify({
          rut,
          nombre,
          correo,
          direccion,
          telefono,
          contrasena
        }),
        // 3. Envía credenciales (porque tu backend inicia sesión)
        credentials: 'include'
      });

      const data = await resp.json();

      // 4. Maneja la respuesta de error (ej: 'RUT ya registrado')
      if (!resp.ok || !data.ok) {
        throw new Error(data.error);
      }

      // 5. ¡ÉXITO! Muestra el mensaje del backend
      setMensaje(data.mensaje || '¡Registro exitoso! Ya puedes iniciar sesión.');
      
      // Opcional: navega a login después de 2 segundos
      setTimeout(() => setPage('login'), 2000);

    } catch (err) {
      setMensaje(err.message);
    }
  };

  return (
    <main>
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit}>
        {/* Un input para cada estado */}
        <div><label>RUT</label><input type="text" value={rut} onChange={(e) => setRut(e.target.value)} /></div>
        <div><label>Nombre</label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
        <div><label>Correo</label><input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} /></div>
        <div><label>Dirección</label><input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} /></div>
        <div><label>Teléfono</label><input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} /></div>
        <div><label>Contraseña</label><input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} /></div>
        
        <button type="submit">Crear Cuenta</button>
      </form>

      {/* Muestra mensajes de éxito o error */}
      {mensaje && <p>{mensaje}</p>}

      <hr />

      {/* Navega de vuelta a la página de login */}
      <div>
        <p>¿Ya tienes una cuenta?</p>
        <button type="button" onClick={() => setPage('login')}>
          Inicia Sesión
        </button>
      </div>
    </main>
  );
}

export default Registro;