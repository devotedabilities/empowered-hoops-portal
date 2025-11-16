import { useState, useEffect } from 'react';
import './SessionCoaches.css';

function SessionCoaches({ 
  sessionNumber, 
  termCoaches, 
  sessionCoaches, 
  spreadsheetId, 
  programType,
  isAdmin,
  userEmail,
  onUpdate 
}) {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoaches, setSelectedCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCoaches();
    // Set initial selected coaches (session-specific or fallback to term)
    if (sessionCoaches && sessionCoaches.coaches) {
      setSelectedCoaches(sessionCoaches.coaches);
    } else if (termCoaches) {
      setSelectedCoaches(termCoaches);
    }
  }, [sessionCoaches, termCoaches]);

  const fetchCoaches = async () => {
    try {
      const response = await fetch(
        'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/listUsers'
      );
      
      const data = await response.json();
      if (data.success) {
        const coachList = data.users
          .filter(user => user.role === 'coach' && user.status === 'ACTIVE')
          .map(user => ({
            email: user.email,
            name: user.name || user.email.split('@')[0],
          }));
        setCoaches(coachList);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoach = (email) => {
    if (selectedCoaches.includes(email)) {
      setSelectedCoaches(selectedCoaches.filter(e => e !== email));
    } else {
      setSelectedCoaches([...selectedCoaches, email]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/updateSessionCoaches',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadsheetId,
            sheetName: programType,
            sessionNumber,
            coaches: selectedCoaches,
            markedBy: userEmail
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error saving coaches:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to previous state
    if (sessionCoaches && sessionCoaches.coaches) {
      setSelectedCoaches(sessionCoaches.coaches);
    } else if (termCoaches) {
      setSelectedCoaches(termCoaches);
    }
    setIsEditing(false);
  };

  const getCoachName = (email) => {
    const coach = coaches.find(c => c.email === email);
    return coach ? coach.name : email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="session-coaches">
        <p>Loading coaches...</p>
      </div>
    );
  }

  // READ-ONLY VIEW (for regular coaches)
  if (!isAdmin && !isEditing) {
    return (
      <div className="session-coaches">
        <div className="session-coaches-header">
          <h3>👥 Coaches for Session {sessionNumber}</h3>
        </div>
        <div className="coaches-list-readonly">
          {selectedCoaches.length > 0 ? (
            selectedCoaches.map(email => (
              <span key={email} className="coach-badge">
                {getCoachName(email)}
              </span>
            ))
          ) : (
            <p className="no-coaches">No coaches assigned</p>
          )}
        </div>
        {sessionCoaches?.markedBy && (
          <p className="metadata-text">
            Last updated by {sessionCoaches.markedBy.split('@')[0]} on {sessionCoaches.markedAt}
          </p>
        )}
      </div>
    );
  }

  // ADMIN VIEW (can edit)
  if (!isEditing) {
    return (
      <div className="session-coaches">
        <div className="session-coaches-header">
          <h3>👥 Coaches for Session {sessionNumber}</h3>
          {isAdmin && (
            <button 
              className="btn-edit-coaches" 
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit
            </button>
          )}
        </div>
        <div className="coaches-list-readonly">
          {selectedCoaches.length > 0 ? (
            selectedCoaches.map(email => (
              <span key={email} className="coach-badge">
                {getCoachName(email)}
              </span>
            ))
          ) : (
            <p className="no-coaches">No coaches assigned</p>
          )}
        </div>
        {sessionCoaches?.markedBy && (
          <p className="metadata-text">
            Last updated by {sessionCoaches.markedBy.split('@')[0]} on {sessionCoaches.markedAt}
          </p>
        )}
      </div>
    );
  }

  // EDITING MODE (admin only)
  return (
    <div className="session-coaches editing">
      <div className="session-coaches-header">
        <h3>✏️ Edit Coaches for Session {sessionNumber}</h3>
      </div>
      
      <p className="edit-help-text">
        Select coaches working this session. Defaults to term-assigned coaches.
      </p>

      <div className="coaches-grid">
        {coaches.map(coach => (
          <button
            key={coach.email}
            type="button"
            onClick={() => toggleCoach(coach.email)}
            className={`coach-select-btn ${selectedCoaches.includes(coach.email) ? 'selected' : ''}`}
          >
            <span className="coach-icon">
              {selectedCoaches.includes(coach.email) ? '✓' : '○'}
            </span>
            <span className="coach-name">{coach.name}</span>
          </button>
        ))}
      </div>

      <div className="edit-actions">
        <button 
          className="btn-cancel" 
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button 
          className="btn-save-coaches" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Coaches'}
        </button>
      </div>
    </div>
  );
}

export default SessionCoaches;
