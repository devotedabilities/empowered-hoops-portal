import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import './ExportableSummary.css';

function ExportableSummary({ termConfig, athletes, spreadsheetUrl }) {
  const summaryRef = useRef(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const element = summaryRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `${termConfig.programType}-${termConfig.termName}-${termConfig.year}-Summary.png`;
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      });
    } catch (error) {
      console.error('Error exporting summary:', error);
      alert('Failed to export summary. Please try again.');
      setIsExporting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="export-container">
      {/* The part that gets exported */}
      <div ref={summaryRef} className="exportable-summary">
        {/* Header with logo/branding */}
        <div className="summary-header">
          <div className="summary-logo">
            <h1>🏀 EMPOWERED HOOPS</h1>
            <p>Inclusive Social Skills Program</p>
          </div>
        </div>

        {/* Term Details */}
        <div className="summary-section">
          <h2>📋 Term Details</h2>
          <div className="summary-details-grid">
            <div className="summary-detail">
              <span className="detail-label">Program:</span>
              <span className="detail-value">{termConfig.programType}</span>
            </div>
            <div className="summary-detail">
              <span className="detail-label">Term:</span>
              <span className="detail-value">{termConfig.termName} {termConfig.year}</span>
            </div>
            <div className="summary-detail">
              <span className="detail-label">Coach:</span>
              <span className="detail-value">{termConfig.coachName}</span>
            </div>
            <div className="summary-detail">
              <span className="detail-label">Session Day:</span>
              <span className="detail-value">{termConfig.sessionDay}s</span>
            </div>
            <div className="summary-detail">
              <span className="detail-label">Start Date:</span>
              <span className="detail-value">{formatDate(termConfig.startDate)}</span>
            </div>
            <div className="summary-detail">
              <span className="detail-label">Session Time:</span>
              <span className="detail-value">{termConfig.sessionTime}</span>
            </div>
            <div className="summary-detail">
              <span className="detail-label">Total Sessions:</span>
              <span className="detail-value">{termConfig.numberOfSessions} weeks</span>
            </div>
            <div className="summary-detail">
              <span className="detail-label">Early Sign-ups:</span>
              <span className="detail-value">{athletes.length}</span>
            </div>
          </div>
        </div>



        {/* Footer */}
        <div className="summary-footer">
          <p className="summary-footer-text">
            📧 For questions: info@devotedabilities.com
          </p>
          <p className="summary-footer-text">
            📍 Central Coast, NSW, Australia
          </p>
          <p className="summary-date">
            Generated: {new Date().toLocaleDateString('en-AU', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Export Button (not included in export) */}
      <div className="export-actions">
        <button 
          className="btn-export" 
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="export-spinner"></span>
              Exporting...
            </>
          ) : (
            <>
              📸 Export Summary as Image
            </>
          )}
        </button>
        <p className="export-hint">
          💡 Share this summary with parents and guardians
        </p>
      </div>
    </div>
  );
}

export default ExportableSummary;
