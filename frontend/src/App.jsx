
import { useState } from 'react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('Enviando...');

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut: username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage('¡Login exitoso!');
      // Aquí puedes redirigir o guardar el token, etc.
    } else {
      setMessage(data.error || 'Error en login');
    }
  } catch (err) {
    setMessage('Error de conexión con el servidor');
  }
};

  return (
    <div style={{ maxWidth: 300, margin: '4rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Rut:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%' }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%' }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%' }}>Iniciar sesión</button>
      </form>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}

function App() {
  return <LoginForm />;
}

export default App;
