import React, { useState, useEffect } from 'react';

// Helper para formatear dinero
const formatCurrency = (num) => {
  // Verificación para evitar NaN
  if (num === null || num === undefined || isNaN(Number(num))) {
    return '$NaN';
  }
  return '$' + new Intl.NumberFormat('es-CL').format(Math.round(num));
};

// Recibimos setPage para poder navegar a otras partes (ej. al simulador)
function MisSimulaciones({ setPage }) {
  const [simulaciones, setSimulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null); // Para mensajes de éxito/error al solicitar

  // --- 1. Cargar las simulaciones guardadas al iniciar ---
  useEffect(() => {
    const fetchSimulaciones = async () => {
      setLoading(true);
      setError(null);
      try {
        // Llamamos al endpoint que creamos en el backend
        const resp = await fetch('/api/simulaciones/guardadas', {
          credentials: 'include' // ¡Crucial! Envía la cookie de sesión
        });
        const data = await resp.json();

        if (!resp.ok || !data.ok) {
          throw new Error(data.error || 'Error al cargar las simulaciones.');
        }
        
        setSimulaciones(data.simulaciones);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulaciones();
  }, []); // El array vacío [] asegura que se ejecute solo una vez

  // --- 2. Función para "Elegir" o "Solicitar" un crédito ---
  // --- CORRECCIÓN AQUÍ: Recibimos el id de la simulación ---
  const handleSolicitar = async (idSimulacion) => {
    setLoading(true);
    setError(null);
    setMensaje(null);

    try {
      // Llamamos al endpoint 'crear' que modificamos en el backend
      const resp = await fetch('/api/solicitudes/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idSimulacion: idSimulacion }), // Solo enviamos el ID
        credentials: 'include'
      });

      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Error al procesar la solicitud.');
      }

      // ¡Éxito!
      setMensaje(`¡Solicitud N° ${data.idSolicitud} creada con éxito! Estado: ${data.estado}`);
      
      // Opcional: Recargar la lista para que la simulación usada desaparezca
      // (ya que su estado cambió a 'solicitada')
      // --- CORRECCIÓN AQUÍ: Comparamos con _id_simulacion ---
      const nuevasSimulaciones = simulaciones.filter(s => s._id_simulacion !== idSimulacion);
      setSimulaciones(nuevasSimulaciones);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Renderizado ---
  
  if (loading && simulaciones.length === 0) {
    return <main>Cargando simulaciones...</main>;
  }

  return (
    <main>
      <h2>Mis Simulaciones Guardadas</h2>
      <p>Aquí puedes ver las cotizaciones que has guardado. Estas son válidas por 24 horas.</p>

      {/* Muestra de mensajes de error o éxito */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}

      {/* Lista de simulaciones */}
      <div className="simulaciones-list">
        {simulaciones.length === 0 && !loading && (
          <p>No tienes simulaciones guardadas.</p>
        )}

        {/* --- CORRECCIONES EN ESTE BLOQUE (usamos _propiedad) --- */}
        {simulaciones.map(sim => (
          <div key={sim._id_simulacion} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
            <h4>Simulación #{sim._id_simulacion}</h4>
            <p><strong>Monto:</strong> {formatCurrency(sim._monto)}</p>
            <p><strong>Cuotas:</strong> {sim._cuotas}</p>
            <p><strong>Tasa Anual:</strong> {sim._tasa_anual}%</p>
            <p><strong>Valor Cuota:</strong> {formatCurrency(sim._valor_cuota)}</p>
            <button 
              onClick={() => handleSolicitar(sim._id_simulacion)}
              disabled={loading}
              style={{ backgroundColor: '#007bff', color: 'white' }}
            >
              {loading ? 'Procesando...' : 'Solicitar este Crédito'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default MisSimulaciones;


