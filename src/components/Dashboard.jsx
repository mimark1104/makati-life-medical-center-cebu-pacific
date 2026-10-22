import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function Dashboard({ submissions = [], onExit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [triageFilter, setTriageFilter] = useState('ALL');
  const [followUpFilter, setFollowUpFilter] = useState('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [localSubmissions, setLocalSubmissions] = useState(submissions);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    setLocalSubmissions(submissions);
  }, [submissions]);

  // Question mapping including both the title and descriptive subtext sentence
  const questionMap = {
    q1: {
      title: "1. How would you describe your daily eating and hydration habits?",
      options: { 
        0: { title: "Balanced & Hydrated", text: "I eat balanced meals regularly and stay adequately hydrated." }, 
        1: { title: "Occasional Skips / High Caffeine", text: "I occasionally skip meals or rely heavily on coffee to get through the day." }, 
        2: { title: "Frequent Fatigue / Irregular Meals", text: "I frequently experience fatigue or digestive discomfort, or struggle to maintain regular meals." } 
      }
    },
    q2: {
      title: "2. How active do you feel throughout your day?",
      options: { 
        0: { title: "Regularly Active", text: "I exercise regularly and generally feel energetic." }, 
        1: { title: "Seldom Exercise", text: "I seldom do exercises." }, 
        2: { title: "Minimal Activity & Breathlessness", text: "I have minimal physical activity and often get tired or short of breath with ordinary exertion." } 
      }
    },
    q3: {
      title: "3. How well are you managing your sleep and stress?",
      options: { 
        0: { title: "Restful Sleep & Well-Managed Stress", text: "I usually get enough restful sleep and manage stress well." }, 
        1: { title: "Occasional Fatigue / Stress", text: "I sometimes experience insufficient sleep, stress, or difficulty concentrating." }, 
        2: { title: "Exhausted & Severe Stress", text: "I frequently wake up exhausted or experience significant stress that affects my daily activities." } 
      }
    },
    q4: {
      title: "4. When was your last routine health check-up?",
      options: { 
        0: { title: "Recent Check-Up", text: "Within the past 12 months." }, 
        1: { title: "1 to 2 Years Ago", text: "More than 12 months ago but within the past 2 years." }, 
        2: { title: "Over 2 Years / Unsure", text: "More than 2 years ago, or I cannot remember." } 
      }
    }
  };

  const formatAnswerText = (key, val) => {
    const question = questionMap[key];
    if (!question) return { title: `Question (${key})`, answerTitle: `Choice ${val}`, answerSubtext: '', fullAnswer: `Choice ${val}` };
    
    const option = question.options[val];
    if (!option) return { title: question.title, answerTitle: `Option ${val}`, answerSubtext: '', fullAnswer: `Option ${val}` };

    return { 
      title: question.title, 
      answerTitle: option.title,
      answerSubtext: option.text,
      fullAnswer: `${option.title} - ${option.text}`
    };
  };

  const totalSubmissions = localSubmissions.length;
  
  const healthCheckInCount = localSubmissions.filter(s => 
    s.route === 'ROUTE_A' || s.route === 'PRIORITY_ASSIST'
  ).length;

  const preFlightCheckCount = localSubmissions.filter(s => 
    s.route === 'ROUTE_B' || s.route === 'GENTLE_CARE'
  ).length;

  const readyForJourneyCount = localSubmissions.filter(s => 
    s.route === 'ROUTE_C' || s.route === 'FIT_TO_FLY'
  ).length;

  const followUpRequestsCount = localSubmissions.filter(s => 
    s.requestedFollowUp === 'YES' || 
    s.requestedFollowUp === true || 
    s.requested_follow_up === true ||
    s.requested_follow_up === 'true'
  ).length;

  const getTriageDisplay = (route) => {
    if (route === 'ROUTE_A' || route === 'PRIORITY_ASSIST') return 'Health Check-In';
    if (route === 'ROUTE_B' || route === 'GENTLE_CARE') return 'Pre-Flight Check';
    return 'Ready to Fly';
  };

  const filteredSubmissions = localSubmissions.filter(item => {
    const matchesSearch = 
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesTriage = true;
    if (triageFilter === 'ROUTE_A') {
      matchesTriage = item.route === 'ROUTE_A' || item.route === 'PRIORITY_ASSIST';
    } else if (triageFilter === 'ROUTE_B') {
      matchesTriage = item.route === 'ROUTE_B' || item.route === 'GENTLE_CARE';
    } else if (triageFilter === 'ROUTE_C') {
      matchesTriage = item.route === 'ROUTE_C' || item.route === 'FIT_TO_FLY';
    }

    let matchesFollowUp = true;
    const isFollowUp = 
      item.requestedFollowUp === 'YES' || 
      item.requestedFollowUp === true || 
      item.requested_follow_up === true || 
      item.requested_follow_up === 'true';

    if (followUpFilter === 'YES') {
      matchesFollowUp = isFollowUp;
    } else if (followUpFilter === 'NO') {
      matchesFollowUp = !isFollowUp;
    }

    return matchesSearch && matchesTriage && matchesFollowUp;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete record ${id}?`)) return;

    try {
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) {
        alert('Error deleting record from Supabase: ' + error.message);
      } else {
        setLocalSubmissions(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = [
      'ID', 
      'Date & Time', 
      'Name', 
      'Email', 
      'Phone', 
      'Consent', 
      'Triage Status', 
      'Follow-Up Requested',
      `"${questionMap.q1.title}"`,
      `"${questionMap.q2.title}"`,
      `"${questionMap.q3.title}"`,
      `"${questionMap.q4.title}"`
    ];

    const rows = filteredSubmissions.map(s => {
      const isTrue = s.requestedFollowUp === 'YES' || s.requestedFollowUp === true || s.requested_follow_up === true || s.requested_follow_up === 'true';
      
      const answers = s.answers || {};
      const q1Formatted = formatAnswerText('q1', answers.q1).fullAnswer;
      const q2Formatted = formatAnswerText('q2', answers.q2).fullAnswer;
      const q3Formatted = formatAnswerText('q3', answers.q3).fullAnswer;
      const q4Formatted = formatAnswerText('q4', answers.q4).fullAnswer;

      return [
        `"${s.id || ''}"`,
        `"${s.date || ''}"`,
        `"${s.name || ''}"`,
        `"${s.email || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.privacyConsent ? 'RA 10173 Agreed' : 'No'}"`,
        `"${getTriageDisplay(s.route)}"`,
        `"${isTrue ? 'YES' : 'NO'}"`,
        `"${q1Formatted}"`,
        `"${q2Formatted}"`,
        `"${q3Formatted}"`,
        `"${q4Formatted}"`
      ];
    });

    // Prepend UTF-8 BOM (\uFEFF) so Excel properly detects UTF-8 and removes encoding artifacts like â€“
    const csvString = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wellness_census_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.05em' }}>
            ADMINISTRATION PORTAL / WELLNESS ASSESSMENT
          </span>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0' }}>
            Participant Lead Census
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            Makati Life Medical Center — Live Triage Analytics & Database Sync
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => window.location.reload()} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            🔄 Refresh Data
          </button>
          
          <button type="button" onClick={exportToCSV} style={{ background: '#0f172a', border: 'none', color: '#ffffff', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            📊 Export CSV Report
          </button>

          {onExit && (
            <button type="button" onClick={onExit} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              Exit Portal
            </button>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Submissions</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>{totalSubmissions}</div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Participants evaluated</span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>Health Check-In</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626', margin: '0.1rem 0' }}>{healthCheckInCount}</div>
          <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>High Priority (Route A)</span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fef08a', borderRadius: '10px', padding: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>Pre-Flight Check</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706', margin: '0.1rem 0' }}>{preFlightCheckCount}</div>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Standard Priority (Route B)</span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>Ready For Journey</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb', margin: '0.1rem 0' }}>{readyForJourneyCount}</div>
          <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Low / Routine (Route C)</span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>Follow-Up Requests</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a', margin: '0.1rem 0' }}>{followUpRequestsCount}</div>
          <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>Opted-in for contact</span>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderBottom: 'none', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '0.85rem 1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
          <input 
            type="text" 
            placeholder="🔍 Search name, email, phone..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', width: '220px', outline: 'none' }}
          />

          <select 
            value={triageFilter} 
            onChange={(e) => { setTriageFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#ffffff', color: '#334155' }}
          >
            <option value="ALL">All Triage Statuses</option>
            <option value="ROUTE_A">Health Check-In (Route A)</option>
            <option value="ROUTE_B">Pre-Flight Check (Route B)</option>
            <option value="ROUTE_C">Ready for Journey (Route C)</option>
          </select>

          <select 
            value={followUpFilter} 
            onChange={(e) => { setFollowUpFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#ffffff', color: '#334155' }}
          >
            <option value="ALL">All Follow-Up Preferences</option>
            <option value="YES">Requested Contact (YES)</option>
            <option value="NO">No Contact (NO)</option>
          </select>
        </div>

        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          Showing {paginatedSubmissions.length} of {filteredSubmissions.length} records
        </span>
      </div>

      {/* TABLE */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', flex: 1, overflowY: 'auto', minHeight: '260px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '0.65rem 0.85rem' }}>ID</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Date & Time</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Participant Name</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Email Address</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Mobile Number</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Consent</th>
              <th style={{ padding: '0.65rem 0.85rem' }}>Triage Status</th>
              <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Follow-Up</th>
              <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSubmissions.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No participant records found matching your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedSubmissions.map((sub, idx) => {
                const isFollowUpTrue = 
                  sub.requestedFollowUp === 'YES' || 
                  sub.requestedFollowUp === true || 
                  sub.requested_follow_up === true || 
                  sub.requested_follow_up === 'true';

                const isRouteA = sub.route === 'ROUTE_A' || sub.route === 'PRIORITY_ASSIST';
                const isRouteB = sub.route === 'ROUTE_B' || sub.route === 'GENTLE_CARE';

                return (
                  <tr key={sub.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 800, color: '#1e40af' }}>{sub.id}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>{sub.date || 'N/A'}</td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>{sub.name}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{sub.email}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{sub.phone}</td>
                    
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.725rem' }}>
                        ✓ R.A. 10173
                      </span>
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
                      {isRouteA && (
                        <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.725rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }}></span> Health Check-In
                        </span>
                      )}
                      {isRouteB && (
                        <span style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.725rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span> Pre-Flight Check
                        </span>
                      )}
                      {!isRouteA && !isRouteB && (
                        <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.725rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }}></span> Ready to Fly
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      {isFollowUpTrue ? (
                        <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.725rem', fontWeight: 800 }}>
                          YES
                        </span>
                      ) : (
                        <span style={{ background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 800 }}>
                          NO
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button type="button" onClick={() => setSelectedSubmission(sub)} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '5px', fontSize: '0.725rem', fontWeight: 700, cursor: 'pointer' }}>
                          View Details
                        </button>
                        <button type="button" onClick={() => handleDelete(sub.id)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.25rem 0.4rem', borderRadius: '5px', fontSize: '0.725rem', cursor: 'pointer' }}>
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

      {/* PAGINATION FOOTER */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button 
            type="button" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: '0.3rem 0.6rem', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : '#ffffff', color: currentPage === 1 ? '#cbd5e1' : '#334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              style={{ padding: '0.3rem 0.6rem', border: page === currentPage ? '1px solid #0f172a' : '1px solid #cbd5e1', background: page === currentPage ? '#0f172a' : '#ffffff', color: page === currentPage ? '#ffffff' : '#334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {page}
            </button>
          ))}

          <button 
            type="button" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: '0.3rem 0.6rem', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : '#ffffff', color: currentPage === totalPages ? '#cbd5e1' : '#334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSubmission && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 200 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Participant Record Details</h3>
              <button type="button" onClick={() => setSelectedSubmission(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem' }}>
              <div><strong>Record ID:</strong> {selectedSubmission.id}</div>
              <div><strong>Date & Time:</strong> {selectedSubmission.date}</div>
              <div><strong>Name:</strong> {selectedSubmission.name}</div>
              <div><strong>Email:</strong> {selectedSubmission.email}</div>
              <div><strong>Phone:</strong> {selectedSubmission.phone}</div>
              <div><strong>Privacy Consent:</strong> R.A. 10173 Compliant</div>
              <div><strong>Triage Assigned:</strong> {getTriageDisplay(selectedSubmission.route)}</div>
              <div><strong>Follow-Up Contact Opt-In:</strong> {(selectedSubmission.requestedFollowUp === 'YES' || selectedSubmission.requestedFollowUp === true || selectedSubmission.requested_follow_up === true || selectedSubmission.requested_follow_up === 'true') ? 'YES' : 'NO'}</div>

              {selectedSubmission.answers && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a' }}>Assessment Responses:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(selectedSubmission.answers).map(([key, val]) => {
                      const formatted = formatAnswerText(key, val);
                      return (
                        <div key={key} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                            {formatted.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af' }}>
                            → {formatted.answerTitle}
                          </div>
                          {formatted.answerSubtext && (
                            <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.15rem', fontStyle: 'italic' }}>
                              "{formatted.answerSubtext}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button type="button" onClick={() => setSelectedSubmission(null)} style={{ width: '100%', marginTop: '1.25rem', padding: '0.6rem', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.825rem', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}