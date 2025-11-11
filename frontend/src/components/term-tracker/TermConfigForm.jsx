import { useState, useEffect } from 'react';

// NSW School Term Dates
const NSW_TERM_DATES = {
  2025: {
    'Term 1': { start: '2025-01-28', end: '2025-04-11' },
    'Term 2': { start: '2025-04-28', end: '2025-07-04' },
    'Term 3': { start: '2025-07-21', end: '2025-09-26' },
    'Term 4': { start: '2025-10-13', end: '2025-12-19' },
    'EOY Holidays': { start: '2025-12-20', end: '2026-01-27' },
  },
  2026: {
    'Term 1': { start: '2026-01-27', end: '2026-04-09' },
    'Term 2': { start: '2026-04-27', end: '2026-07-03' },
    'Term 3': { start: '2026-07-20', end: '2026-09-25' },
    'Term 4': { start: '2026-10-12', end: '2026-12-18' },
    'EOY Holidays': { start: '2026-12-19', end: '2027-01-26' },
  },
  2027: {
    'Term 1': { start: '2027-01-27', end: '2027-04-08' },
    'Term 2': { start: '2027-04-26', end: '2027-07-02' },
    'Term 3': { start: '2027-07-19', end: '2027-09-24' },
    'Term 4': { start: '2027-10-11', end: '2027-12-17' },
    'EOY Holidays': { start: '2027-12-18', end: '2028-01-25' },
  },
  2028: {
    'Term 1': { start: '2028-01-26', end: '2028-04-13' },
    'Term 2': { start: '2028-05-01', end: '2028-07-07' },
    'Term 3': { start: '2028-07-24', end: '2028-09-29' },
    'Term 4': { start: '2028-10-16', end: '2028-12-22' },
    'EOY Holidays': { start: '2028-12-23', end: '2029-01-30' },
  },
  2029: {
    'Term 1': { start: '2029-01-30', end: '2029-04-13' },
    'Term 2': { start: '2029-04-30', end: '2029-07-06' },
    'Term 3': { start: '2029-07-23', end: '2029-09-28' },
    'Term 4': { start: '2029-10-15', end: '2029-12-21' },
    'EOY Holidays': { start: '2029-12-22', end: '2030-01-29' },
  },
  2030: {
    'Term 1': { start: '2030-01-29', end: '2030-04-12' },
    'Term 2': { start: '2030-04-29', end: '2030-07-05' },
    'Term 3': { start: '2030-07-22', end: '2030-09-27' },
    'Term 4': { start: '2030-10-14', end: '2030-12-20' },
    'EOY Holidays': { start: '2030-12-21', end: '2031-01-28' },
  },
};

const DAY_MAP = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
};

