import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AssessmentForm from './components/AssessmentForm';
import ResultScreen from './components/ResultScreen';
import AdminAuth from './components/AdminAuth';
import Dashboard from './components/Dashboard';

const INITIAL_SUBMISSIONS = [
  {
    id: 'SUB-1001',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '+63 917 123 4567',
    privacyConsent: true,
    date: '2026-10-20 10:00',
    counts: { 0: 0, 1: 0, 2: 2 },
    route: 'ROUTE_A',
    priority: 'HIGH FOLLOW-UP PRIORITY',
    recommendation: 'Health Check-In / GP Consultation Recommended',
    requestedFollowUp: true,
    answers: { 1: 2, 2: 2, 3: 1, 4: 1 }
  },
  {
    id: 'SUB-1002',
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    phone: '+63 918 987 6543',
    privacyConsent: true,
    date: '2026-10-20 11:15',
    counts: { 0: 3, 1: 1, 2: 0 },
    route: 'ROUTE_C',
    priority: 'LOW / OPTIONAL',
    recommendation: 'Routine Wellness Encouragement & Optional Check-Up',
    requestedFollowUp: false,
    answers: { 1: 0, 2: 0, 3: 0, 4: 1 }
  }
];

export default function App() {
  const [view, setView] = useState('assessment');
  const [currentResult, setCurrentResult] = useState(null);

  const [isAdminAuthed, setIsAdminAuthed] = useState(() => {
    return localStorage.getItem('makati_admin_auth') === 'true';
  });

  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('makati_wellness_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  useEffect(() => {
    localStorage.setItem('makati_wellness_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        const authed = localStorage.getItem('makati_admin_auth') === 'true';
        setView(authed ? 'dashboard' : 'auth');
      } else if (window.location.hash === '') {
        setView('assessment');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAdminLogin = () => {
    localStorage.setItem('makati_admin_auth', 'true');
    setIsAdminAuthed(true);
    setView('dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('makati_admin_auth');
    setIsAdminAuthed(false);
    window.location.hash = '';
    setView('assessment');
  };

  const handleAssessmentComplete = (newRecord) => {
    setCurrentResult(newRecord);
    setSubmissions(prev => [newRecord, ...prev]);
    setView('result');
  };

  const handleFollowUpRequest = (subId) => {
    setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, requestedFollowUp: true } : s));
    if (currentResult && currentResult.id === subId) {
      setCurrentResult(prev => ({ ...prev, requestedFollowUp: true }));
    }
  };

  const restartAssessment = () => {
    window.location.hash = '';
    setCurrentResult(null);
    setView('assessment');
  };

  const isDashboardView = view === 'dashboard';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar onRestart={restartAssessment} />

      <main style={{ 
        flex: 1, 
        width: '100%', 
        maxWidth: isDashboardView ? '1280px' : '500px', 
        margin: '0 auto', 
        padding: isDashboardView ? '2rem 1.5rem' : '1rem' 
      }}>
        {view === 'assessment' && (
          <AssessmentForm onComplete={handleAssessmentComplete} />
        )}

        {view === 'result' && currentResult && (
          <ResultScreen 
            result={currentResult} 
            onRestart={restartAssessment}
            onRequestFollowUp={handleFollowUpRequest}
          />
        )}

        {view === 'auth' && (
          <AdminAuth onLogin={handleAdminLogin} />
        )}

        {view === 'dashboard' && (
          <Dashboard 
            submissions={submissions} 
            onExit={handleAdminLogout}
          />
        )}
      </main>
    </div>
  );
}