import React from 'react';

export default function Navbar({ 
  onRestart, 
  logoSrc = "https://cdn.prod.website-files.com/66f107521fe1651eb4dc9adb/6aa104b9b641ff2523661d82_mlmc_new%204.png" 
}) {
  return (
    <header style={{ 
      background: '#ffffff', 
      borderBottom: '1px solid #e2e8f0', 
      padding: '0.75rem 1.5rem', 
      display: 'flex', 
      justify: 'center', 
      alignItems: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      <div 
        onClick={onRestart} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        title="Return to Home Assessment"
      >
        <img 
          src={logoSrc} 
          alt="Makati Life Medical Center" 
          style={{ height: '40px', objectFit: 'contain' }} 
        />
      </div>
    </header>
  );
}