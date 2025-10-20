import React, { useState } from 'react'
import '../Login.css'

export default function Login() {
  const [rut, setRut] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipo, setTipo] = useState('info') // 'info' | 'error' | 'ok'
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')

    const rutTrim = rut.trim()
    if (!rutTrim || !contrasena) {
      setTipo('error')
      setMensaje('Por favor completa RUT y contraseña.')
      return
    }

    setLoading(true)
    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: rutTrim, contrasena })
      })

      const data = await resp.json().catch(() => ({}))

      if (resp.ok && data.ok) {
        setTipo('ok')
        setMensaje('Login correcto, redirigiendo...')
        // redirigir a simulador
        setTimeout(() => { window.location.href = '/simulador' }, 700)
        return
      }

      const msg = (data && data.error) ? data.error : `Error ${resp.status}`
      setTipo('error')
      setMensaje('Login incorrecto: ' + msg)
    } catch (err) {
      setTipo('error')
      setMensaje('Error de red: ' + err.message)
    } finally {
      setLoading(false)
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
          disabled={loading}
        />

        <label htmlFor="pass">Contraseña</label>
        <input
          id="pass"
          name="pass"
          type="password"
          placeholder="••••••••"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          disabled={loading}
        />

        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
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
              borderRadius: 8,
              textAlign: 'center'
            }}
          >
            {mensaje}
          </div>
        )}
      </form>
    </div>
  )
}
 