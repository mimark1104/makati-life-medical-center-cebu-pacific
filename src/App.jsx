import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AssessmentForm from './components/AssessmentForm';
import ResultScreen from './components/ResultScreen';
import AdminAuth from './components/AdminAuth';
import Dashboard from './components/Dashboard';
import { supabase } from './services/supabaseClient';

export default function App() {
  const [view, setView] = useState('assessment');
  const [currentResult, setCurrentResult] = useState(null);

  const [isAdminAuthed, setIsAdminAuthed] = useState(() => {
    return localStorage.getItem('makati_admin_auth') === 'true';
  });

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial records from Supabase on load
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map(row => ({
          id: row.id,
          date: row.date,
          name: row.name,
          email: row.email,
          phone: row.phone,
          privacyConsent: row.privacy_consent,
          route: row.route,
          counts: row.counts,
          answers: row.answers,
          requestedFollowUp: row.requested_follow_up
        }));

        setSubmissions(formatted);
      } catch (err) {
        console.error('Error loading submissions from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

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

  const handleAssessmentComplete = async (newRecord) => {
    setCurrentResult(newRecord);
    setView('result');

    try {
      const { error } = await supabase.from('submissions').insert([
        {
          id: newRecord.id,
          date: newRecord.date,
          name: newRecord.name,
          email: newRecord.email,
          phone: newRecord.phone,
          privacy_consent: newRecord.privacyConsent,
          route: newRecord.route,
          counts: newRecord.counts,
          answers: newRecord.answers,
          requested_follow_up: newRecord.requestedFollowUp
        }
      ]);

      if (error) {
        console.error('Error saving submission to Supabase:', error.message);
      } else {
        setSubmissions(prev => [newRecord, ...prev]);
      }
    } catch (err) {
      console.error('Unexpected error saving to Supabase:', err);
    }
  };

  const handleFollowUpRequest = async (subId) => {
    setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, requestedFollowUp: true } : s));
    if (currentResult && currentResult.id === subId) {
      setCurrentResult(prev => ({ ...prev, requestedFollowUp: true }));
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .update({ requested_follow_up: true })
        .eq('id', subId);

      if (error) {
        console.error('Error updating follow-up status in Supabase:', error.message);
      }
    } catch (err) {
      console.error('Unexpected error updating follow-up:', err);
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
      
      {/* NAVBAR ONLY SHOWS ON DASHBOARD VIEW */}
      {isDashboardView && <Navbar onRestart={restartAssessment} />}

      <main style={{ 
        flex: 1, 
        width: '100%', 
        maxWidth: isDashboardView ? '1280px' : '500px', 
        margin: '0 auto', 
        padding: isDashboardView ? '2rem 1.5rem' : '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Centers vertically
        alignItems: 'center'      // Centers horizontally
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