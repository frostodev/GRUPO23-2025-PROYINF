import React, { useEffect, useMemo, useState } from 'react'

const styles = {
  wrap: {
    maxWidth: 980, margin: '32px auto', background: '#fff', borderRadius: 10,
    padding: '20px 20px 28px', boxShadow: '0 3px 18px rgba(0,0,0,.06)'
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: 12 },
  row: { display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' },
  panel: { background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 14, marginTop: 12 },
  kpi: { fontSize: 18, fontWeight: 700 },
  muted: { color: '#666', fontSize: 13 },
  btn: { background: '#d9342b', color: '#fff', border: 0, borderRadius: 10, padding: 12, cursor: 'pointer', fontWeight: 700, letterSpacing: '.4px' },
  input: { width: '100%', padding: 12, fontSize: 16, border: '1px solid #d4d4d4', borderRadius: 8, background: '#fff', boxSizing: 'border-box' },
  select: { width: '100%', padding: 12, fontSize: 16, border: '1px solid #d4d4d4', borderRadius: 8, background: '#fff' },
  label: { fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'block' },
  hello: { color: '#444', marginBottom: 12 },
  msg: { marginTop: 10, color: '#b00020' },
  ok: { marginTop: 10, color: '#056608', whiteSpace: 'pre-wrap' }
}

const fmtCL = (x) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Math.round(x || 0))
const parseCL = (s) => Number(String(s || '').replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, ''))

export default function Simulator() {
  const [me, setMe] = useState(null)

  const [monto, setMonto] = useState('')
  const [renta, setRenta] = useState('')
  const [cuotas, setCuotas] = useState('24')
  const [tasa, setTasa] = useState('')

  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState('')
  const [resultado, setResultado] = useState(null) // {cuota,total,intereses,carga}
  const [sim, setSim] = useState(null)

  useEffect(() => {
    let active = true
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!active) return
      if (!d.user) { window.location.href = '/'; return }
      setMe(d.user)
    }).catch(() => {})
    return () => { active = false }
  }, [])

  const onSimular = async () => {
    setMsg(''); setOk(''); setResultado(null); setSim(null)

    const montoN = parseCL(monto)
    const rentaN = parseCL(renta)
    const cuotasN = Number(cuotas)

    if (!isFinite(montoN) || montoN <= 0 || !isFinite(rentaN) || rentaN <= 0 || !isFinite(cuotasN) || cuotasN <= 0) {
      setMsg('Completa todos los campos con valores válidos.')
      return
    }

    try {
      const resp = await fetch('/simulaciones/oferta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: montoN, renta: rentaN, cuotas: cuotasN })
      })
      const data = await resp.json().catch(() => ({}))
      if (!(resp.ok && data.ok)) {
        setMsg('No se pudo simular: ' + (data.error || `Error ${resp.status}`))
        return
      }

      setTasa((data.tasaAnual ?? '—') + ' %')
      setResultado({
        cuota: data.cuota,
        total: data.total,
        intereses: data.intereses,
        carga: data.carga || 0
      })
      setSim({ monto: montoN, renta: rentaN, cuotas: cuotasN, tasaAnual: data.tasaAnual, cuotaEstimada: Math.round(data.cuota) })
    } catch (err) {
      setMsg('Error de red: ' + err.message)
    }
  }

  const onEnviarSolicitud = async () => {
    if (!sim) return
    setMsg(''); setOk('')
    try {
      const resp = await fetch('/solicitudes/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sim)
      })
      const data = await resp.json().catch(() => ({}))
      if (resp.ok && data.ok) {
        setOk(`Solicitud creada ✅\nID: ${data.idSolicitud}\nEstado: ${data.estado}`)
      } else {
        setMsg('No se pudo crear la solicitud: ' + (data.error || `Error ${resp.status}`))
      }
    } catch (err) {
      setMsg('Error de red: ' + err.message)
    }
  }

  return (
    <div style={{ background: '#f6f6f6', margin: -16, padding: 16 }}>
      <div style={styles.wrap}>
        <h1 style={{ margin: '4px 0 16px', fontSize: 22 }}>Simulador de Crédito de Consumo</h1>
        <div style={styles.hello}>{me ? `Hola, ${me.nombre} (Cuenta ${me.numero_cuenta})` : ''}</div>

        <div style={{ ...styles.grid, gridTemplateColumns: '1fr', gap: 12 }}>
          <div>
            <label htmlFor="monto" style={styles.label}>Monto solicitado</label>
            <input id="monto" style={styles.input} placeholder="Ej: 4.500.000" value={monto} onChange={e => setMonto(e.target.value)} />
          </div>
          <div>
            <label htmlFor="renta" style={styles.label}>Renta líquida mensual</label>
            <input id="renta" style={styles.input} placeholder="Ej: 1.000.000" value={renta} onChange={e => setRenta(e.target.value)} />
          </div>
          <div>
            <label htmlFor="cuotas" style={styles.label}>Cantidad de cuotas</label>
            <select id="cuotas" style={styles.select} value={cuotas} onChange={e => setCuotas(e.target.value)}>
              {[6,12,24,36,48,60].map(n => <option key={n} value={String(n)}>{n}</option>)}
            </select>
          </div>

          <div>
            <label style={styles.label}>Tasa anual ofrecida</label>
            <input style={styles.input} disabled placeholder="—" value={tasa} />
            <div style={styles.muted}>Se calcula automáticamente según tu renta, monto y plazo.</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
          <button style={styles.btn} onClick={onSimular}>Simular</button>
          <button style={{ ...styles.btn, opacity: sim ? 1 : 0.6, cursor: sim ? 'pointer' : 'not-allowed' }} onClick={onEnviarSolicitud} disabled={!sim}>Aceptar y enviar solicitud</button>
        </div>

        {msg && <div style={styles.msg}>{msg}</div>}
        {ok && <div style={styles.ok}>{ok}</div>}

        {resultado && (
          <div style={styles.panel}>
            <div style={{ ...styles.row, borderBottom: '1px dashed #eee' }}><div>Cuota mensual estimada</div><div style={styles.kpi}>{fmtCL(resultado.cuota)}</div></div>
            <div style={{ ...styles.row, borderBottom: '1px dashed #eee' }}><div>Total a pagar</div><div>{fmtCL(resultado.total)}</div></div>
            <div style={{ ...styles.row, borderBottom: '1px dashed #eee' }}><div>Intereses totales</div><div>{fmtCL(resultado.intereses)}</div></div>
            <div style={{ ...styles.row, borderBottom: 0 }}><div>Carga (cuota/renta)</div><div style={styles.kpi}>{(resultado.carga || 0).toFixed(1)}%</div></div>
          </div>
        )}
      </div>
    </div>
  )
}
