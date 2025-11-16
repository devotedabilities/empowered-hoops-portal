import React, { useState, useEffect } from 'react';
import './CoachNotesV2.css';

const CoachNotesV2 = ({ 
  isOpen, 
  onClose, 
  athlete, 
  sessionNumber,
  spreadsheetId,
  sheetName,
  termConfig 
}) => {
  const [activeTab, setActiveTab] = useState('behaviour'); // Start with behaviour tab
  const [existingNotes, setExistingNotes] = useState({ basketball: '', behaviour: '' });
  const [loading, setLoading] = useState(false);

  // Basketball state
  const [basketballEvents, setBasketballEvents] = useState([]);
  const [bbForm, setBbForm] = useState({
    skillId: null,
    outcomeId: null,
    comment: ''
  });

  // Behaviour state
  const [behaviourEvents, setBehaviourEvents] = useState([]);
  const [behaviourForm, setBehaviourForm] = useState({
    momentTypeId: null,
    momentOptionId: null,
    extraDetailIds: [],
    summary: '',
    autoSummary: '',
    userEdited: false
  });

  // Basketball options
  const basketballSkills = [
    { id: 'dribbling', label: 'Dribbling' },
    { id: 'shooting', label: 'Shooting' },
    { id: 'passing', label: 'Passing' },
    { id: 'spacing', label: 'Spacing/Positioning' },
    { id: 'defence', label: 'Defence' }
  ];

  const basketballOutcomes = [
    { id: 'improved', label: 'Improved', color: '#10b981' },
    { id: 'struggled', label: 'Struggled', color: '#ef4444' },
    { id: 'stable', label: 'Same as last', color: '#6b7280' },
    { id: 'notTested', label: 'Not tested', color: '#9ca3af' }
  ];

  // Behaviour options with domains and skills
  const momentTypes = [
    { id: 'positive', label: 'Positive', color: '#10b981', icon: '🟢' },
    { id: 'challenge', label: 'Challenge', color: '#f97316', icon: '🟠' }, // Orange, not red!
    { id: 'standard', label: 'Standard', color: '#6b7280', icon: '⚪' }
  ];

  const momentOptions = {
    positive: [
      {
        id: 'socialWin',
        label: 'Social win',
        defaultSummary: 'Participant experienced a positive social interaction with peers.',
        domains: ['socialInteraction', 'communication', 'interpersonalRelationships'],
        skills: ['peerInteraction', 'encouragement', 'turnTaking']
      },
      {
        id: 'skillImprovement',
        label: 'Skill improvement',
        defaultSummary: 'Participant showed noticeable improvement in a targeted skill.',
        domains: ['learning'],
        skills: ['followingInstructions', 'applyingFeedback']
      },
      {
        id: 'leadershipMoment',
        label: 'Leadership moment',
        defaultSummary: 'Participant demonstrated leadership within the group.',
        domains: ['interpersonalRelationships', 'communityParticipation'],
        skills: ['leadership', 'supportingOthers']
      },
      {
        id: 'greatParticipation',
        label: 'Great participation',
        defaultSummary: 'Participant engaged actively and consistently throughout the activity.',
        domains: ['communityParticipation'],
        skills: ['sessionParticipation']
      },
      {
        id: 'calmFocused',
        label: 'Calm & focused',
        defaultSummary: 'Participant remained calm and focused across tasks.',
        domains: ['selfManagement', 'learning'],
        skills: ['stayingOnTask', 'emotionalRegulation']
      }
    ],
    challenge: [
      {
        id: 'neededSupport',
        label: 'Needed support',
        defaultSummary: 'Participant needed additional support to engage in the activity.',
        domains: ['selfManagement', 'learning'],
        skills: ['emotionalRegulation', 'stayingOnTask']
      },
      {
        id: 'frustrationRegulation',
        label: 'Frustration / regulation',
        defaultSummary: 'Participant became frustrated and required regulation support.',
        domains: ['selfManagement'],
        skills: ['emotionalRegulation']
      },
      {
        id: 'instructionDifficulty',
        label: 'Difficulty with instructions',
        defaultSummary: 'Participant had difficulty following instructions and needed prompts.',
        domains: ['learning'],
        skills: ['followingInstructions', 'sequencingSteps']
      },
      {
        id: 'peerIssue',
        label: 'Peer issue',
        defaultSummary: 'Participant experienced a challenge in peer interaction.',
        domains: ['socialInteraction', 'interpersonalRelationships'],
        skills: ['peerInteraction', 'boundaries']
      },
      {
        id: 'leftAndRejoined',
        label: 'Left activity / rejoined',
        defaultSummary: 'Participant left the activity and later rejoined with support.',
        domains: ['selfManagement', 'communityParticipation'],
        skills: ['reEngagement', 'transitions']
      }
    ],
    standard: [
      {
        id: 'participatedNormally',
        label: 'Participated normally',
        defaultSummary: 'Participant engaged in the session as expected.',
        domains: ['communityParticipation'],
        skills: ['sessionParticipation']
      },
      {
        id: 'followedRoutine',
        label: 'Followed routine',
        defaultSummary: 'Participant followed the usual session routine.',
        domains: ['learning', 'selfManagement'],
        skills: ['followingInstructions', 'transitions']
      },
      {
        id: 'onTask',
        label: 'On task',
        defaultSummary: 'Participant remained on task throughout the activity.',
        domains: ['learning'],
        skills: ['stayingOnTask']
      },
      {
        id: 'calmSession',
        label: 'Calm session',
        defaultSummary: 'The session was calm with no notable incidents.',
        domains: ['selfManagement'],
        skills: ['emotionalRegulation']
      }
    ]
  };

  const extraDetailOptions = [
    {
      id: 'regulationToolUsed',
      label: 'Regulation tool used',
      domains: ['selfManagement'],
      skills: ['emotionalRegulation'],
      extraText: 'A regulation tool was used to support calming and re-engagement.'
    },
    {
      id: 'reEntryDelivered',
      label: 'Re-entry phrase delivered',
      domains: ['selfManagement', 'socialInteraction'],
      skills: ['reEngagement'],
      extraText: 'A re-entry phrase was delivered to support a safe return to the activity.'
    },
    {
      id: 'neededModelling',
      label: 'Needed staff modelling',
      domains: ['learning', 'socialInteraction'],
      skills: ['followingInstructions', 'socialCues'],
      extraText: 'Staff modelling was used to demonstrate the expected behaviour.'
    },
    {
      id: 'neededPrompts',
      label: 'Needed prompts',
      domains: ['learning'],
      skills: ['stayingOnTask'],
      extraText: 'Verbal or visual prompts were provided to help the participant stay on task.'
    }
  ];

  // Fetch existing notes on open
  useEffect(() => {
    if (isOpen && athlete) {
      fetchExistingNotes();
    }
  }, [isOpen, athlete]);

  const fetchExistingNotes = async () => {
    try {
      const coachEmail = localStorage.getItem('coachEmail');
      const response = await fetch(
        `https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/getSessionNotes?` +
        `spreadsheetId=${spreadsheetId}&sheetName=${encodeURIComponent(sheetName)}&athleteId=${athlete.id}&sessionNumber=${sessionNumber}`
      );
      
      const data = await response.json();
      if (data.success) {
        setExistingNotes({
          basketball: data.notes.basketball || '',
          behaviour: data.notes.behaviour || ''
        });
      }
    } catch (error) {
      console.error('Error fetching existing notes:', error);
    }
  };

  // Get combined domains and skills from current selection
  const getCurrentDomainsAndSkills = () => {
    const domains = new Set();
    const skills = new Set();

    // Add from selected option
    if (behaviourForm.momentOptionId && behaviourForm.momentTypeId) {
      const option = momentOptions[behaviourForm.momentTypeId].find(
        o => o.id === behaviourForm.momentOptionId
      );
      if (option) {
        option.domains.forEach(d => domains.add(d));
        option.skills.forEach(s => skills.add(s));
      }
    }

    // Add from extra details
    behaviourForm.extraDetailIds.forEach(id => {
      const extra = extraDetailOptions.find(e => e.id === id);
      if (extra) {
        extra.domains.forEach(d => domains.add(d));
        extra.skills.forEach(s => skills.add(s));
      }
    });

    return { domains: Array.from(domains), skills: Array.from(skills) };
  };

  // Update summary when selection changes
  useEffect(() => {
    if (behaviourForm.momentOptionId && !behaviourForm.userEdited) {
      const option = momentOptions[behaviourForm.momentTypeId].find(
        o => o.id === behaviourForm.momentOptionId
      );
      
      const extraTexts = behaviourForm.extraDetailIds.map(id => {
        const extra = extraDetailOptions.find(e => e.id === id);
        return extra?.extraText || '';
      }).filter(Boolean);

      const autoSummary = [option.defaultSummary, ...extraTexts].join(' ');
      
      setBehaviourForm(prev => ({
        ...prev,
        summary: autoSummary,
        autoSummary
      }));
    }
  }, [behaviourForm.momentOptionId, behaviourForm.extraDetailIds, behaviourForm.momentTypeId]);

  // Basketball handlers
  const addBasketballMoment = () => {
    if (!bbForm.skillId || !bbForm.outcomeId) {
      alert('Please select a skill and outcome');
      return;
    }

    setBasketballEvents([...basketballEvents, { ...bbForm }]);
    setBbForm({ skillId: null, outcomeId: null, comment: '' });
  };

  const removeBasketballMoment = (index) => {
    setBasketballEvents(basketballEvents.filter((_, i) => i !== index));
  };

  const saveBasketballNotes = async () => {
    if (basketballEvents.length === 0) {
      alert('Please add at least one basketball moment');
      return;
    }

    // Calculate character count
    const formattedNote = basketballEvents.map(event => {
      const skill = basketballSkills.find(s => s.id === event.skillId);
      const outcome = basketballOutcomes.find(o => o.id === event.outcomeId);
      return `${skill.label}: ${outcome.label}${event.comment ? ` - ${event.comment}` : ''}`;
    }).join(' | ');

    const fullNote = `S${sessionNumber}: ${formattedNote}`;
    if (fullNote.length > 500) {
      alert(`Note is too long (${fullNote.length} characters). Maximum is 500. Please shorten your comments.`);
      return;
    }

    setLoading(true);
    try {
      const coachEmail = localStorage.getItem('coachEmail');
      const response = await fetch(
        'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/saveSessionNotes',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'basketball',
            spreadsheetId,
            sheetName,
            sessionNumber: sessionNumber.toString(),
            athleteId: athlete.id,
            athleteName: athlete.name,
            coachId: coachEmail,
            events: basketballEvents
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Basketball notes saved!');
        setBasketballEvents([]);
        fetchExistingNotes(); // Refresh to show new notes
      } else {
        alert(`Error: ${data.error || 'Failed to save'}`);
      }
    } catch (error) {
      console.error('Error saving basketball notes:', error);
      alert('Error saving notes');
    } finally {
      setLoading(false);
    }
  };

  // Behaviour handlers
  const addBehaviourMoment = () => {
    if (!behaviourForm.momentTypeId || !behaviourForm.momentOptionId) {
      alert('Please select a moment type and option');
      return;
    }

    const { domains, skills } = getCurrentDomainsAndSkills();

    setBehaviourEvents([
      ...behaviourEvents,
      {
        momentTypeId: behaviourForm.momentTypeId,
        momentOptionId: behaviourForm.momentOptionId,
        extraDetailOptionIds: behaviourForm.extraDetailIds,
        summary: behaviourForm.summary,
        domains,
        skills
      }
    ]);

    // Reset form
    setBehaviourForm({
      momentTypeId: null,
      momentOptionId: null,
      extraDetailIds: [],
      summary: '',
      autoSummary: '',
      userEdited: false
    });
  };

  const removeBehaviourMoment = (index) => {
    setBehaviourEvents(behaviourEvents.filter((_, i) => i !== index));
  };

  const hasChallengeMoment = () => {
    return behaviourEvents.some(ev => ev.momentTypeId === 'challenge');
  };

  const saveBehaviourNotes = async () => {
    if (behaviourEvents.length === 0) {
      alert('Please add at least one behaviour moment');
      return;
    }

    if (!hasChallengeMoment()) {
      alert('Behaviour notes must include at least one Challenge moment');
      return;
    }

    // Calculate character count
    const formattedNote = behaviourEvents.map(event => {
      const typeIcon = momentTypes.find(t => t.id === event.momentTypeId)?.icon || '';
      return `${typeIcon} ${event.summary}`;
    }).join(' | ');

    const fullNote = `S${sessionNumber}: ${formattedNote}`;
    if (fullNote.length > 500) {
      alert(`Note is too long (${fullNote.length} characters). Maximum is 500. Please shorten your summaries.`);
      return;
    }

    setLoading(true);
    try {
      const coachEmail = localStorage.getItem('coachEmail');
      const response = await fetch(
        'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/saveSessionNotes',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'behaviour',
            spreadsheetId,
            sheetName,
            sessionNumber: sessionNumber.toString(),
            athleteId: athlete.id,
            athleteName: athlete.name,
            coachId: coachEmail,
            events: behaviourEvents,
            hasChallengeMoment: hasChallengeMoment()
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Behaviour notes saved!');
        setBehaviourEvents([]);
        fetchExistingNotes(); // Refresh to show new notes
      } else {
        alert(`Error: ${data.error || 'Failed to save'}`);
      }
    } catch (error) {
      console.error('Error saving behaviour notes:', error);
      alert('Error saving notes');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const { domains, skills } = getCurrentDomainsAndSkills();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Session Notes - {athlete?.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Existing Notes Summary */}
        {(existingNotes.basketball || existingNotes.behaviour) && (
          <div className="existing-notes-summary">
            <h3>Existing Notes for Session {sessionNumber}</h3>
            {existingNotes.basketball && (
              <div className="existing-note">
                <strong>🏀 Basketball:</strong> {existingNotes.basketball}
              </div>
            )}
            {existingNotes.behaviour && (
              <div className="existing-note">
                <strong>🧠 Behaviour:</strong> {existingNotes.behaviour}
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'behaviour' ? 'active' : ''}`}
            onClick={() => setActiveTab('behaviour')}
          >
            🧠 Behaviour / Capacity {!hasChallengeMoment() && behaviourEvents.length > 0 && (
              <span className="challenge-required">⚠️ Challenge Required</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'basketball' ? 'active' : ''}`}
            onClick={() => setActiveTab('basketball')}
          >
            🏀 Basketball Skills
          </button>
        </div>

        {/* Behaviour Tab */}
        {activeTab === 'behaviour' && (
          <div className="tab-content">
            <h3>Step 1 · Type of moment</h3>
            
            {/* Moment Type Selection */}
            <div className="form-group">
              <div className="button-grid">
                {momentTypes.map(type => (
                  <button
                    key={type.id}
                    className={`option-button ${behaviourForm.momentTypeId === type.id ? 'selected' : ''}`}
                    style={{ borderColor: behaviourForm.momentTypeId === type.id ? type.color : '#d1d5db' }}
                    onClick={() => setBehaviourForm({ 
                      ...behaviourForm, 
                      momentTypeId: type.id,
                      momentOptionId: null,
                      extraDetailIds: [],
                      summary: '',
                      userEdited: false
                    })}
                  >
                    <span className="icon">{type.icon}</span> {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Moment Options */}
            {behaviourForm.momentTypeId && (
              <>
                <h3>Step 2 · What best matches?</h3>
                <div className="form-group">
                  <div className="button-grid">
                    {momentOptions[behaviourForm.momentTypeId].map(option => (
                      <button
                        key={option.id}
                        className={`option-button ${behaviourForm.momentOptionId === option.id ? 'selected' : ''}`}
                        onClick={() => setBehaviourForm({ 
                          ...behaviourForm, 
                          momentOptionId: option.id,
                          userEdited: false
                        })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extra Details */}
                <div className="form-group">
                  <label>Add detail (optional):</label>
                  <div className="button-grid">
                    {extraDetailOptions.map(extra => (
                      <button
                        key={extra.id}
                        className={`option-button small ${behaviourForm.extraDetailIds.includes(extra.id) ? 'selected' : ''}`}
                        onClick={() => {
                          const ids = behaviourForm.extraDetailIds.includes(extra.id)
                            ? behaviourForm.extraDetailIds.filter(id => id !== extra.id)
                            : [...behaviourForm.extraDetailIds, extra.id];
                          setBehaviourForm({ ...behaviourForm, extraDetailIds: ids });
                        }}
                      >
                        {extra.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Summary */}
            {behaviourForm.momentOptionId && (
              <>
                <h3>Step 3 · Summary</h3>
                <div className="form-group">
                  <textarea
                    value={behaviourForm.summary}
                    onChange={(e) => setBehaviourForm({ 
                      ...behaviourForm, 
                      summary: e.target.value,
                      userEdited: true
                    })}
                    rows={3}
                    maxLength={300}
                    placeholder="Select a moment type and option to generate a summary..."
                  />
                  <div className="summary-meta">
                    <div className="tags">
                      {domains.length === 0 && skills.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Domains & skills will appear here
                        </span>
                      ) : (
                        <>
                          {domains.map(d => (
                            <span key={d} className="tag-pill">Domain: {d}</span>
                          ))}
                          {skills.map(s => (
                            <span key={s} className="tag-pill">Skill: {s}</span>
                          ))}
                        </>
                      )}
                    </div>
                    <small>{behaviourForm.summary.length} chars</small>
                  </div>
                </div>
              </>
            )}

            <button 
              className="add-moment-button" 
              onClick={addBehaviourMoment}
              disabled={!behaviourForm.momentTypeId || !behaviourForm.momentOptionId}
            >
              Add moment to list
            </button>

            {/* Behaviour Moments List */}
            <div className="moments-list">
              <h4>
                Recorded moments this session ({behaviourEvents.length})
                {!hasChallengeMoment() && behaviourEvents.length > 0 && (
                  <span className="warning"> ⚠️ Need at least 1 Challenge</span>
                )}
              </h4>
              {behaviourEvents.length === 0 ? (
                <p className="empty-state">No moments recorded yet</p>
              ) : (
                behaviourEvents.map((event, index) => {
                  const type = momentTypes.find(t => t.id === event.momentTypeId);
                  const option = momentOptions[event.momentTypeId].find(o => o.id === event.momentOptionId);
                  
                  return (
                    <div key={index} className="moment-card">
                      <div className="moment-header">
                        <span className="moment-number" style={{ color: type?.color }}>
                          {index + 1}. {type?.label}
                        </span>
                        <span className="moment-badge">{option?.label}</span>
                      </div>
                      <p className="moment-summary">{event.summary}</p>
                      <div className="moment-card-footer">
                        <span>{event.domains.length} domains · {event.skills.length} skills</span>
                        <button className="remove-button" onClick={() => removeBehaviourMoment(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="modal-actions">
              <button className="clear-button" onClick={() => setBehaviourEvents([])}>
                Clear All
              </button>
              <button 
                className="save-button" 
                onClick={saveBehaviourNotes}
                disabled={loading || behaviourEvents.length === 0 || !hasChallengeMoment()}
              >
                {loading ? 'Saving...' : `Save all behaviour notes ↪`}
              </button>
            </div>
          </div>
        )}

        {/* Basketball Tab */}
        {activeTab === 'basketball' && (
          <div className="tab-content">
            <h3>Add Basketball Moment</h3>
            
            {/* Skill Selection */}
            <div className="form-group">
              <label>Select Skill:</label>
              <div className="button-grid">
                {basketballSkills.map(skill => (
                  <button
                    key={skill.id}
                    className={`option-button ${bbForm.skillId === skill.id ? 'selected' : ''}`}
                    onClick={() => setBbForm({ ...bbForm, skillId: skill.id })}
                  >
                    {skill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Outcome Selection */}
            <div className="form-group">
              <label>Select Outcome:</label>
              <div className="button-grid">
                {basketballOutcomes.map(outcome => (
                  <button
                    key={outcome.id}
                    className={`option-button ${bbForm.outcomeId === outcome.id ? 'selected' : ''}`}
                    style={{ borderColor: bbForm.outcomeId === outcome.id ? outcome.color : '#d1d5db' }}
                    onClick={() => setBbForm({ ...bbForm, outcomeId: outcome.id })}
                  >
                    {outcome.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="form-group">
              <label>Comment (optional):</label>
              <input
                type="text"
                value={bbForm.comment}
                onChange={(e) => setBbForm({ ...bbForm, comment: e.target.value })}
                placeholder="e.g., Much better control today"
                maxLength={200}
              />
            </div>

            <button className="add-moment-button" onClick={addBasketballMoment}>
              Add basketball moment
            </button>

            {/* Basketball Moments List */}
            <div className="moments-list">
              <h4>Recorded basketball moments ({basketballEvents.length})</h4>
              {basketballEvents.length === 0 ? (
                <p className="empty-state">No moments recorded yet</p>
              ) : (
                basketballEvents.map((event, index) => {
                  const skill = basketballSkills.find(s => s.id === event.skillId);
                  const outcome = basketballOutcomes.find(o => o.id === event.outcomeId);
                  return (
                    <div key={index} className="moment-card">
                      <div className="moment-header">
                        <span className="moment-number">{index + 1}. {skill?.label}</span>
                        <span className="moment-outcome" style={{ color: outcome?.color }}>
                          {outcome?.label}
                        </span>
                      </div>
                      {event.comment && <p className="moment-comment">{event.comment}</p>}
                      <div className="moment-card-footer">
                        <span>1 skill</span>
                        <button className="remove-button" onClick={() => removeBasketballMoment(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="modal-actions">
              <button className="clear-button" onClick={() => setBasketballEvents([])}>
                Clear All
              </button>
              <button 
                className="save-button" 
                onClick={saveBasketballNotes}
                disabled={loading || basketballEvents.length === 0}
              >
                {loading ? 'Saving...' : `Save all basketball notes ↪`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachNotesV2;
