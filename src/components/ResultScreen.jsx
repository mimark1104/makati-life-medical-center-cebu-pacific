import React, { useState } from 'react';

export default function ResultScreen({ result, onRestart, onRequestFollowUp }) {
  const [requested, setRequested] = useState(result.requestedFollowUp);
  const [infoModal, setInfoModal] = useState(null);

  const handlePrimaryClick = () => {
    setRequested(true);
    onRequestFollowUp(result.id);
  };

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative' }}>
      
      {infoModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', maxWidth: '340px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>ℹ️</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Wellness Services</h4>
            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45, marginBottom: '1.25rem' }}>{infoModal}</p>
            <button type="button" className="btn-dark" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }} onClick={() => setInfoModal(null)}>Close</button>
          </div>
        </div>
      )}

      {result.route === 'ROUTE_A' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>🩺</div>
          <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>PRIORITY CHECK-IN</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Health Check-In Recommended!</h2>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>"Your wellness responses suggest that it may be helpful to speak with a healthcare professional before your next adventure."</p>

          {requested ? (
            <div style={{ background: '#eef4fc', border: '1px solid #b6d3f2', padding: '0.875rem', borderRadius: '12px', color: '#174b85', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>✓ Your request has been received. You may speak with our GP for a health counseling.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button className="btn-dark" onClick={handlePrimaryClick}>REQUEST HEALTH CHECK-IN</button>
              <button className="btn-secondary" onClick={onRestart}>FINISH</button>
            </div>
          )}
        </div>
      )}

      {result.route === 'ROUTE_B' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#fffbeb', color: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>🛡️</div>
          <span style={{ background: '#fffbeb', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>PRE-FLIGHT ADVISORY</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Pre-Flight Wellness Check Recommended!</h2>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>"A few of your wellness habits may benefit from extra attention. A quick check-in could help you prepare for a healthier journey."</p>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' }}>"Want guidance on preventive check-ups or specialist consultations? We can help."</p>

          {requested ? (
            <div style={{ background: '#eef4fc', border: '1px solid #b6d3f2', padding: '0.875rem', borderRadius: '12px', color: '#174b85', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>✓ Request acknowledgment recorded. Our team will assist shortly.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button className="btn-dark" onClick={handlePrimaryClick}>CONNECT WITH MAKATI LIFE</button>
              <button className="btn-secondary" onClick={onRestart}>FINISH</button>
            </div>
          )}
        </div>
      )}

      {result.route === 'ROUTE_C' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#eef4fc', color: '#174b85', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>🌟</div>
          <span style={{ background: '#eef4fc', color: '#174b85', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>READY TO FLY</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0' }}>Ready for Your Wellness Journey!</h2>
          <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>"You're showing positive wellness habits. Keep making your health a priority wherever your journey takes you."</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button className="btn-dark" onClick={() => setInfoModal("Our concierge will connect with you to explore wellness packages.")}>EXPLORE WELLNESS SERVICES</button>
            <button className="btn-secondary" onClick={onRestart}>FINISH</button>
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
        This is a general wellness self-assessment only and does not establish medical fitness to fly or replace professional medical evaluation.
      </div>
    </div>
  );
}