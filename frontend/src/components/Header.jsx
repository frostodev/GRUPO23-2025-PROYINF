import React from 'react';

export default function Header({ onNavigate, current }) {
  return (
    <header className="app-header">
      <div className="brand">Mi App</div>
      <nav>
        <button className={current === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}>Home</button>
        <button className={current === 'sim' ? 'active' : ''} onClick={() => onNavigate('sim')}>Simulador</button>
        <button className={current === 'profile' ? 'active' : ''} onClick={() => onNavigate('profile')}>Perfil</button>
        <button onClick={() => onNavigate('login')}>Logout</button>
      </nav>
    </header>
  );
}
