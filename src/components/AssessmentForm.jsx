import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS } from '../data/questions';
import { evaluateAssessment } from '../utils/routingEngine';

const CEBPAC_MASCOT_URL = "https://cdn.prod.website-files.com/66f107521fe1651eb4dc9adb/6ad819801e9a9f2ca441fc73_252-2527234_airport-ticket-clipart.png";

export default function AssessmentForm({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0); // 0: Privacy, 1: Info, 2..5: Questions
  const [participant, setParticipant] = useState({ name: '', email: '', phone: '' });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [modalMessage, setModalMessage] = useState(null);
  const [isTakingOff, setIsTakingOff] = useState(false);

  const questionStepsCount = QUESTIONS.length + 1; // 1 (Details) + 4 Questions = 5 Steps
  const activeQuestionStep = currentStep;
  const progressPercent = Math.round(((activeQuestionStep - 1) / (questionStepsCount - 1)) * 100);

  const showAlert = (msg) => setModalMessage(msg);
  const closeModal = () => setModalMessage(null);

  const handleOptionSelect = (qId, score) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!privacyAgreed) {
        showAlert("Please accept the Data Privacy Notice in compliance with Philippine Law (R.A. 10173) to proceed.");
        return;
      }
      
      // Trigger Slow Gliding Takeoff Animation before advancing to Info step
      setIsTakingOff(true);
      setTimeout(() => {
        setIsTakingOff(false);
        setCurrentStep(1);
      }, 2200);
      return;
    } 
    
    if (currentStep === 1) {
      if (!participant.name.trim() || !participant.email.trim() || !participant.phone.trim()) {
        showAlert("Please fill in your Full Name, Email address, and Mobile Number.");
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(participant.email)) {
        showAlert("Please enter a valid email address.");
        return;
      }
      const phonePattern = /^[0-9+\-\s()]{7,15}$/;
      if (!phonePattern.test(participant.phone)) {
        showAlert("Please enter a valid mobile number.");
        return;
      }
    } else {
      const currentQ = QUESTIONS[currentStep - 2];
      if (answers[currentQ.id] === undefined) {
        showAlert("Please select an answer choice to proceed.");
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!privacyAgreed) {
      showAlert("Data Privacy Consent is required.");
      return;
    }
    for (const q of QUESTIONS) {
      if (answers[q.id] === undefined) {
        showAlert("Please answer all questions before completing the check.");
        return;
      }
    }

    const evaluation = evaluateAssessment(answers);
    const newRecord = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      privacyConsent: true,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ...evaluation,
      answers: answers,
      requestedFollowUp: false
    };

    // Trigger Slow Gliding Takeoff Animation before displaying Result Screen
    setIsTakingOff(true);
    setTimeout(() => {
      setIsTakingOff(false);
      onComplete(newRecord);
    }, 2200);
  };

  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
      
      {/* CEBU PACIFIC MASCOT SLOW GLIDE ANIMATION OVERLAY */}
      <AnimatePresence>
        {isTakingOff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(4px)',
              zIndex: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Gentle Horizontal Wind Streams */}
            {[-40, -15, 15, 40].map((offset, idx) => (
              <motion.div
                key={idx}
                initial={{ x: '200%', opacity: 0 }}
                animate={{ x: '-200%', opacity: [0, 0.8, 0] }}
                transition={{ 
                  duration: 1.8, 
                  delay: idx * 0.1, 
                  repeat: Infinity, 
                  ease: 'linear' 
                }}
                style={{
                  position: 'absolute',
                  top: `calc(50% + ${offset}px)`,
                  width: '220px',
                  height: '3px',
                  background: 'linear-gradient(90deg, rgba(0,114,206,0) 0%, rgba(252,209,22,0.85) 50%, rgba(0,114,206,0) 100%)',
                  borderRadius: '2px'
                }}
              />
            ))}

            {/* Slow Gliding Mascot Character */}
            <motion.img
              src={CEBPAC_MASCOT_URL}
              alt="Cebu Pacific Mascot"
              initial={{ x: '-340px', y: '0px', scale: 0.95 }}
              animate={{ 
                x: '340px', 
                y: ['0px', '-8px', '0px', '8px', '0px'],
                scale: 1.25 
              }}
              transition={{ 
                x: { duration: 2.2, ease: 'easeInOut' },
                y: { duration: 2.2, ease: 'easeInOut' },
                scale: { duration: 2.2, ease: 'easeInOut' }
              }}
              style={{
                width: '180px',
                height: 'auto',
                filter: 'drop-shadow(0 12px 20px rgba(252, 209, 22, 0.45))'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ALERT */}
      {modalMessage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', maxWidth: '340px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>⚠️</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Action Required</h4>
            <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45, marginBottom: '1.25rem' }}>{modalMessage}</p>
            <button type="button" className="btn-dark" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }} onClick={closeModal}>Understand & Continue</button>
          </div>
        </div>
      )}

      {/* PROGRESS BAR */}
      {currentStep > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>
            <span>STEP {activeQuestionStep} OF {questionStepsCount}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* STEP 0: PRIVACY CONSENT */}
        {currentStep === 0 && (
          <div>
            <div style={{ 
              width: '100%', 
              maxWidth: '320px', 
              aspectRatio: '16 / 9', 
              margin: '0 auto 1.25rem auto', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>
              <img 
                src="https://cdn.prod.website-files.com/66f107521fe1651eb4dc9adb/6aa104b9b641ff2523661d82_mlmc_new%204.png" 
                alt="Travel & Wellness Cover" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>

            <div style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Ready for Your Journey?</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>Quick pre-flight wellness self-check</p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🔒</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.03em' }}>DATA PRIVACY NOTICE (R.A. 10173)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.5', marginBottom: '1rem' }}>
                In compliance with the <strong>Philippine Data Privacy Act of 2012 (R.A. 10173)</strong>, Makati Life Medical Center collects your personal information solely to process your wellness self-assessment and determine wellness follow-up services. Your data will be kept secure and confidential.
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer', background: privacyAgreed ? '#eef4fc' : '#fff', padding: '0.75rem', borderRadius: '10px', border: privacyAgreed ? '1.5px solid #174b85' : '1px solid #cbd5e1', transition: 'all 0.2s' }}>
                <input type="checkbox" checked={privacyAgreed} onChange={e => setPrivacyAgreed(e.target.checked)} style={{ marginTop: '0.15rem', accentColor: '#174b85', width: '18px', height: '18px' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b', lineHeight: '1.4' }}>
                  I agree to the collection and processing of my personal data for wellness evaluation. <span style={{ color: '#dc2626' }}>*</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 1: PARTICIPANT INFORMATION */}
        {currentStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', margin: '0.5rem 0 1.25rem 0' }}>
              <span style={{ fontSize: '2.5rem' }}>👤</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem' }}>Participant Information</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Please enter your contact details to personalize your results</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>YOUR FULL NAME <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" placeholder="e.g. Juan Dela Cruz" value={participant.name} onChange={e => setParticipant({ ...participant, name: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>EMAIL ADDRESS <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="email" placeholder="e.g. jdc@example.com" value={participant.email} onChange={e => setParticipant({ ...participant, email: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>MOBILE NUMBER <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="tel" placeholder="e.g. +63 912 345 6789" value={participant.phone} onChange={e => setParticipant({ ...participant, phone: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }} />
              </div>
            </div>
          </div>
        )}

        {/* STEPS 2..N: QUESTIONS */}
        {currentStep >= 2 && (
          <div>
            {(() => {
              const q = QUESTIONS[currentStep - 2];
              return (
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#174b85', letterSpacing: '0.05em' }}>
                    {q.category.toUpperCase()} <span style={{ color: '#dc2626' }}>*</span>
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.35rem 0 1rem 0' }}>{q.text}</h3>

                  <div className="option-list">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt.score;
                      return (
                        <div key={opt.id} className={`option-card ${isSelected ? 'selected' : ''}`} onClick={() => handleOptionSelect(q.id, opt.score)}>
                          <div className="option-icon-container">{opt.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{opt.label}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>{opt.subtitle}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* BOTTOM BUTTON BAR */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          {currentStep > 0 && <button type="button" className="btn-secondary" onClick={handlePrev} disabled={isTakingOff}>← Back</button>}
          {currentStep < questionStepsCount ? (
            <button 
              type="button" 
              className="btn-dark" 
              style={{ flex: 1 }} 
              onClick={handleNext}
              disabled={isTakingOff}
            >
              {currentStep === 0 ? "Let's start" : "Next Step →"}
            </button>
          ) : (
            <button type="submit" className="btn-dark" style={{ flex: 1 }} disabled={isTakingOff}>Complete Check ✨</button>
          )}
        </div>

      </form>
    </div>
  );
}