import React from 'react';
import './LoadingModal.css';

function LoadingModal({ isLoading, message = "Creating your term tracker..." }) {
  if (!isLoading) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-spinner-large"></div>
        <h3 className="loading-modal-title">{message}</h3>
        <p className="loading-modal-subtitle">
          This may take a few moments. Please don't close this window.
        </p>
        <div className="loading-steps">
          <div className="loading-step">
            <div className="loading-step-icon">📋</div>
            <span>Creating spreadsheet...</span>
          </div>
          <div className="loading-step">
            <div className="loading-step-icon">👥</div>
            <span>Adding athletes...</span>
          </div>
          <div className="loading-step">
            <div className="loading-step-icon">📅</div>
            <span>Setting up schedule...</span>
          </div>
          <div className="loading-step">
            <div className="loading-step-icon">✨</div>
            <span>Finalizing tracker...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingModal;
