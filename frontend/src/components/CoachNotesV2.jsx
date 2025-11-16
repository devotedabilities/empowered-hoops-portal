import React, { useState, useEffect } from 'react';
import './CoachNotesV2.css';

// Import schemas from separate files
import { DOMAINS, SKILLS } from '../schemas/domains';
import { SLIDER_LEVELS, BEHAVIOUR_NOTES, ADD_ON_OPTIONS } from '../schemas/socialSkills';
import { BASKETBALL_CATEGORIES, BASKETBALL_SKILLS, BASKETBALL_ADD_ONS } from '../schemas/basketballSkills';

const CoachNotesV2 = ({ 
  isOpen, 
  onClose, 
  athlete, 
  sessionNumber,
  spreadsheetId,
  sheetName,
  termConfig 
}) => {
  const [activeTab, setActiveTab] = useState('behaviour');
  const [existingNotes, setExistingNotes] = useState({ basketball: '', behaviour: '' });
  const [loading, setLoading] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  // Basketball state
  const [basketballEvents, setBasketballEvents] = useState([]);
  const [basketballForm, setBasketballForm] = useState({
    categoryId: null,
    skillId: null,
    addOnIds: [],
    comment: '',
    autoComment: '',
    userEdited: false
  });

  // Behaviour state
  const [behaviourEvents, setBehaviourEvents] = useState([]);
  const [behaviourForm, setBehaviourForm] = useState({
    sliderLevel: 2, // Start at "Some Support Needed" (most common)
    sliderPosition: 50, // Raw slider position (0-100)
    noteId: null,
    selectedExamples: [],
    addOnIds: [],
    summary: '',
    autoSummary: '',
    userEdited: false
  });

  // Fetch existing notes
  useEffect(() => {
    if (isOpen && athlete) {
      fetchExistingNotes();
    }
  }, [isOpen, athlete]);

  const fetchExistingNotes = async () => {
    try {
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

  // Get combined domains and skills for behaviour
  const getCurrentDomainsAndSkills = () => {
    const domains = new Set();
    const skills = new Set();

    if (behaviourForm.noteId !== null && behaviourForm.sliderLevel !== null) {
      const note = BEHAVIOUR_NOTES[behaviourForm.sliderLevel]?.find(
        n => n.id === behaviourForm.noteId
      );
      if (note) {
        note.domains.forEach(d => domains.add(d));
        note.skills.forEach(s => skills.add(s));
      }
    }

    behaviourForm.addOnIds.forEach(id => {
      const addOn = ADD_ON_OPTIONS.find(a => a.id === id);
      if (addOn) {
        addOn.domains.forEach(d => domains.add(d));
        addOn.skills.forEach(s => skills.add(s));
      }
    });

    return { domains: Array.from(domains), skills: Array.from(skills) };
  };

  // Update behaviour summary when selection changes
  useEffect(() => {
    if (behaviourForm.noteId !== null && !behaviourForm.userEdited && behaviourForm.sliderLevel !== null) {
      const note = BEHAVIOUR_NOTES[behaviourForm.sliderLevel]?.find(
        n => n.id === behaviourForm.noteId
      );
      
      if (!note) return;
      
      let mainSummary = note.summaryTemplate;
      mainSummary = mainSummary.endsWith('.') ? mainSummary : `${mainSummary}.`;
      
      // Add selected examples as natural sentences
      if (behaviourForm.selectedExamples && behaviourForm.selectedExamples.length > 0) {
        const exampleSentences = behaviourForm.selectedExamples
          .map(ex => {
            // Capitalize first letter, ensure it starts naturally
            const lowered = ex.toLowerCase();
            return lowered.charAt(0).toUpperCase() + lowered.slice(1);
          })
          .join(' and ');
        
        mainSummary = `${mainSummary} They ${exampleSentences.charAt(0).toLowerCase() + exampleSentences.slice(1)}.`;
      }
      
      // Add add-on texts as natural sentences
      const addOnTexts = behaviourForm.addOnIds.map(id => {
        const addOn = ADD_ON_OPTIONS.find(a => a.id === id);
        if (!addOn) return '';
        
        let addOnText = addOn.summaryTemplate;
        addOnText = addOnText.endsWith('.') ? addOnText : `${addOnText}.`;
        
        const addOnKey = `addOn_${id}`;
        const addOnExamples = behaviourForm[addOnKey];
        if (addOnExamples && addOnExamples.length > 0) {
          const addOnExampleSentences = addOnExamples
            .map(ex => {
              const lowered = ex.toLowerCase();
              return lowered.charAt(0).toUpperCase() + lowered.slice(1);
            })
            .join(' and ');
          
          addOnText = `${addOnText} They ${addOnExampleSentences.charAt(0).toLowerCase() + addOnExampleSentences.slice(1)}.`;
        }
        
        return addOnText;
      }).filter(Boolean);

      const autoSummary = [mainSummary, ...addOnTexts].join(' ');
      
      setBehaviourForm(prev => ({
        ...prev,
        summary: autoSummary,
        autoSummary
      }));
    }
  }, [behaviourForm.noteId, behaviourForm.selectedExamples, behaviourForm.addOnIds, behaviourForm.sliderLevel, ...behaviourForm.addOnIds.map(id => behaviourForm[`addOn_${id}`])]);

  // Update basketball summary when selection changes
  useEffect(() => {
    if (basketballForm.skillId && basketballForm.categoryId && !basketballForm.userEdited) {
      const skillsInCategory = BASKETBALL_SKILLS[basketballForm.categoryId] || [];
      const skill = skillsInCategory.find(s => s.id === basketballForm.skillId);
      if (!skill) return;

      // Start with base skill description
      let autoComment = `Participant demonstrated ${skill.label.toLowerCase()}.`;

      // Add add-on descriptions as natural sentences with proper grammar
      if (basketballForm.addOnIds.length > 0) {
        const addOnSentences = basketballForm.addOnIds.map(id => {
          const addOn = BASKETBALL_ADD_ONS.find(a => a.id === id);
          if (!addOn) return '';
          
          // Map add-on labels to grammatically correct sentences
          const label = addOn.label.toLowerCase();
          let sentence = '';
          
          if (label.startsWith('needed') || label.startsWith('required') || label.startsWith('used')) {
            sentence = `They ${label}.`;
          } else if (label.includes('shown')) {
            // "High effort / persistence shown" → "They showed high effort / persistence."
            sentence = `They showed ${label.replace(' shown', '')}.`;
          } else if (label.includes('increased')) {
            // "Confidence increased" → "Their confidence increased."
            sentence = `Their ${label}.`;
          } else if (label.includes('provided')) {
            // "Safety reminder provided" → "A safety reminder was provided."
            sentence = `A ${label.replace(' provided', ' was provided')}.`;
          } else {
            sentence = `They ${label}.`;
          }
          
          return sentence;
        }).filter(Boolean);

        if (addOnSentences.length > 0) {
          autoComment += ' ' + addOnSentences.join(' ');
        }
      }

      setBasketballForm(prev => ({
        ...prev,
        comment: autoComment,
        autoComment
      }));
    }
  }, [basketballForm.skillId, basketballForm.categoryId, basketballForm.addOnIds, basketballForm.userEdited]);

  // Behaviour handlers
  const addBehaviourMoment = () => {
    if (behaviourForm.noteId === null) {
      alert('Please select a behaviour note before saving.');
      return;
    }

    const { domains, skills } = getCurrentDomainsAndSkills();
    const sliderLevelData = SLIDER_LEVELS.find(s => s.value === behaviourForm.sliderLevel);

    setBehaviourEvents([
      ...behaviourEvents,
      {
        sliderLevel: behaviourForm.sliderLevel,
        sliderLabel: sliderLevelData?.label || '',
        sliderColor: sliderLevelData?.color || '#6b7280',
        noteId: behaviourForm.noteId,
        selectedExamples: behaviourForm.selectedExamples || [],
        addOnIds: behaviourForm.addOnIds,
        summary: behaviourForm.summary,
        domains,
        skills
      }
    ]);

    // Reset form
    setBehaviourForm({
      sliderLevel: null,
      sliderPosition: 50,
      noteId: null,
      selectedExamples: [],
      addOnIds: [],
      summary: '',
      autoSummary: '',
      userEdited: false
    });
  };

  const removeBehaviourMoment = (index) => {
    setBehaviourEvents(behaviourEvents.filter((_, i) => i !== index));
  };

  const hasChallengeMoment = () => {
    // Check if there's at least one moment at levels 0, 1, or 2 (High/Extra/Some Support Needed)
    return behaviourEvents.some(ev => ev.sliderLevel <= 2);
  };

  const saveBehaviourNotes = async () => {
    if (behaviourEvents.length === 0) {
      alert('Please add at least one behaviour moment before saving.');
      return;
    }

    if (!hasChallengeMoment()) {
      alert('Behaviour notes must include at least one support moment (High, Extra, or Some Support Needed)');
      return;
    }

const formattedNote = behaviourEvents.map(event => {
  const sliderData = SLIDER_LEVELS.find(s => s.value === event.sliderLevel);
  const emoji = sliderData?.emoji || '';
  return `${emoji} ${event.summary}`;
}).join(' | ');

const fullNote = `S${sessionNumber}: ${formattedNote}`;

setLoading(true);
try {
  const coachEmail = localStorage.getItem('coachEmail');
  const coachDisplayName = localStorage.getItem('coachDisplayName');
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
        coachName: coachDisplayName,
        events: behaviourEvents,
        hasChallengeMoment: hasChallengeMoment()
      })
    }
  );

      const data = await response.json();
      if (data.success) {
        alert('Behaviour notes saved successfully.');
        setBehaviourEvents([]);
        fetchExistingNotes();
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

  // Basketball handlers
  const addBasketballMoment = () => {
    if (!basketballForm.categoryId || !basketballForm.skillId) {
      alert('Please select a category and skill before adding.');
      return;
    }

    const skillsInCategory = BASKETBALL_SKILLS[basketballForm.categoryId] || [];
    const skill = skillsInCategory.find(s => s.id === basketballForm.skillId);
    const category = BASKETBALL_CATEGORIES.find(c => c.id === basketballForm.categoryId);
    
    setBasketballEvents([
      ...basketballEvents,
      {
        categoryId: basketballForm.categoryId,
        categoryLabel: category.label,
        skillId: basketballForm.skillId,
        skillLabel: skill.label,
        addOnIds: basketballForm.addOnIds,
        comment: basketballForm.comment,
        domains: skill.domains,
        skills: skill.skills
      }
    ]);

    // Reset form
    setBasketballForm({
      categoryId: null,
      skillId: null,
      addOnIds: [],
      comment: '',
      autoComment: '',
      userEdited: false
    });
  };

  const removeBasketballMoment = (index) => {
    setBasketballEvents(basketballEvents.filter((_, i) => i !== index));
  };

  const saveBasketballNotes = async () => {
    if (basketballEvents.length === 0) {
      alert('Please add at least one basketball skill before saving.');
      return;
    }

    const formattedNote = basketballEvents.map(event => {
      const addOnLabels = event.addOnIds.map(id => 
        BASKETBALL_ADD_ONS.find(a => a.id === id)?.label
      ).filter(Boolean);

      let note = event.skillLabel;
      if (addOnLabels.length > 0) {
        note += ` (${addOnLabels.join(', ')})`;
      }
      if (event.comment) {
        note += `: ${event.comment}`;
      }
      return note;
    }).join(' | ');

    const fullNote = `S${sessionNumber}: ${formattedNote}`;

    setLoading(true);
    try {
const coachEmail = localStorage.getItem('coachEmail');
const coachDisplayName = localStorage.getItem('coachDisplayName');
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
      coachName: coachDisplayName,
      events: basketballEvents
    })
  }
);

      const data = await response.json();
      if (data.success) {
        alert('Basketball skill notes saved successfully.');
        setBasketballEvents([]);
        fetchExistingNotes();
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
        <div className="tabs" style={{
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          zIndex: 1
        }}>
          <button
            className={`tab ${activeTab === 'behaviour' ? 'active' : ''}`}
            onClick={() => setActiveTab('behaviour')}
            style={{
              background: activeTab === 'behaviour' ? '#8b5cf6' : undefined,
              borderColor: activeTab === 'behaviour' ? '#8b5cf6' : undefined,
              boxShadow: activeTab === 'behaviour' ? 'inset 0 -8px 12px -6px rgba(109, 40, 217, 0.5)' : 'none',
              color: activeTab === 'behaviour' ? 'white' : undefined
            }}
          >
            🧠 Social Skills
            {!hasChallengeMoment() && behaviourEvents.length > 0 && (
              <span className="challenge-required">⚠️ Support Moment Required</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'basketball' ? 'active' : ''}`}
            onClick={() => setActiveTab('basketball')}
            style={{
              background: activeTab === 'basketball' ? '#f97316' : undefined,
              borderColor: activeTab === 'basketball' ? '#f97316' : undefined,
              boxShadow: activeTab === 'basketball' ? 'inset 0 -8px 12px -6px rgba(194, 65, 12, 0.5)' : 'none',
              color: activeTab === 'basketball' ? 'white' : undefined
            }}
          >
            🏀 Hoop Skills
          </button>
        </div>

        {/* Coach Guidance Toggle */}
        <div style={{ padding: '1rem 1.75rem', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setShowGuidance(!showGuidance)}
            style={{
              background: 'none',
              border: '1px dashed #d1d5db',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#6b7280',
              width: '100%',
              textAlign: 'left'
            }}
          >
            {showGuidance ? '▾' : '▸'} Coach Guidance - Writing Strong Notes
          </button>
          
          {showGuidance && (
            <div style={{
              marginTop: '0.75rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              fontSize: '0.875rem',
              lineHeight: '1.6'
            }}>
              <strong>Writing Strong Behaviour Notes:</strong>
              <ul style={{ marginLeft: '1.25rem', marginTop: '0.5rem' }}>
                <li>Focus on observable actions</li>
                <li>Keep it short and factual</li>
                <li>Note supports provided</li>
                <li>Avoid diagnostic terms</li>
              </ul>
              
              <strong style={{ marginTop: '1rem', display: 'block' }}>Writing Strong Basketball Notes:</strong>
              <ul style={{ marginLeft: '1.25rem', marginTop: '0.5rem' }}>
                <li>Focus on technique, effort, coordination, and responsiveness</li>
                <li>Use add-ons to highlight coaching support</li>
              </ul>
              
              <strong style={{ marginTop: '1rem', display: 'block' }}>Why These Notes Matter:</strong>
              <ul style={{ marginLeft: '1.25rem', marginTop: '0.5rem' }}>
                <li>Supports tracking of social and emotional development</li>
                <li>Group participation and regulation</li>
                <li>Motor skills and coordination</li>
                <li>NDIS goal progression</li>
                <li>Behaviour support planning</li>
              </ul>
            </div>
          )}
        </div>

        {/* Behaviour Tab */}
        {activeTab === 'behaviour' && (
          <div className="tab-content">
            {behaviourForm.noteId === null && behaviourEvents.length === 0 && (
              <p className="helper-text" style={{ 
                background: '#f9fafb', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1.5rem'
              }}>
                💡 Slider starts at "Some Support Needed". Adjust to match what you observed, then select a note below.
              </p>
            )}

            <h3>Step 1 · How did the participant engage in this moment?</h3>
            <p className="helper-text" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
              Slide to the level matching the behaviour you observed. Add item + details below.
            </p>
            
            {/* Slider Component */}
            <div style={{ 
              padding: '1.5rem', 
              background: '#f9fafb', 
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={behaviourForm.sliderPosition}
                  onChange={(e) => {
                    const rawValue = parseInt(e.target.value);
                    // Calculate which zone (0-4) based on position
                    const zone = Math.min(4, Math.floor(rawValue / 20));
                    
                    setBehaviourForm({ 
                      ...behaviourForm, 
                      sliderPosition: rawValue,
                      sliderLevel: zone,
                      noteId: null,
                      selectedExamples: [],
                      addOnIds: [],
                      summary: '',
                      userEdited: false
                    });
                  }}
                  data-level={behaviourForm.sliderLevel ?? 2}
                />
                
                <div className="slider-labels">
                  {SLIDER_LEVELS.map((level) => {
                    const isActive = (behaviourForm.sliderLevel ?? 2) === level.value;
                    // Calculate center position for this level (each zone is 20% wide)
                    const centerPosition = (level.value * 20) + 10;
                    
                    return (
                      <div 
                        key={level.value}
                        className={isActive ? 'active' : ''}
                        style={{ 
                          color: isActive ? level.color : '#9ca3af',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setBehaviourForm({
                            ...behaviourForm,
                            sliderPosition: centerPosition,
                            sliderLevel: level.value,
                            noteId: null,
                            selectedExamples: [],
                            addOnIds: [],
                            summary: '',
                            userEdited: false
                          });
                        }}
                      >
                        <div className="emoji">{level.emoji}</div>
                        <div className="label">{level.shortLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {behaviourForm.sliderLevel !== null && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${SLIDER_LEVELS[behaviourForm.sliderLevel]?.color || '#6b7280'}`
                }}>
                  <strong style={{ color: SLIDER_LEVELS[behaviourForm.sliderLevel]?.color }}>
                    {SLIDER_LEVELS[behaviourForm.sliderLevel]?.emoji} {SLIDER_LEVELS[behaviourForm.sliderLevel]?.label}
                  </strong>
                </div>
              )}
            </div>

            {/* Note Options */}
            {behaviourForm.sliderLevel !== null && (
              <>
                <h3>Step 2 · What best matches?</h3>
<p className="helper-text" style={{ 
  fontSize: '0.75rem', 
  color: behaviourForm.noteId !== null ? '#7c3aed' : '#6b7280',
  marginTop: '0.25rem', 
  marginBottom: '1rem',
  fontStyle: behaviourForm.noteId !== null ? 'italic' : 'normal'
}}>
  {behaviourForm.noteId !== null 
    ? BEHAVIOUR_NOTES[behaviourForm.sliderLevel]?.find(n => n.id === behaviourForm.noteId)?.tooltip
    : 'Select one main behaviour or capacity moment. Pick the closest match — you can add more context afterwards.'}
</p>
                <div className="form-group">
                  <div className="button-grid">
                    {(BEHAVIOUR_NOTES[behaviourForm.sliderLevel] || []).map(note => (
                      <button
                        key={note.id}
                        className={`option-button ${behaviourForm.noteId === note.id ? 'selected' : ''}`}
                        onClick={() => setBehaviourForm({ 
                          ...behaviourForm, 
                          noteId: note.id,
                          selectedExamples: [],
                          userEdited: false
                        })}
                        title={note.tooltip}
                      >
                        {note.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Example Selection */}
                {behaviourForm.noteId !== null && (
                  <>
                    <h3>Step 2b · What did you observe? (optional)</h3>
                    <p className="helper-text" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                      Select specific examples that match what you observed.
                    </p>
                    <div className="form-group">
                      <div className="button-grid">
                        {BEHAVIOUR_NOTES[behaviourForm.sliderLevel]
                          ?.find(n => n.id === behaviourForm.noteId)
                          ?.examples.map((example, idx) => (
                            <button
                              key={idx}
                              className={`option-button small ${
                                (behaviourForm.selectedExamples || []).includes(example) ? 'selected' : ''
                              }`}
                              onClick={() => {
                                const current = behaviourForm.selectedExamples || [];
                                const updated = current.includes(example)
                                  ? current.filter(e => e !== example)
                                  : [...current, example];
                                setBehaviourForm({ 
                                  ...behaviourForm, 
                                  selectedExamples: updated,
                                  userEdited: false
                                });
                              }}
                            >
                              {example}
                            </button>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Add-On Options */}
                <h3>Step 3 · Add detail (optional)</h3>
                <p className="helper-text" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Select any additional supports or strategies used during the moment.
                </p>
                <div className="form-group">
                  <div className="button-grid">
                    {ADD_ON_OPTIONS.map(addOn => (
                      <button
                        key={addOn.id}
                        className={`option-button small ${behaviourForm.addOnIds.includes(addOn.id) ? 'selected' : ''}`}
                        onClick={() => {
                          const ids = behaviourForm.addOnIds.includes(addOn.id)
                            ? behaviourForm.addOnIds.filter(id => id !== addOn.id)
                            : [...behaviourForm.addOnIds, addOn.id];
                          setBehaviourForm({ ...behaviourForm, addOnIds: ids });
                        }}
                        title={addOn.tooltip}
                      >
                        {addOn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-On Example Selection */}
                {behaviourForm.addOnIds.map(addOnId => {
                  const addOn = ADD_ON_OPTIONS.find(a => a.id === addOnId);
                  if (!addOn || !addOn.examples) return null;
                  
                  const addOnKey = `addOn_${addOnId}`;
                  
                  return (
                    <div key={addOnId} className="form-group">
                      <label>{addOn.label} - Select examples (optional):</label>
                      <div className="button-grid">
                        {addOn.examples.map((example, idx) => (
                          <button
                            key={idx}
                            className={`option-button small ${
                              (behaviourForm[addOnKey] || []).includes(example) ? 'selected' : ''
                            }`}
                            onClick={() => {
                              const current = behaviourForm[addOnKey] || [];
                              const updated = current.includes(example)
                                ? current.filter(e => e !== example)
                                : [...current, example];
                              setBehaviourForm({ 
                                ...behaviourForm, 
                                [addOnKey]: updated,
                                userEdited: false
                              });
                            }}
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Summary */}
            {behaviourForm.noteId !== null && (
              <>
                <h3>Step 4 · Summary</h3>
                <p className="helper-text" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  This summary will be included in the participant's session notes and reports.
                </p>
                <div className="form-group">
                  <textarea
                    value={behaviourForm.summary}
                    onChange={(e) => setBehaviourForm({ 
                      ...behaviourForm, 
                      summary: e.target.value,
                      userEdited: true
                    })}
                    rows={4}
                    placeholder="Write a short description of what happened. Keep it factual and focused on what you observed."
                    title="Avoid interpreting or guessing reasons. Focus on observable behaviour and any support provided."
                  />
                  <div className="summary-meta">
                    <div className="tags">
                      {domains.length === 0 && skills.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Your summary will automatically include domains and skills based on your selections.
                        </span>
                      ) : (
                        <>
                          {domains.map(d => (
                            <span key={d} className="tag-pill">
                              {DOMAINS[d]?.name || d}
                            </span>
                          ))}
                          {skills.map(s => (
                            <span key={s} className="tag-pill">
                              {SKILLS[s] || s}
                            </span>
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
              disabled={behaviourForm.noteId === null}
            >
              Add moment to list
            </button>

            {/* Behaviour Moments List */}
            <div className="moments-list">
              <h4>
                Recorded moments this session ({behaviourEvents.length})
                {!hasChallengeMoment() && behaviourEvents.length > 0 && (
                  <span className="warning"> ⚠️ Need at least 1 support moment</span>
                )}
              </h4>
              {behaviourEvents.length === 0 ? (
                <p className="empty-state">No moments recorded yet. Add a moment above to begin.</p>
              ) : (
                behaviourEvents.map((event, index) => {
                  const note = BEHAVIOUR_NOTES[event.sliderLevel]?.find(n => n.id === event.noteId);
                  
                  return (
                    <div key={index} className="moment-card">
                      <div className="moment-header">
                        <span className="moment-number" style={{ color: event.sliderColor }}>
                          {index + 1}. {event.sliderLabel}
                        </span>
                        <span className="moment-badge">{note?.label}</span>
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
            {!basketballForm.categoryId && basketballEvents.length === 0 && (
              <p className="helper-text" style={{ 
                background: '#f9fafb', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1.5rem'
              }}>
                Choose a skill category to begin.
              </p>
            )}

            <h3>Step 1 · Choose a skill category</h3>
            <p className="helper-text" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
              Select a category, then choose a specific skill.
            </p>
            
            <div className="form-group">
              <div className="button-grid">
                {BASKETBALL_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`option-button ${basketballForm.categoryId === category.id ? 'selected' : ''}`}
                    onClick={() => setBasketballForm({ 
                      ...basketballForm, 
                      categoryId: category.id,
                      skillId: null,
                      comment: '',
                      autoComment: '',
                      userEdited: false
                    })}
                  >
                    {category.emoji} {category.label}
                  </button>
                ))}
              </div>
            </div>

            {basketballForm.categoryId && (
              <>
                <h3>Step 2 · What best matches?</h3>
<p className="helper-text" style={{ 
  fontSize: '0.75rem', 
  color: behaviourForm.noteId !== null ? '#7c3aed' : '#6b7280',
  marginTop: '0.25rem', 
  marginBottom: '1rem',
  fontStyle: behaviourForm.noteId !== null ? 'italic' : 'normal'
}}>
  {behaviourForm.noteId !== null 
    ? BEHAVIOUR_NOTES[behaviourForm.sliderLevel]?.find(n => n.id === behaviourForm.noteId)?.tooltip
    : 'Select one main behaviour or capacity moment. Pick the closest match — you can add more context afterwards.'}
</p>
                <div className="form-group">
                  <div className="button-grid">
                    {(BASKETBALL_SKILLS[basketballForm.categoryId] || []).map(skill => (
                      <button
                        key={skill.id}
                        className={`option-button ${basketballForm.skillId === skill.id ? 'selected' : ''}`}
                        onClick={() => setBasketballForm({ 
                          ...basketballForm, 
                          skillId: skill.id,
                          comment: '',
                          autoComment: '',
                          userEdited: false
                        })}
                        title={skill.tooltip}
                      >
                        {skill.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {basketballForm.skillId && (
              <>
                <h3>Step 3 · Add detail (optional)</h3>
                <div className="form-group">
                  <div className="button-grid">
                    {BASKETBALL_ADD_ONS.map(addOn => (
                      <button
                        key={addOn.id}
                        className={`option-button small ${basketballForm.addOnIds.includes(addOn.id) ? 'selected' : ''}`}
                        onClick={() => {
                          const ids = basketballForm.addOnIds.includes(addOn.id)
                            ? basketballForm.addOnIds.filter(id => id !== addOn.id)
                            : [...basketballForm.addOnIds, addOn.id];
                          setBasketballForm({ ...basketballForm, addOnIds: ids });
                        }}
                        title={addOn.tooltip}
                      >
                        {addOn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <h3>Step 4 · Summary</h3>
                <p className="helper-text" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  Write a short description of the skill demonstrated.
                </p>
                <div className="form-group">
                  <textarea
                    value={basketballForm.comment}
                    onChange={(e) => setBasketballForm({ 
                      ...basketballForm, 
                      comment: e.target.value,
                      userEdited: true
                    })}
                    placeholder='E.g. "Participant kept the ball low and moved steadily through cones."'
                    rows={3}
                    title="Describe the skill as observed."
                  />
                  <div className="summary-meta">
                    <div className="tags">
                      {(() => {
                        const skillsInCategory = BASKETBALL_SKILLS[basketballForm.categoryId] || [];
                        const skill = skillsInCategory.find(s => s.id === basketballForm.skillId);
                        if (!skill) return null;
                        return (
                          <>
                            {skill.domains.map(d => (
                              <span key={d} className="tag-pill">
                                {DOMAINS[d]?.name || d}
                              </span>
                            ))}
                            {skill.skills.map(s => (
                              <span key={s} className="tag-pill">
                                {SKILLS[s] || s}
                              </span>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                    <small>{basketballForm.comment.length} chars</small>
                  </div>
                </div>
              </>
            )}

            <button 
              className="add-moment-button" 
              onClick={addBasketballMoment}
              disabled={!basketballForm.categoryId || !basketballForm.skillId}
            >
              Add skill to list
            </button>

            {/* Basketball Moments List */}
            <div className="moments-list">
              <h4>Recorded skills this session ({basketballEvents.length})</h4>
              {basketballEvents.length === 0 ? (
                <p className="empty-state">No skills recorded yet. Add a skill above to begin.</p>
              ) : (
                basketballEvents.map((event, index) => {
                  const addOnLabels = event.addOnIds.map(id => 
                    BASKETBALL_ADD_ONS.find(a => a.id === id)?.label
                  ).filter(Boolean);

                  return (
                    <div key={index} className="moment-card">
                      <div className="moment-header">
                        <span className="moment-number">
                          {index + 1}. {event.skillLabel}
                        </span>
                        {addOnLabels.length > 0 && (
                          <span className="moment-badge">{addOnLabels.join(', ')}</span>
                        )}
                      </div>
                      {event.comment && <p className="moment-summary">{event.comment}</p>}
                      <div className="moment-card-footer">
                        <span>{event.categoryLabel} · {event.domains.length} domains · {event.skills.length} skills</span>
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