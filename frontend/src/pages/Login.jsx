
import React, { useState } from 'react'
import '../Login.css'

export default function Login() {
  const [rut, setRut] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipo, setTipo] = useState('info') // 'info' | 'error' | 'ok'

  const onSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')

    const rutTrim = rut.trim()
    if (!rutTrim || !contrasena) {
      setTipo('error')
      setMensaje('Por favor completa RUT y contraseña.')
      return
    }

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: rutTrim, contrasena })
      })

      let data = {}
      try { data = await resp.json() } catch {}

      if (resp.ok && data.ok) {
        setTipo('ok')
        setMensaje('Login correcto, redirigiendo...')
        // simular navegación (dependiendo del router real)
        // window.location.href = '/simulador'
        return
      }

      const msg = (data && data.error) ? data.error : `Error ${resp.status}`
      setTipo('error')
      setMensaje('Login incorrecto: ' + msg)
    } catch (err) {
      setTipo('error')
      setMensaje('Error de red: ' + err.message)
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={onSubmit}>
        <h2>Iniciar sesión</h2>

        <label htmlFor="rut">RUT</label>
        <input
          id="rut"
          name="rut"
          type="text"
          placeholder="11.111.111-1"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
        />

        <label htmlFor="pass">Contraseña</label>
        <input
          id="pass"
          name="pass"
          type="password"
          placeholder="••••••••"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        <button type="submit">Entrar</button>
        <div style={{ marginTop: 8 }}>
          <a href="/vista/registrar.html">Registrarse</a>
        </div>

        {mensaje && (
          <div
            className="respuesta"
            style={{
              marginTop: 12,
              padding: 12,
              background: tipo === 'error' ? '#fde8e8' : tipo === 'ok' ? '#ecfdf5' : '#f5f5f5',
              color: '#111',
              borderRadius: 8
            }}
          >
            {mensaje}
          </div>
        )}
      </form>
    </div>
  )
}
