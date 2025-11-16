import { useEffect } from 'react';
import { useState } from 'react';
import ExportableSummary from '../ExportableSummary';
import { useAuth } from '../../contexts/AuthContext';

function ConfirmationScreen({ result, termConfig, athletes, onCreateAnother }) {
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    console.log('Term tracker created successfully!', result);
  }, [result]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">
          <div className="checkmark-circle">
            <div className="checkmark">✓</div>
          </div>
        </div>

        <h1 className="success-title">Term Tracker Created!</h1>
        <p className="success-message">
          Your attendance and payment tracker has been successfully created and is
          ready to use.
        </p>

        <div className="term-summary">
          <h2>📋 Term Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Program:</span>
              <span className="summary-value">{termConfig.programType}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Term:</span>
              <span className="summary-value">
                {termConfig.termName} {termConfig.year}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Coach:</span>
              <span className="summary-value">{termConfig.coachName}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Session:</span>
              <span className="summary-value">
                {termConfig.sessionDay}s at {termConfig.sessionTime}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Starting:</span>
              <span className="summary-value">
                {formatDate(termConfig.startDate)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">
                {termConfig.numberOfSessions} sessions (
                {termConfig.numberOfSessions} weeks)
              </span>
            </div>
          </div>
        </div>

        {isAdmin() && (
          <div className="spreadsheet-link-section">
            <h3>📊 Your Spreadsheet</h3>
            <p className="link-description">
              Click below to open your new term tracker spreadsheet:
            </p>
            <a
              href={result.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-spreadsheet"
            >
              <span className="spreadsheet-icon">📊</span>
              Open Spreadsheet
              <span className="external-icon">↗</span>
            </a>
            <p className="link-help">
              The spreadsheet has been saved to your Empowered Hoops Shared Drive.
            </p>
          </div>
        )}

        <ExportableSummary 
          termConfig={termConfig}
          athletes={athletes || []}
          spreadsheetUrl={result.sheetUrl}
        />

        <div className="next-steps">
          <h3>✅ Next Steps</h3>
          <ol className="steps-list">
            <li>
              <strong>Review the spreadsheet</strong> - Check that all details are
              correct
            </li>
            <li>
              <strong>Mark attendance</strong> - Update attendance after each
              session
            </li>
            <li>
              <strong>Track payments</strong> - Monitor payment status for each
              athlete
            </li>
            <li>
              <strong>Share with your team</strong> - The spreadsheet is already
              shared with authorized users
            </li>
          </ol>
        </div>

        <div className="confirmation-actions">
          <button
            type="button"
            className="btn-primary btn-large"
            onClick={onCreateAnother}
          >
            ➕ Create Another Tracker
          </button>
          <a href="/" className="btn-secondary btn-large">
            ← Back to Dashboard
          </a>
        </div>

        <div className="additional-info">
          <p className="info-text">
            <strong>💡 Pro Tip:</strong> Bookmark the spreadsheet for quick access
            during your sessions!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationScreen;
