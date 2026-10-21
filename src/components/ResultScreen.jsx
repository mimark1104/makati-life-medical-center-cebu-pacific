import React, { useState } from 'react';

export default function ResultScreen({ result, onRestart, onRequestFollowUp }) {
  if (!result) {
    return (
      <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Loading wellness evaluation...</p>
      </div>
    );
  }

  const [requested, setRequested] = useState(
    result?.requestedFollowUp === true || 
    result?.requestedFollowUp === 'YES' || 
    result?.requested_follow_up === true ||
    result?.requested_follow_up === 'true'
  );
  const [infoModal, setInfoModal] = useState(null);

  const handlePrimaryClick = () => {
    setRequested(true);
    if (typeof onRequestFollowUp === 'function') {
      onRequestFollowUp(result.id);
    }
  };

  const route = result?.route;
  const isRouteA = route === 'ROUTE_A' || route === 'PRIORITY_ASSIST';
  const isRouteB = route === 'ROUTE_B' || route === 'GENTLE_CARE';
  const isRouteC = route === 'ROUTE_C' || route === 'FIT_TO_FLY';

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

      {/* ROUTE A / PRIORITY CHECK-IN */}
      {isRouteA && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>🩺</div>
          <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>PRIORITY CHECK-IN</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '1.75rem 0 1.5rem 0' }}>Health Check-In Recommended!</h2>
          

          {requested ? (
            <div style={{ background: '#eef4fc', border: '1px solid #b6d3f2', padding: '0.875rem', borderRadius: '12px', color: '#174b85', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>✓ Your request has been received. You may speak with our GP for health counseling.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.8, margin: '0 0 1.25rem 0' }}>
                By requesting a health check-in, you agree to allow Makati Life Medical Center healthcare staff to contact you via phone call or SMS message regarding your wellness evaluation.
              </p>
              <button className="btn-dark" onClick={handlePrimaryClick}>REQUEST HEALTH CHECK-IN</button>
              <button className="btn-secondary" onClick={onRestart}>FINISH</button>
            </div>
          )}
        </div>
      )}

      {/* ROUTE B / PRE-FLIGHT ADVISORY */}
      {isRouteB && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#fffbeb', color: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>🛡️</div>
          <span style={{ background: '#fffbeb', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>PRE-FLIGHT ADVISORY</span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.75rem 0 1.5rem 0' }}>Pre-Flight Wellness Check Recommended!</h2>
          

          {requested ? (
            <div style={{ background: '#eef4fc', border: '1px solid #b6d3f2', padding: '0.875rem', borderRadius: '12px', color: '#174b85', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>✓ Request acknowledgment recorded. Our team will assist shortly.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.8, margin: '0 0 1.25rem 0' }}>
                By connecting with us, you agree to receive follow-up phone calls or messages from Makati Life Medical Center regarding guidance, preventive check-ups, and specialist consultations.
              </p>
              <button className="btn-dark" onClick={handlePrimaryClick}>CONNECT WITH MAKATI LIFE</button>
              <button className="btn-secondary" onClick={onRestart}>FINISH</button>
            </div>
          )}
        </div>
      )}

      {/* ROUTE C / READY TO FLY (FIT TO FLY) */}
      {(isRouteC || (!isRouteA && !isRouteB)) && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#eef4fc', color: '#174b85', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem auto' }}>🌟</div>
          <span style={{ background: '#eef4fc', color: '#174b85', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>READY TO FLY</span>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 800, margin: '1.75rem 0 1rem 0' }}>Ready for Your Wellness Journey!</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {/* FACEBOOK PAGE LINK BUTTON */}
            <a 
              href="https://www.facebook.com/MakatiLifeMedicalCenter" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                background: '#1877f2', 
                color: '#ffffff', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(24, 119, 242, 0.2)'
              }}
            >
              👍 Like our Facebook Page
            </a>

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