import React, { useState, useEffect } from 'react';
import {
  NOTE_CATEGORIES,
  CATEGORY_CONFIG,
  REGULATION_TOOLS,
  createNoteObject,
  getRelevantTemplates,
  COMPLIANCE_FOOTER
} from '../utils/coachNotesSchema';

/**
 * CoachNotes Component - Multi-Category Version
 * Provides structured note-taking interface for coaches aligned with
 * Empowered Hoops Behaviour Management Manual v1.2
 */
export default function CoachNotes({ athleteName, onNoteSave, initialNote = null, onCancel }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customText, setCustomText] = useState('');
  const [regulationTools, setRegulationTools] = useState([]);
  const [reEntryPhrase, setReEntryPhrase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load initial note if editing
  useEffect(() => {
    if (initialNote) {
      try {
        const note = typeof initialNote === 'string' ? JSON.parse(initialNote) : initialNote;
        
        // Handle both old and new format
        const cats = note.categories || [note.category];
        const tools = note.regulationTools || (note.regulationTool ? [note.regulationTool] : []);
        
        setSelectedCategories(cats);
        setSelectedTemplate(note.text);
        setCustomText(note.customText || '');
        setRegulationTools(tools);
        setReEntryPhrase(note.reEntryPhrase);
        setIsEditing(true);
      } catch (error) {
        console.error('Error parsing initial note:', error);
      }
    }
  }, [initialNote]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    // Reset template when categories change
    setSelectedTemplate(null);
    setCustomText('');
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomText(''); // Reset custom text when selecting a template
  };

  const handleRegulationToolToggle = (tool) => {
    setRegulationTools(prev => {
      if (prev.includes(tool)) {
        return prev.filter(t => t !== tool);
      } else {
        return [...prev, tool];
      }
    });
  };

  const handleSave = () => {
    if (selectedCategories.length === 0 || !selectedTemplate) {
      alert('Please select at least one category and a note template');
      return;
    }

    const noteObject = createNoteObject({
      categories: selectedCategories,
      text: selectedTemplate,
      customText: customText.trim() || null,
      regulationTools,
      reEntryPhrase: regulationTools.length > 0 ? reEntryPhrase : null,
      athleteName
    });

    onNoteSave(noteObject);
  };

  const handleSkip = () => {
    onCancel?.();
  };

  const showRegulationTools = selectedCategories.includes(NOTE_CATEGORIES.CO_REGULATION) ||
                              selectedCategories.includes(NOTE_CATEGORIES.REGULATION_SUPPORT);

  const availableTemplates = getRelevantTemplates(selectedCategories);

  return (
    <div className="coach-notes-container" style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📝 Session Notes: {athleteName}</h3>
        <p style={styles.subtitle}>
          Select one or more categories, then choose or customize a note template
        </p>
      </div>

      {/* Category Selection - Multi-select */}
      <div style={styles.categoryGrid}>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const isSelected = selectedCategories.includes(key);
          return (
            <label
              key={key}
              style={{
                ...styles.categoryCard,
                borderColor: config.borderColor,
                backgroundColor: isSelected ? config.bgColor : '#fff',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCategoryToggle(key)}
                style={styles.checkbox}
              />
              <span style={styles.categoryEmoji}>{config.emoji}</span>
              <span style={styles.categoryLabel}>{config.label}</span>
            </label>
          );
        })}
      </div>

      {/* Selected Categories Indicator */}
      {selectedCategories.length > 0 && (
        <div style={styles.selectedIndicator}>
          {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
        </div>
      )}

      {/* Template Selection */}
      {selectedCategories.length > 0 && (
        <div style={styles.templateSection}>
          <h4 style={styles.templateTitle}>Note Templates</h4>
          {availableTemplates.length > 0 ? (
            <div style={styles.templateGrid}>
              {availableTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  style={{
                    ...styles.templateButton,
                    ...(selectedTemplate === template ? styles.templateButtonSelected : {})
                  }}
                >
                  {template}
                </button>
              ))}
            </div>
          ) : (
            <div style={styles.noTemplates}>
              No templates available for this combination yet
            </div>
          )}
        </div>
      )}

      {/* Text Editing */}
      {selectedTemplate && (
        <div style={styles.editSection}>
          <label style={styles.editLabel}>
            Customize note (optional - leave blank to use template text):
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={selectedTemplate}
            style={styles.textarea}
            rows={3}
          />
          <p style={styles.editHint}>
            Tip: Use factual, observable language. Replace [skill/behaviour/issue] with specific details.
          </p>
        </div>
      )}

      {/* Regulation Tools - Multi-select */}
      {showRegulationTools && selectedTemplate && (
        <div style={styles.regulationSection}>
          <h4 style={styles.regulationTitle}>🔧 Regulation Tool Used</h4>
          <p style={styles.regulationSubtitle}>
            Select the regulation tool(s) that were used during this session:
          </p>
          <div style={styles.regulationGrid}>
            {REGULATION_TOOLS.map((tool) => {
              const isSelected = regulationTools.includes(tool);
              return (
                <button
                  key={tool}
                  onClick={() => handleRegulationToolToggle(tool)}
                  style={{
                    ...styles.regulationButton,
                    ...(isSelected ? styles.regulationButtonSelected : {})
                  }}
                >
                  {tool}
                </button>
              );
            })}
          </div>

          {regulationTools.length > 0 && (
            <div style={styles.reEntrySection}>
              <label style={styles.reEntryLabel}>Re-entry phrase delivered?</label>
              <div style={styles.reEntryButtons}>
                <button
                  onClick={() => setReEntryPhrase(true)}
                  style={{
                    ...styles.reEntryButton,
                    ...(reEntryPhrase === true ? styles.reEntryButtonYes : {})
                  }}
                >
                  ✓ Yes
                </button>
                <button
                  onClick={() => setReEntryPhrase(false)}
                  style={{
                    ...styles.reEntryButton,
                    ...(reEntryPhrase === false ? styles.reEntryButtonNo : {})
                  }}
                >
                  ✗ No
                </button>
              </div>
              <p style={styles.reEntryHint}>
                Example: "You're back in. You're calling match-ups."
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button onClick={handleSkip} style={styles.skipButton}>
          Skip for Now
        </button>
        <button
          onClick={handleSave}
          disabled={selectedCategories.length === 0 || !selectedTemplate}
          style={{
            ...styles.saveButton,
            ...((selectedCategories.length === 0 || !selectedTemplate) ? styles.saveButtonDisabled : {})
          }}
        >
          Save Note
        </button>
      </div>

      {/* Compliance Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>{COMPLIANCE_FOOTER}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    maxWidth: '900px',
    margin: '0 auto',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    marginBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },
  categoryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    border: '2px solid',
    borderRadius: '12px',
    transition: 'all 0.2s',
    position: 'relative'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#007AFF'
  },
  categoryEmoji: {
    fontSize: '24px'
  },
  categoryLabel: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '500',
    color: '#1d1d1f'
  },
  selectedIndicator: {
    display: 'inline-block',
    backgroundColor: '#007AFF',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    marginBottom: '20px',
    fontWeight: '500'
  },
  templateSection: {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px'
  },
  templateTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px'
  },
  templateGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  templateButton: {
    padding: '14px 18px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '15px',
    transition: 'all 0.15s',
    color: '#1d1d1f'
  },
  templateButtonSelected: {
    backgroundColor: '#E6F2FF',
    borderColor: '#007AFF',
    fontWeight: '500',
    transform: 'translateX(4px)'
  },
  noTemplates: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontSize: '15px'
  },
  editSection: {
    marginBottom: '24px'
  },
  editLabel: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    padding: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  editHint: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '6px',
    fontStyle: 'italic'
  },
  regulationSection: {
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#E6F2FF',
    borderRadius: '12px',
    border: '2px solid #007AFF'
  },
  regulationTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  regulationSubtitle: {
    fontSize: '14px',
    color: '#1d1d1f',
    marginBottom: '16px'
  },
  regulationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '10px',
    marginBottom: '16px'
  },
  regulationButton: {
    padding: '12px 16px',
    border: '2px solid #007AFF',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.15s',
    fontWeight: '500',
    color: '#1d1d1f'
  },
  regulationButtonSelected: {
    backgroundColor: '#007AFF',
    color: '#fff',
    transform: 'scale(1.02)'
  },
  reEntrySection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '2px solid #007AFF',
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px'
  },
  reEntryLabel: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: '12px'
  },
  reEntryButtons: {
    display: 'flex',
    gap: '12px'
  },
  reEntryButton: {
    padding: '12px 24px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.15s',
    color: '#1d1d1f'
  },
  reEntryButtonYes: {
    backgroundColor: '#10b981',
    color: '#fff',
    borderColor: '#10b981'
  },
  reEntryButtonNo: {
    backgroundColor: '#ef4444',
    color: '#fff',
    borderColor: '#ef4444'
  },
  reEntryHint: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '8px',
    fontStyle: 'italic'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginBottom: '16px',
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb'
  },
  skipButton: {
    padding: '12px 24px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.15s'
  },
  saveButton: {
    padding: '12px 32px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#34C759',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.15s'
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  footer: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  footerText: {
    fontSize: '11px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5'
  }
};