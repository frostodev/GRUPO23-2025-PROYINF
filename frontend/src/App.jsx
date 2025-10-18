import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Simulator from './pages/Simulator'
import Profile from './pages/Profile'

function App() {
  const [page, setPage] = useState('home')

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home />
      case 'sim':
        return <Simulator />
      case 'profile':
        return <Profile />
      case 'login':
        return (
          <main>
            <h2>Login</h2>
            <p>Componente de login no encontrado en el proyecto. Implementa `src/Login.jsx` o cambia la ruta.</p>
          </main>
        )
      default:
        return <Home />
    }
  }

  return (
    <div>
      <Header onNavigate={setPage} current={page} />
      <div className="page-container">{renderPage()}</div>
    </div>
  )
}

export default App
