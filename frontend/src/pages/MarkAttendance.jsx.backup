import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './MarkAttendance.css';
import CoachNotes from '../components/CoachNotes';
import { noteToDisplayText } from '../utils/coachNotesSchema';

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

  // Coach notes state
  const [showNotesSection, setShowNotesSection] = useState(false);
  const [currentNoteAthlete, setCurrentNoteAthlete] = useState(null);
  const [athleteNotes, setAthleteNotes] = useState({});
  

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
      `https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/getAttendanceData?spreadsheetId=${spreadsheetId}&sheetName=${encodeURIComponent(programType)}`
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
      'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/updateAttendance',
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
          termConfig: termConfig,
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
      // Show notes section after successful save
      setShowNotesSection(true);
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

const handleNoteSave = (athleteId, noteObject) => {
  setAthleteNotes(prev => ({
    ...prev,
    [athleteId]: noteObject
  }));
  setCurrentNoteAthlete(null);
};

const handleSkipNote = () => {
  setCurrentNoteAthlete(null);
};

const handleSaveAllNotes = async () => {
  console.log('Saving all notes for session:', selectedSession);
  setSaving(true);

  try {
    const response = await fetch(
      'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/updateSessionNotes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: spreadsheetId,
          sheetName: programType,
          sessionNumber: selectedSession,
          notes: athleteNotes,
          termConfig: termConfig,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save notes');
    }

    const data = await response.json();

    if (data.success) {
      setSaveSuccess(true);
      setShowNotesSection(false);
      setAthleteNotes({});
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      throw new Error(data.message || 'Failed to save notes');
    }
  } catch (err) {
    console.error('Save notes error:', err);
    setError('Failed to save notes: ' + err.message);
  } finally {
    setSaving(false);
  }
};

const handleFinishWithoutNotes = () => {
  setShowNotesSection(false);
  setAthleteNotes({});
};

const getAttendedAthletes = () => {
  return athletes.filter(athlete => attendance[athlete.id]?.[selectedSession]);
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

      {/* Coach Notes Section */}
      {showNotesSection && !currentNoteAthlete && (
        <div className="notes-section">
          <div className="notes-header">
            <h2>📝 Session Notes</h2>
            <p>Add notes for athletes who attended Session {selectedSession}</p>
          </div>

          <div className="notes-athlete-list">
            {getAttendedAthletes().map(athlete => (
              <div key={athlete.id} className="note-athlete-item">
                <div className="note-athlete-info">
                  <span className="note-athlete-name">{athlete.name}</span>
                  {athleteNotes[athlete.id] && (
                    <span className="note-preview">
                      {noteToDisplayText(athleteNotes[athlete.id])}
                    </span>
                  )}
                </div>
                <button
                  className="btn-add-note"
                  onClick={() => setCurrentNoteAthlete(athlete)}
                >
                  {athleteNotes[athlete.id] ? '✏️ Edit Note' : '➕ Add Note'}
                </button>
              </div>
            ))}
          </div>

          <div className="notes-actions">
            <button
              className="btn-finish-without-notes"
              onClick={handleFinishWithoutNotes}
            >
              Finish Without Notes
            </button>
            <button
              className="btn-save-all-notes"
              onClick={handleSaveAllNotes}
              disabled={Object.keys(athleteNotes).length === 0 || saving}
            >
              {saving ? (
                <>
                  <span className="spinner-small"></span> Saving Notes...
                </>
              ) : (
                `💾 Save ${Object.keys(athleteNotes).length} Note${Object.keys(athleteNotes).length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Coach Notes Modal */}
      {currentNoteAthlete && (
        <div className="modal-overlay" onClick={handleSkipNote}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CoachNotes
              athleteName={currentNoteAthlete.name}
              onNoteSave={(noteObj) => handleNoteSave(currentNoteAthlete.id, noteObj)}
              onCancel={handleSkipNote}
              initialNote={athleteNotes[currentNoteAthlete.id]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkAttendance;