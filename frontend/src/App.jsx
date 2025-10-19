import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Simulator from './pages/Simulator'
import Profile from './pages/Profile'
import Login from './pages/Login'

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
        return <Login />
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
