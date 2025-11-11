import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './MarkAttendance.css';

function MarkAttendance() {
  const { trackerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { trackerName, programType, spreadsheetId } = location.state || {};
  
  const [selectedSession, setSelectedSession] = useState('1');
  const [athletes, setAthletes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [termConfig, setTermConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  

  // Generate session options (1-10)


  useEffect(() => {
    if (spreadsheetId) {
      fetchAttendanceData();
    }
  }, [spreadsheetId]);

const fetchAttendanceData = async () => {
  console.log('Fetching data for spreadsheetId:', spreadsheetId);
  console.log('Program type:', programType);
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `https://australia-southeast1-empowered-hoops-term-tracker.cloudfunctions.net/getAttendanceData?spreadsheetId=${spreadsheetId}&sheetName=${encodeURIComponent(programType)}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch attendance data');
    }

    const data = await response.json();
    console.log('Attendance data:', data);
    
    if (data.success) {
      setAthletes(data.athletes);
      setSessions(data.sessions);
      
      // Store term config for later use
      if (data.termConfig) {
        setTermConfig(data.termConfig);
      } else {
        // Build termConfig from available data
        setTermConfig({
          programLabel: `${programType} — ${trackerName}`,
          coachName: 'Unknown Coach',
          duration: 1.5,
          programType: programType
        });
      }
      
      // Initialize attendance state
      const initialAttendance = {};
      data.athletes.forEach(athlete => {
        initialAttendance[athlete.id] = data.attendance[athlete.id] || {};
      });
      setAttendance(initialAttendance);
    } else {
      throw new Error(data.message || 'Failed to fetch attendance data');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

 const toggleAttendance = (athleteId) => {
  setAttendance(prev => ({
    ...prev,
    [athleteId]: {
      ...prev[athleteId],
      [selectedSession]: !prev[athleteId]?.[selectedSession]
    }
  }));
};

const handleSave = async () => {
  console.log('Saving attendance for session:', selectedSession);
  setSaving(true);
  setSaveSuccess(false);
  
  try {
    const response = await fetch(
      'https://australia-southeast1-empowered-hoops-term-tracker.cloudfunctions.net/updateAttendance',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: spreadsheetId,
          sheetName: programType,
          sessionNumber: selectedSession,
          attendance: Object.fromEntries(
            Object.entries(attendance).map(([athleteId, sessions]) => [
              athleteId,
              sessions[selectedSession] || false
            ])
          ),
          termConfig: termConfig, // ← ADD THIS
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update attendance');
    }

    const data = await response.json();
    
    if (data.success) {
      setSaveSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      throw new Error(data.message || 'Failed to save');
    }
  } catch (err) {
    console.error('Save error:', err);
    setError('Failed to save: ' + err.message);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="mark-attendance-page">
      <div className="attendance-header">
        <button className="btn-back" onClick={() => navigate('/term-tracker')}>
          ← Back to Trackers
        </button>
        <div className="header-info">
          <h1>✓ Mark Attendance</h1>
          <p className="tracker-info">
            <span className="program-badge-small">{programType}</span>
            {trackerName}
          </p>
        </div>
      </div>

    <div className="session-selector">
  <label>Session:</label>
  <select
    value={selectedSession}
    onChange={(e) => setSelectedSession(e.target.value)}
    className="session-select"
  >
    {sessions.length > 0 ? (
      sessions.map(session => (
        <option key={session.number} value={session.number}>
          Session {session.number} - {session.formatted}
        </option>
      ))
    ) : (
      Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
        <option key={num} value={num}>Session {num}</option>
      ))
    )}
  </select>
  
  <button 
    className="btn-refresh" 
    onClick={fetchAttendanceData}
    disabled={loading}
    title="Refresh athlete list"
  >
    {loading ? '◷' : '🔄'} Refresh
  </button>

  <button 
    className="btn-open-sheet"
    onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`, '_blank')}
    title="Open spreadsheet in new tab"
  >
    📊 Open Spreadsheet
  </button>
</div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading athletes...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="athletes-list">
            {athletes.map(athlete => (
              <div key={athlete.id} className="athlete-item">
                <label className="athlete-checkbox">
                 <input
  type="checkbox"
  checked={attendance[athlete.id]?.[selectedSession] || false}
  onChange={() => toggleAttendance(athlete.id)}
/>
                  <span className="checkbox-custom"></span>
                  <span className="athlete-name">{athlete.name}</span>
                </label>
              </div>
            ))}
          </div>

         <div className="attendance-summary">
  <p>
    <strong>{Object.values(attendance).filter(sessions => sessions[selectedSession]).length}</strong> of{' '}
    <strong>{athletes.length}</strong> athletes attended
  </p>
</div>

<button
  className="btn-save-attendance"
  onClick={handleSave}
  disabled={saving}
>
  {saving ? (
    <>
      <span className="spinner-small"></span> Saving...
    </>
  ) : (
    '💾 Save Attendance'
  )}
</button>

{saveSuccess && (
  <div className="success-toast">
    🎉 Saved!
  </div>
)}
        </>
      )}
    </div>
  );
}

export default MarkAttendance;