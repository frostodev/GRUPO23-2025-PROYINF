import React from 'react';


function Header({ onNavigate, current, onLogout }) {
  return (
    <header>
      <nav>
        <button onClick={() => onNavigate('home')}>Home</button>
        <button onClick={() => onNavigate('sim')}>Simulador</button>
        <button onClick={() => onNavigate('profile')}>Perfil</button>
        <button onClick={onLogout} style={{ float: 'right' }}>Cerrar Sesión</button>
        <button onClick={() => onNavigate('misSimulaciones')}>Mis Simulaciones</button>
      </nav>
    </header>
  );
}

export default Header;