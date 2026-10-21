import React, { useState, useEffect } from 'react';
import { QUESTIONS } from '../data/questions';
import { supabase } from '../services/supabaseClient';

export default function Dashboard({ onExit }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [followUpFilter, setFollowUpFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  // Fetch submissions from Supabase Database
  const fetchSubmissions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database columns to component properties
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
      console.error('Error fetching census data:', err);
      setErrorMsg('Failed to load submissions from database. Please check your Supabase credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Delete individual submission by ID
  const handleDeleteSubmission = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete the submission for ${name || 'this participant'} (ID: #${id})? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from UI state immediately
      setSubmissions(prev => prev.filter(item => item.id !== id));

      // Close modal if deleting selected record
      if (selected && selected.id === id) {
        setSelected(null);
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete submission: ' + err.message);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getStatusBadge = (route) => {
    switch (route) {
      case 'ROUTE_A':
        return {
          label: 'Health Check-In Recommended',
          bg: '#fef2f2',
          color: '#991b1b',
          border: '#f87171'
        };
      case 'ROUTE_B':
        return {
          label: 'Pre-Flight Wellness Check Recommended',
          bg: '#fffbeb',
          color: '#92400e',
          border: '#facc15'
        };
      case 'ROUTE_C':
      default:
        return {
          label: 'Ready for Your Wellness Journey',
          bg: '#eef4fc',
          color: '#174b85',
          border: '#93c5fd'
        };
    }
  };

  const getScoreBadgeStyle = (score) => {
    if (score === 2) {
      return { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
    }
    if (score === 1) {
      return { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' };
    }
    return { bg: '#eef4fc', color: '#174b85', border: '#bfdbfe' };
  };

  const calculateTotalScore = (counts) => {
    if (!counts) return 0;
    const c0 = counts[0] ?? counts['0'] ?? 0;
    const c1 = counts[1] ?? counts['1'] ?? 0;
    const c2 = counts[2] ?? counts['2'] ?? 0;
    return (c0 * 0) + (c1 * 1) + (c2 * 2);
  };

  const filtered = (submissions || []).filter(s => {
    if (!s) return false;
    const query = (search || '').toLowerCase();
    
    const matchesSearch = 
      (s.name && s.name.toLowerCase().includes(query)) || 
      (s.email && s.email.toLowerCase().includes(query)) ||
      (s.phone && s.phone.toLowerCase().includes(query)) ||
      (s.id && s.id.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'ALL' || s.route === statusFilter;

    const matchesFollowUp = 
      followUpFilter === 'ALL' || 
      (followUpFilter === 'YES' && s.requestedFollowUp) || 
      (followUpFilter === 'NO' && !s.requestedFollowUp);

    return matchesSearch && matchesStatus && matchesFollowUp;
  });

  const totalSubmissions = submissions?.length || 0;
  const routeACount = (submissions || []).filter(s => s?.route === 'ROUTE_A').length;
  const routeBCount = (submissions || []).filter(s => s?.route === 'ROUTE_B').length;
  const routeCCount = (submissions || []).filter(s => s?.route === 'ROUTE_C').length;
  const requestedFollowUpCount = (submissions || []).filter(s => s?.requestedFollowUp).length;

  const handleExportCSV = () => {
    if (!filtered || filtered.length === 0) {
      alert("No submission data available to export.");
      return;
    }

    const headers = [
      "Submission ID", "Date", "Name", "Email", "Mobile Number", "Privacy Consent", 
      "Clinical Triage Status", "Total Score", "Score 0 Count", 
      "Score 1 Count", "Score 2 Count", "Requested Follow-Up"
    ];
    
    const rows = filtered.map(s => {
      const statusInfo = getStatusBadge(s?.route);
      const totalScore = calculateTotalScore(s?.counts);
      const c0 = s?.counts?.[0] ?? s?.counts?.['0'] ?? 0;
      const c1 = s?.counts?.[1] ?? s?.counts?.['1'] ?? 0;
      const c2 = s?.counts?.[2] ?? s?.counts?.['2'] ?? 0;

      return [
        `"${s?.id || ''}"`,
        `"${s?.date || ''}"`,
        `"${(s?.name || '').replace(/"/g, '""')}"`,
        `"${(s?.email || '').replace(/"/g, '""')}"`,
        `"${(s?.phone || '').replace(/"/g, '""')}"`,
        s?.privacyConsent ? "Agreed (R.A. 10173)" : "No",
        `"${statusInfo.label}"`,
        totalScore,
        c0,
        c1,
        c2,
        s?.requestedFollowUp ? "Yes" : "No"
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MakatiLife_Wellness_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* HEADER BAR */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem 2rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#174b85', marginBottom: '0.25rem' }}>
            <span>ADMINISTRATION PORTAL</span>
            <span>/</span>
            <span>WELLNESS ASSESSMENT</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Participant Lead Census</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>Makati Life Medical Center — Live Triage Analytics & Database Sync</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            type="button"
            className="btn-secondary"
            style={{ padding: '0.65rem 1rem', fontSize: '0.875rem', borderRadius: '10px', background: '#f1f5f9', color: '#1e293b' }}
            onClick={fetchSubmissions}
          >
            🔄 Refresh Data
          </button>
          <button 
            type="button"
            className="btn-dark" 
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
            onClick={handleExportCSV}
          >
            <span>📥</span> Export CSV Report
          </button>
          <button 
            type="button"
            className="btn-secondary" 
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem', borderRadius: '10px', background: '#f1f5f9', color: '#334155' }} 
            onClick={onExit}
          >
            Exit Portal
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1rem', borderRadius: '12px', fontSize: '0.875rem' }}>
          {errorMsg}
        </div>
      )}

      {/* METRIC STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>TOTAL SUBMISSIONS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{loading ? '...' : totalSubmissions}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Participants evaluated</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#dc2626', letterSpacing: '0.05em' }}>HEALTH CHECK-IN</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626', marginTop: '0.35rem' }}>{loading ? '...' : routeACount}</div>
          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.2rem' }}>High Priority (Route A)</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#d97706', letterSpacing: '0.05em' }}>PRE-FLIGHT CHECK</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>{loading ? '...' : routeBCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.2rem' }}>Standard Priority (Route B)</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #b6d3f2', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#174b85', letterSpacing: '0.05em' }}>READY FOR JOURNEY</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#174b85', marginTop: '0.35rem' }}>{loading ? '...' : routeCCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.2rem' }}>Low / Routine (Route C)</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#16a34a', letterSpacing: '0.05em' }}>FOLLOW-UP REQUESTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>{loading ? '...' : requestedFollowUpCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.2rem' }}>Opted-in for contact</div>
        </div>
      </div>

      {/* CENSUS DATA TABLE & CONTROLS */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Search & Filter Toolbar */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
              <input 
                type="text" 
                placeholder="Search name, email, phone, or ID..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.65rem 1rem 0.65rem 2.25rem', 
                  borderRadius: '10px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.85rem', 
                  outline: 'none' 
                }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}>🔍</span>
            </div>

            {/* Custom Wrapper for Status Filter */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                style={{ 
                  padding: '0.65rem 2.5rem 0.65rem 1rem', 
                  borderRadius: '10px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.85rem', 
                  outline: 'none', 
                  background: '#ffffff', 
                  color: '#0f172a', 
                  fontWeight: 600,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Triage Statuses</option>
                <option value="ROUTE_A">Health Check-In Recommended (Route A)</option>
                <option value="ROUTE_B">Pre-Flight Wellness Check (Route B)</option>
                <option value="ROUTE_C">Ready for Journey (Route C)</option>
              </select>
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b', fontSize: '0.7rem' }}>▼</span>
            </div>

            {/* Custom Wrapper for Follow-Up Filter */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select 
                value={followUpFilter} 
                onChange={e => setFollowUpFilter(e.target.value)}
                style={{ 
                  padding: '0.65rem 2.5rem 0.65rem 1rem', 
                  borderRadius: '10px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.85rem', 
                  outline: 'none', 
                  background: '#ffffff', 
                  color: '#0f172a', 
                  fontWeight: 600,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Follow-Up Preferences</option>
                <option value="YES">Requested Follow-Up Only</option>
                <option value="NO">No Follow-Up Requested</option>
              </select>
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b', fontSize: '0.7rem' }}>▼</span>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filtered.length} of {totalSubmissions} records
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '0.725rem', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Date & Time</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Participant Name</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Email Address</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Mobile Number</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Consent</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>Triage Status</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, textAlign: 'center' }}>Total Score</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, textAlign: 'center' }}>Follow-Up</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Loading participant database records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                    No participant records found in Supabase database matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sub, idx) => {
                  const statusInfo = getStatusBadge(sub?.route);
                  const totalScore = calculateTotalScore(sub?.counts);

                  return (
                    <tr 
                      key={sub?.id || idx} 
                      style={{ 
                        borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', 
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#174b85' }}>{sub?.id || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{sub?.date || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>{sub?.name || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>{sub?.email || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#475569', whiteSpace: 'nowrap' }}>{sub?.phone || '—'}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: sub?.privacyConsent ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                          {sub?.privacyConsent ? '✓ R.A. 10173' : '✕ Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.border}`,
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                        {totalScore} <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>/ 8</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontWeight: 800, 
                          fontSize: '0.75rem', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '6px',
                          background: sub?.requestedFollowUp ? '#f0fdf4' : '#f1f5f9',
                          color: sub?.requestedFollowUp ? '#16a34a' : '#94a3b8' 
                        }}>
                          {sub?.requestedFollowUp ? '✓ YES' : 'NO'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            type="button"
                            className="btn-secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.775rem', borderRadius: '8px', cursor: 'pointer' }} 
                            onClick={() => setSelected(sub)}
                          >
                            View Details
                          </button>
                          <button 
                            type="button"
                            style={{ 
                              padding: '0.4rem 0.6rem', 
                              fontSize: '0.775rem', 
                              borderRadius: '8px', 
                              cursor: 'pointer',
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              fontWeight: 600
                            }} 
                            onClick={() => handleDeleteSubmission(sub.id, sub.name)}
                            title="Delete Submission"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.75rem', maxWidth: '540px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{selected.name || 'Participant Details'}</h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.15rem' }}>{selected.email} • {selected.phone || 'No phone'} • {selected.date}</p>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div><strong>Submission ID:</strong> {selected.id}</div>
                <div><strong>Mobile Number:</strong> {selected.phone || 'Not provided'}</div>
                <div><strong>Clinical Status:</strong> {getStatusBadge(selected.route).label}</div>
                <div><strong>Calculated Total Score:</strong> {calculateTotalScore(selected.counts)} points</div>
                <div><strong>Privacy Agreement:</strong> {selected.privacyConsent ? 'Agreed (R.A. 10173)' : 'No'}</div>
                <div><strong>Follow-Up Requested:</strong> {selected.requestedFollowUp ? 'Yes' : 'No'}</div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>
                  Participant's Assessment Choices:
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(QUESTIONS || []).map((q, qIdx) => {
                    let score = selected.answers?.[q.id];
                    if (score === undefined) score = selected.answers?.[qIdx + 1];
                    if (score === undefined) score = selected.answers?.[qIdx];
                    if (score === undefined) score = 0;

                    const chosenOption = q.options?.find(opt => opt.score === score) || q.options?.[0];
                    const badgeStyle = getScoreBadgeStyle(score);

                    return (
                      <div key={q.id || qIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.875rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#174b85', marginBottom: '0.2rem' }}>
                          QUESTION {qIdx + 1}: {(q.category || '').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                          {q.text}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                          <span>{chosenOption ? chosenOption.icon : '📌'}</span>
                          <div style={{ flex: 1 }}>
                            <strong style={{ color: '#1e293b' }}>{chosenOption ? chosenOption.label : 'Option Selected'}</strong>
                            {chosenOption && <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{chosenOption.subtitle}</div>}
                          </div>
                          
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 800, 
                            padding: '0.25rem 0.65rem', 
                            borderRadius: '6px', 
                            background: badgeStyle.bg, 
                            color: badgeStyle.color,
                            border: `1px solid ${badgeStyle.border}`,
                            whiteSpace: 'nowrap'
                          }}>
                            Score: {score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                style={{ 
                  padding: '0.85rem 1rem', 
                  borderRadius: '10px', 
                  border: '1px solid #fca5a5', 
                  background: '#fef2f2', 
                  color: '#dc2626', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }} 
                onClick={() => handleDeleteSubmission(selected.id, selected.name)}
              >
                Delete Record
              </button>
              <button 
                type="button" 
                className="btn-dark" 
                style={{ flex: 1, padding: '0.85rem' }} 
                onClick={() => setSelected(null)}
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}