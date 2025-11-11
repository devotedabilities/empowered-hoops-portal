import { useState } from 'react';
import LoadingModal from '../LoadingModal';

function AthleteForm({ athletes, setAthletes, onBack, onSubmit, loading, error }) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentAthlete, setCurrentAthlete] = useState({
    name: '',
    ratio: '',
    paidStatus: '',
    guardianName: '',
    guardianRelationship: '',
    phone: '',
    email: '',
  });

  const handleAddOrUpdateAthlete = () => {
    if (currentAthlete.name.trim()) {
      if (editingIndex !== null) {
        // Update existing athlete
        const updatedAthletes = [...athletes];
        updatedAthletes[editingIndex] = currentAthlete;
        setAthletes(updatedAthletes);
        setEditingIndex(null);
      } else {
        // Add new athlete
        setAthletes([...athletes, currentAthlete]);
      }
      
      // Reset form
      setCurrentAthlete({
        name: '',
        ratio: '',
        paidStatus: '',
        guardianName: '',
        guardianRelationship: '',
        phone: '',
        email: '',
      });
      setShowForm(false);
    }
  };

  const handleEditAthlete = (index) => {
    setCurrentAthlete(athletes[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setCurrentAthlete({
      name: '',
      ratio: '',
      paidStatus: '',
      guardianName: '',
      guardianRelationship: '',
      phone: '',
      email: '',
    });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleRemoveAthlete = (index) => {
    setAthletes(athletes.filter((_, i) => i !== index));
    // If we're editing this athlete, cancel the edit
    if (editingIndex === index) {
      handleCancelEdit();
    } else if (editingIndex !== null && editingIndex > index) {
      // Adjust editing index if we removed an athlete before it
      setEditingIndex(editingIndex - 1);
    }
  };

  return (
    <div className="form-container">
      <h2>Step 2: Add Athletes</h2>
      
   <LoadingModal isLoading={loading} />

      {error && (
        <div className="error-banner">
          <span>{error}</span>
        </div>
      )}
      
      <button
        className="btn-secondary"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => {
          if (showForm && editingIndex !== null) {
            handleCancelEdit();
          } else {
            setShowForm(!showForm);
          }
        }}
      >
        {showForm ? '✕ Cancel' : '+ Add Athlete'}
      </button>
      
      {showForm && (
        <div className="add-athlete-section">
          {editingIndex !== null && (
            <div className="editing-notice">
              ✏️ <strong>Editing:</strong> {athletes[editingIndex].name}
            </div>
          )}
          
          <h3>{editingIndex !== null ? 'Edit Athlete' : 'Add New Athlete'}</h3>
          
          <div className="form-group">
            <label htmlFor="athleteName">
              Athlete Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="athleteName"
              placeholder="e.g., Kobe Bryant"
              value={currentAthlete.name}
              onChange={(e) => setCurrentAthlete({ ...currentAthlete, name: e.target.value })}
            />
          </div>
          
          <div className="section-title">Guardian Information</div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guardianName">Guardian Name</label>
              <input
                type="text"
                id="guardianName"
                placeholder="e.g., Sarah Smith"
                value={currentAthlete.guardianName}
                onChange={(e) => setCurrentAthlete({ ...currentAthlete, guardianName: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="guardianRelationship">Relationship</label>
              <input
                type="text"
                id="guardianRelationship"
                placeholder="e.g., Mother, Father"
                value={currentAthlete.guardianRelationship}
                onChange={(e) => setCurrentAthlete({ ...currentAthlete, guardianRelationship: e.target.value })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              placeholder="e.g., 0412345678"
              value={currentAthlete.phone}
              onChange={(e) => setCurrentAthlete({ ...currentAthlete, phone: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="e.g., kobe@jobnotfinished.com"
              value={currentAthlete.email}
              onChange={(e) => setCurrentAthlete({ ...currentAthlete, email: e.target.value })}
            />
          </div>

          <div className="office-note">
            Office use
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ratio">Ratio</label>
              <select
                id="ratio"
                value={currentAthlete.ratio}
                onChange={(e) => setCurrentAthlete({ ...currentAthlete, ratio: e.target.value })}
              >
                <option value="">-- Select Ratio --</option>
                <option value="...">- Pending -</option>
                <option value="1:1">1:1</option>
                <option value="1:2">1:2</option>
                <option value="1:3">1:3</option>
                <option value="1:4">1:4</option>
                <option value="1:5">1:5</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="paidStatus">Payment Status</label>
              <select
                id="paidStatus"
                value={currentAthlete.paidStatus}
                onChange={(e) => setCurrentAthlete({ ...currentAthlete, paidStatus: e.target.value })}
              >
                <option value="">-- Select Status --</option>
                <option value="Pending">- Pending -</option>
                <option value="Confirmed Full Term">Confirmed Full Term</option>
                <option value="Signed SA">Signed SA</option>
                <option value="Paid Full Term">Paid Full Term</option>
              </select>
            </div>
          </div>
          
          <button 
            className="btn-primary btn-add-athlete" 
            onClick={handleAddOrUpdateAthlete}
            disabled={!currentAthlete.name.trim()}
          >
            {editingIndex !== null ? '✓ Update Athlete' : '+ Add Athlete'}
          </button>
        </div>
      )}
      
      <div className="athletes-list">
        <h3>Athletes ({athletes.length})</h3>
        {athletes.length === 0 && (
          <p className="empty-message">
            No athletes added yet. Click "+ Add Athlete" to start.
          </p>
        )}
        
        <div className="athlete-cards">
          {athletes.map((athlete, index) => (
            <div key={index} className="athlete-card">
              <div className="athlete-info">
                <h4>{athlete.name}</h4>
                <div className="athlete-details">
                  {athlete.ratio && (
                    <span className="badge">{athlete.ratio}</span>
                  )}
                  {athlete.paidStatus && (
                    <span className="badge-secondary">{athlete.paidStatus}</span>
                  )}
                </div>
                {athlete.guardianName && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                    👤 Guardian: {athlete.guardianName}
                    {athlete.guardianRelationship && ` (${athlete.guardianRelationship})`}
                  </p>
                )}
                {athlete.phone && (
                  <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#666' }}>
                    📱 {athlete.phone}
                  </p>
                )}
                {athlete.email && (
                  <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#666' }}>
                    ✉️ {athlete.email}
                  </p>
                )}
              </div>
              <div className="athlete-actions">
                <button
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => handleEditAthlete(index)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveAthlete(index)}
                  title="Remove athlete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="form-actions">
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn-primary"
          onClick={onSubmit}
          disabled={athletes.length === 0 || loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating...
            </>
          ) : (
            'Create Tracker'
          )}
        </button>
      </div>
    </div>
  );
}

export default AthleteForm;
