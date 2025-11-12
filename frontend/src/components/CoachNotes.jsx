import React, { useState, useEffect } from 'react';
import {
  NOTE_CATEGORIES,
  CATEGORY_CONFIG,
  NOTE_TEMPLATES,
  REGULATION_TOOLS,
  createNoteObject,
  COMPLIANCE_FOOTER
} from '../utils/coachNotesSchema';

/**
 * CoachNotes Component
 * Provides structured note-taking interface for coaches aligned with
 * Empowered Hoops Behaviour Management Manual v1.2
 */
export default function CoachNotes({ athleteName, onNoteSave, initialNote = null, onCancel }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customText, setCustomText] = useState('');
  const [showRegulationPrompt, setShowRegulationPrompt] = useState(false);
  const [regulationTool, setRegulationTool] = useState(null);
  const [reEntryPhrase, setReEntryPhrase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load initial note if editing
  useEffect(() => {
    if (initialNote) {
      try {
        const note = typeof initialNote === 'string' ? JSON.parse(initialNote) : initialNote;
        setSelectedCategory(note.category);
        setSelectedTemplate(note.text);
        setCustomText(note.customText || '');
        setRegulationTool(note.regulationTool);
        setReEntryPhrase(note.reEntryPhrase);
        setIsEditing(true);

        // Show regulation prompt if applicable
        if (
          (note.category === NOTE_CATEGORIES.CO_REGULATION ||
            note.category === NOTE_CATEGORIES.REGULATION_SUPPORT) &&
          note.regulationTool
        ) {
          setShowRegulationPrompt(true);
        }
      } catch (error) {
        console.error('Error parsing initial note:', error);
      }
    }
  }, [initialNote]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedTemplate(null);
    setCustomText('');
    setShowRegulationPrompt(false);
    setRegulationTool(null);
    setReEntryPhrase(null);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomText(''); // Reset custom text when selecting a template

    // Check if regulation prompt should be shown
    if (
      selectedCategory === NOTE_CATEGORIES.CO_REGULATION ||
      selectedCategory === NOTE_CATEGORIES.REGULATION_SUPPORT
    ) {
      setShowRegulationPrompt(true);
    }
  };

  const handleSave = () => {
    if (!selectedCategory || !selectedTemplate) {
      alert('Please select a category and note template');
      return;
    }

    const noteObject = createNoteObject({
      category: selectedCategory,
      text: selectedTemplate,
      customText: customText.trim() || null,
      regulationTool,
      reEntryPhrase,
      athleteName
    });

    onNoteSave(noteObject);
  };

  const handleSkip = () => {
    onCancel?.();
  };

  return (
    <div className="coach-notes-container" style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Session Notes: {athleteName}</h3>
        <p style={styles.subtitle}>
          Select a category and note template. You can edit the text before saving.
        </p>
      </div>

      {/* Category Selection */}
      <div style={styles.categoryGrid}>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => handleCategorySelect(key)}
            style={{
              ...styles.categoryButton,
              ...(selectedCategory === key ? styles.categoryButtonSelected : {}),
              borderColor: config.borderColor,
              backgroundColor: selectedCategory === key ? config.bgColor : '#fff'
            }}
          >
            <span style={styles.categoryEmoji}>{config.emoji}</span>
            <span style={styles.categoryLabel}>{config.label}</span>
          </button>
        ))}
      </div>

      {/* Template Selection */}
      {selectedCategory && (
        <div style={styles.templateSection}>
          <h4 style={styles.templateTitle}>Select a note template:</h4>
          <div style={styles.templateGrid}>
            {NOTE_TEMPLATES[selectedCategory].map((template, index) => (
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
        </div>
      )}

      {/* Text Editing */}
      {selectedTemplate && (
        <div style={styles.editSection}>
          <label style={styles.editLabel}>
            Edit note (optional - leave blank to use template text):
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

      {/* Regulation Tool Prompt */}
      {showRegulationPrompt && selectedTemplate && (
        <div style={styles.regulationSection}>
          <h4 style={styles.regulationTitle}>🔧 Regulation Tool Used</h4>
          <p style={styles.regulationSubtitle}>
            Select the regulation tool that was used during this session:
          </p>
          <div style={styles.regulationGrid}>
            {REGULATION_TOOLS.map((tool) => (
              <button
                key={tool}
                onClick={() => setRegulationTool(tool)}
                style={{
                  ...styles.regulationButton,
                  ...(regulationTool === tool ? styles.regulationButtonSelected : {})
                }}
              >
                {tool}
              </button>
            ))}
          </div>

          {regulationTool && (
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
          disabled={!selectedCategory || !selectedTemplate}
          style={{
            ...styles.saveButton,
            ...((!selectedCategory || !selectedTemplate) ? styles.saveButtonDisabled : {})
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
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '900px',
    margin: '0 auto'
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
    marginBottom: '24px'
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    border: '2px solid',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
    fontWeight: '500'
  },
  categoryButtonSelected: {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  categoryEmoji: {
    fontSize: '20px'
  },
  categoryLabel: {
    flex: 1,
    textAlign: 'left'
  },
  templateSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  templateTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  },
  templateGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  templateButton: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  templateButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    fontWeight: '500'
  },
  editSection: {
    marginBottom: '24px'
  },
  editLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  editHint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    fontStyle: 'italic'
  },
  regulationSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe'
  },
  regulationTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '8px'
  },
  regulationSubtitle: {
    fontSize: '14px',
    color: '#1e40af',
    marginBottom: '12px'
  },
  regulationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '8px',
    marginBottom: '16px'
  },
  regulationButton: {
    padding: '10px 14px',
    border: '1px solid #93c5fd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  regulationButtonSelected: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderColor: '#2563eb',
    fontWeight: '500'
  },
  reEntrySection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #bfdbfe'
  },
  reEntryLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: '8px'
  },
  reEntryButtons: {
    display: 'flex',
    gap: '12px'
  },
  reEntryButton: {
    padding: '10px 20px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  reEntryButtonYes: {
    backgroundColor: '#10b981',
    color: '#fff',
    borderColor: '#059669'
  },
  reEntryButtonNo: {
    backgroundColor: '#ef4444',
    color: '#fff',
    borderColor: '#dc2626'
  },
  reEntryHint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
    fontStyle: 'italic'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginBottom: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  skipButton: {
    padding: '10px 20px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280'
  },
  saveButton: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  footer: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb'
  },
  footerText: {
    fontSize: '11px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.4'
  }
};
