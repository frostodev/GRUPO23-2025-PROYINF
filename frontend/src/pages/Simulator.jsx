// src/pages/Simulator.jsx
import React, { useState, useEffect } from 'react';

function Simulator() {
  // --- Estados para el formulario ---
  const [monto, setMonto] = useState('');
  const [renta, setRenta] = useState('');
  const [cuotas, setCuotas] = useState('12'); // Valor inicial
  
  // --- Estados para la lógica ---
  const [userInfo, setUserInfo] = useState(null); // Para "Hola, [nombre]"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  // --- Estado para el resultado de la cotización ---
  const [resultadoCotizacion, setResultadoCotizacion] = useState(null); 

  // --- 1. Obtener datos del usuario al cargar la página ---
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        // Llama a la ruta /api/me que definiste en index.js
        const resp = await fetch('/api/me', { credentials: 'include' });
        const data = await resp.json();
        
        if (data.ok && data.user) {
          setUserInfo(data.user);
        } else {
          // Si no hay sesión, 'data.user' será null
          setError('No se pudo cargar la información del usuario.');
        }
      } catch (e) {
        setError('Error de red al cargar datos del usuario.');
      }
    }
    fetchUserInfo();
  }, []); // El array vacío [] asegura que se ejecute solo una vez

  // --- 2. Función para el botón "Simular" ---
  const handleSimular = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setLoading(true);
    setError(null);
    setSaveMessage(null);
    setResultadoCotizacion(null); // Limpia resultados anteriores

    try {
      // Llama al endpoint de 'cotizar'
      const resp = await fetch('/api/solicitudes/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          monto: Number(monto), 
          renta: Number(renta), 
          cuotas: Number(cuotas) 
        }),
        credentials: 'include' // ¡Crucial! Envía la cookie de sesión
      });

      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Error al simular crédito.');
      }

      // Guarda el resultado completo en el estado
      setResultadoCotizacion(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Función para el botón "Guardar Simulación" ---
  const handleGuardarSimulacion = async () => {
    // No puede guardar si no hay nada cotizado
    if (!resultadoCotizacion) {
      setError('Debes simular primero antes de guardar.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSaveMessage(null);

    try {
      // Llama al nuevo endpoint de 'guardar'
      const resp = await fetch('/api/simulaciones/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Envía los inputs del usuario
          monto: Number(monto),
          renta: Number(renta),
          cuotas: Number(cuotas),
          // Y también los resultados que calculó el backend
          tasaAnual: resultadoCotizacion.tasaAnual,
          cuota: resultadoCotizacion.cuota
        }),
        credentials: 'include' // ¡Crucial!
      });

      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Error al guardar la simulación.');
      }

      // ¡Éxito!
      setSaveMessage('¡Simulación guardada con éxito!');
      // Limpiamos el formulario
      setResultadoCotizacion(null);
      setMonto('');
      setRenta('');
      setCuotas('12');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // --- 4. Helper para formatear dinero ---
  const formatCurrency = (num) => {
    return '$' + new Intl.NumberFormat('es-CL').format(Math.round(num));
  };

  // --- 5. El JSX (lo que se ve) ---
  return (
    <main>
      <h2>Simulador de Crédito de Consumo</h2>
      
      {userInfo && (
        <p>Hola, <strong>{userInfo.nombre}</strong> (Cuenta N° {userInfo.numero_cuenta})</p>
      )}

      <form onSubmit={handleSimular}>
        <div>
          <label>Monto a solicitar:</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej: 5000000"
          />
        </div>

        <div>
          <label>Renta líquida mensual:</label>
          <input
            type="number"
            value={renta}
            onChange={(e) => setRenta(e.target.value)}
            placeholder="Ej: 1000000"
          />
        </div>

        <div>
          <label>Cantidad de cuotas:</label>
          <select value={cuotas} onChange={(e) => setCuotas(e.target.value)}>
            <option value="12">12 cuotas</option>
            <option value="24">24 cuotas</option>
            <option value="36">36 cuotas</option>
            <option value="48">48 cuotas</option>
          </select>
        </div>

        <div>
          <label>Tasa anual ofrecida:</label>
          <input
            type="text"
            // El resultado de la simulación aparece aquí
            value={resultadoCotizacion ? `${resultadoCotizacion.tasaAnual} %` : ''}
            readOnly
            placeholder="Se calcula al simular"
          />
        </div>

        {/* --- Botones --- */}
        <div style={{ marginTop: '20px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Calculando...' : 'Simular'}
          </button>
          
          {/* El botón "Guardar" solo aparece si la simulación fue exitosa */}
          {resultadoCotizacion && (
            <button 
              type="button" // Importante: 'button' para no enviar el form
              onClick={handleGuardarSimulacion}
              disabled={loading}
              style={{ marginLeft: '10px', backgroundColor: '#28a745' }}
            >
              {loading ? 'Guardando...' : 'Guardar Simulación'}
            </button>
          )}
        </div>
      </form>

      {/* --- Muestra de Errores o Éxito --- */}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>Error: {error}</p>}
      {saveMessage && <p style={{ color: 'green', marginTop: '15px' }}>{saveMessage}</p>}

      {/* --- Muestra de Resultados --- */}
      {resultadoCotizacion && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Resultado de tu Simulación</h3>
          <p><strong>Cuota mensual estimada:</strong> {formatCurrency(resultadoCotizacion.cuota)}</p>
          <p><strong>Total a pagar:</strong> {formatCurrency(resultadoCotizacion.total)}</p>
          <p><strong>Intereses totales:</strong> {formatCurrency(resultadoCotizacion.intereses)}</p>
          <p><strong>Carga sobre renta:</strong> {resultadoCotizacion.carga.toFixed(1)} %</p>
        </div>
      )}
    </main>
  );
}

export default Simulator;