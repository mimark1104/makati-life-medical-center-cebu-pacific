import React, { useState } from 'react';

export default function AdminAuth({ onLogin }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Passcode is required.');
      return;
    }
    if (passcode === 'admin123' || passcode === 'makatilife123') {
      onLogin();
    } else {
      setError('Invalid authorization passcode.');
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', maxWidth: '380px', margin: '2rem auto' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Admin Portal Access</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.35rem 0 1rem 0' }}>Enter authorization key to view participant leads.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>PASSCODE <span style={{ color: '#dc2626' }}>*</span></label>
          <input type="password" placeholder="Enter passcode" value={passcode} onChange={e => setPasscode(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }} required />
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" className="btn-dark" style={{ width: '100%' }}>Authenticate</button>
      </form>
    </div>
  );
}