import { useState, useEffect } from 'react';
import './CoachSelector.css';

function CoachSelector({ selectedCoaches, onChange }) {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/listUsers'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch coaches');
      }

      const data = await response.json();
      
      if (data.success) {
        // Filter to only show active coaches (not admins)
        const coachList = data.users
          .filter(user => user.role === 'coach' && user.status === 'ACTIVE')
          .map(user => ({
            email: user.email,
            name: user.name || user.email.split('@')[0],
          }));
        
        setCoaches(coachList);
      } else {
        throw new Error(data.message || 'Failed to load coaches');
      }
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCoach = (email) => {
    if (selectedCoaches.includes(email)) {
      onChange(selectedCoaches.filter(e => e !== email));
    } else {
      onChange([...selectedCoaches, email]);
    }
  };

  const selectAll = () => {
    onChange(coaches.map(c => c.email));
  };

  const clearAll = () => {
    onChange([]);
  };

  if (loading) {
    return (
      <div className="coach-selector">
        <label className="coach-selector-label">
          Assign Coaches (Optional)
        </label>
        <div className="coach-selector-loading">
          <span className="spinner-small"></span>
          <span>Loading coaches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coach-selector">
        <label className="coach-selector-label">
          Assign Coaches (Optional)
        </label>
        <div className="coach-selector-error">
          <span>⚠️ Failed to load coaches</span>
          <button onClick={fetchCoaches} className="btn-retry-small">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-selector">
      <label className="coach-selector-label">
        Assign Coaches (Optional)
      </label>
      <p className="coach-selector-description">
        Select which coaches can view and mark attendance for this tracker
      </p>

      <div className="coach-selector-actions">
        <button
          type="button"
          onClick={selectAll}
          className="btn-select-action"
          disabled={selectedCoaches.length === coaches.length}
        >
          Select All
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="btn-select-action"
          disabled={selectedCoaches.length === 0}
        >
          Clear All
        </button>
        <span className="coach-count">
          {selectedCoaches.length} selected
        </span>
      </div>

      <div className="coach-buttons-grid">
        {coaches.map((coach) => (
          <button
            key={coach.email}
            type="button"
            onClick={() => toggleCoach(coach.email)}
            className={`coach-button ${selectedCoaches.includes(coach.email) ? 'selected' : ''}`}
          >
            <span className="coach-button-icon">
              {selectedCoaches.includes(coach.email) ? '✓' : '○'}
            </span>
            <span className="coach-button-name">{coach.name}</span>
          </button>
        ))}
      </div>

      {coaches.length === 0 && (
        <p className="coach-selector-empty">
          No coaches available. Add coaches in User Management first.
        </p>
      )}
    </div>
  );
}

export default CoachSelector;
