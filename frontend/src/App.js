import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes hacer la petición al backend para autenticar
    if (username === 'admin' && password === 'admin') {
      setMessage('¡Login exitoso!');
    } else {
      setMessage('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ padding: 32, border: '1px solid #ccc', borderRadius: 8, background: '#fafafa', minWidth: 300 }}>
        <h2>Iniciar Sesión</h2>
        <div style={{ marginBottom: 16 }}>
          <label>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
          Entrar
        </button>
        {message && <p style={{ marginTop: 16, color: message.includes('exitoso') ? 'green' : 'red' }}>{message}</p>}
      </form>
    </div>
  );
}

export default App;