function TermConfigForm({ termConfig, setTermConfig, calculateSessionDates, onNext }) {
  const [autoCalculated, setAutoCalculated] = useState(false);
  const [wasAutoCalculated, setWasAutoCalculated] = useState(false);
  const [showTermDateInfo, setShowTermDateInfo] = useState(true);
  const [showReviewNote, setShowReviewNote] = useState(true);
  const [showInfoNote, setShowInfoNote] = useState(true);
  const [errors, setErrors] = useState({});
  
  const sessionDates = calculateSessionDates();

  const handleChange = (field, value) => {
    setTermConfig({ ...termConfig, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  // Find first occurrence of a day within a date range
  const findFirstDayInRange = (dayName, startDate, endDate) => {
    const targetDay = DAY_MAP[dayName];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let current = new Date(start);
    
    while (current <= end) {
      if (current.getDay() === targetDay) {
        return current.toISOString().split('T')[0];
      }
      current.setDate(current.getDate() + 1);
    }
    
    return null;
  };

  // Auto-calculate start date when term/year/day are all selected
  const autoCalculateStartDate = (updatedConfig) => {
    const config = updatedConfig || termConfig;
    const { termName, year, sessionDay } = config;
    
    if (termName && year && sessionDay && NSW_TERM_DATES[year]?.[termName]) {
      const termDates = NSW_TERM_DATES[year][termName];
      const calculatedDate = findFirstDayInRange(
        sessionDay,
        termDates.start,
        termDates.end
      );
      
      if (calculatedDate && calculatedDate !== config.startDate) {
        setTermConfig({ ...config, startDate: calculatedDate });
        setAutoCalculated(true);
        setWasAutoCalculated(true);
        // Clear the auto-calculated notice after 8 seconds
        setTimeout(() => setAutoCalculated(false), 8000);
      }
    }
  };

  // Handle changes that should trigger auto-calculation
  const handleSmartChange = (field, value) => {
    const updatedConfig = { ...termConfig, [field]: value };
    setTermConfig(updatedConfig);
    
    // Clear error
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
    
    // Trigger auto-calculation if we have all required fields
    if (['termName', 'year', 'sessionDay'].includes(field)) {
      setTimeout(() => autoCalculateStartDate(updatedConfig), 0);
    }
  };

  // Handle start date change and auto-select day
  const handleStartDateChange = (date) => {
    setTermConfig({ ...termConfig, startDate: date });
    
    if (date && !termConfig.sessionDay) {
      const dateObj = new Date(date);
      const dayName = Object.keys(DAY_MAP).find(
        key => DAY_MAP[key] === dateObj.getDay()
      );
      
      if (dayName) {
        setTermConfig({ ...termConfig, startDate: date, sessionDay: dayName });
      }
    }
  };

  // Get term date range for display
  const getTermDateRange = () => {
    const { termName, year } = termConfig;
    if (termName && year && NSW_TERM_DATES[year]?.[termName]) {
      const termDates = NSW_TERM_DATES[year][termName];
      const start = new Date(termDates.start).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
      const end = new Date(termDates.end).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${start} - ${end}`;
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};

    if (!termConfig.coachName.trim()) {
      newErrors.coachName = 'Coach name is required';
    }
    if (!termConfig.programType) {
      newErrors.programType = 'Please select a program type';
    }
    if (!termConfig.termName) {
      newErrors.termName = 'Please select a term';
    }
    if (!termConfig.year) {
      newErrors.year = 'Please select a year';
    }
    if (!termConfig.sessionDay) {
      newErrors.sessionDay = 'Please select a session day';
    }
    if (!termConfig.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!termConfig.sessionTime) {
      newErrors.sessionTime = 'Start time is required';
    }
    if (!termConfig.sessionEndTime) {
      newErrors.sessionEndTime = 'End time is required';
    }

    // Validate that end time is after start time
    if (termConfig.sessionTime && termConfig.sessionEndTime) {
      const start = parseInt(termConfig.sessionTime.replace(':', ''));
      const end = parseInt(termConfig.sessionEndTime.replace(':', ''));
      if (end <= start) {
        newErrors.sessionEndTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="form-container">
      <h2>Step 1: Term Details</h2>

      <div className="form-group">
        <label htmlFor="coachName">
          Coach Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="coachName"
          placeholder="e.g., Noah Cotter"
          value={termConfig.coachName}
          onChange={(e) => handleChange('coachName', e.target.value)}
          className={errors.coachName ? 'error' : ''}
        />
        {errors.coachName && (
          <span className="error-message">{errors.coachName}</span>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="programType">
          Program Type <span className="required">*</span>
        </label>
        <select
          id="programType"
          value={termConfig.programType}
          onChange={(e) => handleChange('programType', e.target.value)}
          className={errors.programType ? 'error' : ''}
        >
          <option value="">-- Select Program --</option>
          <option value="EH Academy">EH Academy</option>
          <option value="EH Adults">EH Adults</option>
          <option value="EH JR Academy">EH JR Academy</option>
        </select>
        {errors.programType && (
          <span className="error-message">{errors.programType}</span>
        )}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="termName">
            Term Name <span className="required">*</span>
          </label>
          <select
            id="termName"
            value={termConfig.termName}
            onChange={(e) => handleSmartChange('termName', e.target.value)}
            className={errors.termName ? 'error' : ''}
          >
            <option value="">-- Select Term --</option>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
            <option value="Term 4">Term 4</option>
            <option value="EOY Holidays">EOY Holidays</option>
          </select>
          {errors.termName && (
            <span className="error-message">{errors.termName}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="year">
            Year <span className="required">*</span>
          </label>
          <select
            id="year"
            value={termConfig.year}
            onChange={(e) => handleSmartChange('year', e.target.value)}
            className={errors.year ? 'error' : ''}
          >
            <option value="">-- Select Year --</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>
          {errors.year && (
            <span className="error-message">{errors.year}</span>
          )}
        </div>
      </div>
      
      {getTermDateRange() && showTermDateInfo && (
        <div className="term-date-info">
          <span>📅 NSW School Dates: {getTermDateRange()}</span>
          <button 
            className="close-notice-btn"
            onClick={() => setShowTermDateInfo(false)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="sessionDay">
          Session Day <span className="required">*</span>
        </label>
        <select
          id="sessionDay"
          value={termConfig.sessionDay}
          onChange={(e) => handleSmartChange('sessionDay', e.target.value)}
          className={errors.sessionDay ? 'error' : ''}
        >
          <option value="">-- Select Day --</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
        {errors.sessionDay && (
          <span className="error-message">{errors.sessionDay}</span>
        )}
      </div>
      
      {autoCalculated && (
        <div className="auto-calculated-notice">
          <span>✨ Start date auto-calculated to first {termConfig.sessionDay} of term</span>
          <button 
            className="close-notice-btn"
            onClick={() => setAutoCalculated(false)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="startDate">
          Start Date <span className="required">*</span>
        </label>
        <input
          type="date"
          id="startDate"
          value={termConfig.startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className={errors.startDate ? 'error' : ''}
        />
        {errors.startDate && (
          <span className="error-message">{errors.startDate}</span>
        )}
      </div>
      
      {showInfoNote && (
        <div className="info-note">
          <span><em>💡 Note: Session times can be adjusted later in the spreadsheet</em></span>
          <button 
            className="close-notice-btn info-close-btn"
            onClick={() => setShowInfoNote(false)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sessionTime">
            Start Time <span className="required">*</span>
          </label>
          <input
            type="time"
            id="sessionTime"
            value={termConfig.sessionTime}
            onChange={(e) => handleChange('sessionTime', e.target.value)}
            className={errors.sessionTime ? 'error' : ''}
          />
          {errors.sessionTime && (
            <span className="error-message">{errors.sessionTime}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="sessionEndTime">
            End Time <span className="required">*</span>
          </label>
          <input
            type="time"
            id="sessionEndTime"
            value={termConfig.sessionEndTime}
            onChange={(e) => handleChange('sessionEndTime', e.target.value)}
            className={errors.sessionEndTime ? 'error' : ''}
          />
          {errors.sessionEndTime && (
            <span className="error-message">{errors.sessionEndTime}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn-link"
        onClick={() => {
          setTermConfig({
            ...termConfig,
            sessionTime: '17:00',
            sessionEndTime: '18:00'
          });
          // Clear errors for these fields
          setErrors({
            ...errors,
            sessionTime: null,
            sessionEndTime: null
          });
        }}
      >
        ⁉️ Use Placeholder Times (5-6pm)
      </button>
      
      <div className="form-group">
        <label htmlFor="numberOfSessions">Number of Sessions</label>
        <input
          type="number"
          id="numberOfSessions"
          min="1"
          max="20"
          value={termConfig.numberOfSessions}
          onChange={(e) => handleChange('numberOfSessions', parseInt(e.target.value) || 10)}
        />
        <small className="help-text">
          Default is 10 sessions (10 weeks)
        </small>
      </div>
      
      {wasAutoCalculated && sessionDates.length > 0 && showReviewNote && (
        <div className="review-note">
          <span>↓ Review session dates below, then click Next at the bottom ↓</span>
          <button 
            className="close-notice-btn"
            onClick={() => setShowReviewNote(false)}
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {/* Session Preview */}
      {termConfig.startDate && sessionDates.length > 0 && (
        <div className="session-preview">
          <h3>📅 Session Schedule Preview</h3>
          <p>
            {termConfig.numberOfSessions} sessions starting{' '}
            {new Date(termConfig.startDate).toLocaleDateString('en-AU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div className="session-dates">
            {sessionDates.map((date, index) => (
              <span key={index} className="session-date">
                Session {index + 1}: {date.toLocaleDateString('en-AU')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="form-actions">
        <button type="button" className="btn-primary" onClick={handleNext}>
          Next: Add Athletes →
        </button>
      </div>
    </div>
  );
}

export default TermConfigForm;
