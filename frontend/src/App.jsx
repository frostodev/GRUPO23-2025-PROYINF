import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Simulator from './pages/Simulator'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Registro from './pages/Registro'
// --- 1. IMPORTAR EL NUEVO COMPONENTE ---
import MisSimulaciones from './pages/MisSimulaciones'

function App() {
  // --- PASO 1: ESTADO DE AUTENTICACIÓN ---
  // Este estado decide qué "mundo" mostrar.
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Por defecto, no está logueado

  // Estado para navegar DENTRO de la app principal
  const [page, setPage] = useState('home');

  // --- PASO 2: RENDERIZADO CONDICIONAL ---
  
  // Decide qué página mostrar *DESPUÉS* de iniciar sesión
  const renderMainAppPage = () => {
    switch (page) {
      case 'home':
        return <Home />
      case 'sim':
        return <Simulator />
      case 'profile':
        return <Profile />
        
      // --- 2. AQUÍ ES DONDE SE AÑADE TU CÓDIGO ---
      case 'misSimulaciones':
        return <MisSimulaciones setPage={setPage} />

      default:
        return <Home />
    }
  }

  // Decide qué página mostrar *ANTES* de iniciar sesión
  const renderAuthPage = () => {
    switch (page) {
      case 'login':
        // Le pasamos la función para que Login "avise" a App.jsx
        return <Login onLoginSuccess={() => setIsLoggedIn(true)} setPage={setPage} />
      case 'registro':
        return <Registro setPage={setPage} />
      default:
        // Si la página no es 'registro', siempre muestra 'login'
        return <Login onLoginSuccess={() => setIsLoggedIn(true)} setPage={setPage} />
    }
  }

  // --- PASO 3: EL RENDERIZADO PRINCIPAL ---
  // Aquí App.jsx decide qué "mundo" mostrar.
  
  if (isLoggedIn === false) {
    // --- MUNDO 1: El usuario NO está logueado ---
    // Muestra solo el Login o el Registro, SIN Header.
    return (
      <div className="auth-container"> {/* Puedes darle estilos diferentes */}
        {renderAuthPage()}
      </div>
    )
  }

  // --- MUNDO 2: El usuario SÍ está logueado ---
  // Muestra la App completa con su Header y páginas (Simulador, etc.)
  return (
    <div>
      <Header 
        onNavigate={setPage} 
        current={page}
        // Le damos al Header un botón para cerrar sesión
        onLogout={() => setIsLoggedIn(false)}
      />
      <div className="page-container">
        {renderMainAppPage()}
      </div>
    </div>
  )
}

export default App