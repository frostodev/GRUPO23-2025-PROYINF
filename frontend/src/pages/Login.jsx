// src/pages/Login.jsx
import React, { useState } from 'react';

// Recibe las funciones de App.jsx para navegar
function Login({ onLoginSuccess, setPage }) {
  const [rut, setRut] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpia errores anteriores

    if (!rut || !contrasena) {
      setError('Por favor completa RUT y contraseña.');
      return;
    }

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, contrasena }),
        credentials: 'include' 
      });

      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }
      onLoginSuccess();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>RUT</label>
          <input
            type="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="11.111.111-1"
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit">Entrar</button>
      </form>

      {/* Muestra errores del backend aquí */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <hr />

      {/* Navega a la página de registro */}
      <div>
        <p>¿No tienes una cuenta?</p>
        <button type="button" onClick={() => setPage('registro')}>
          Regístrate aquí
        </button>
      </div>
    </main>
  );
}

export default Login;