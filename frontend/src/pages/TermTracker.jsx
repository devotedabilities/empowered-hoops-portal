import { useState } from 'react';
import TermConfigForm from '../components/term-tracker/TermConfigForm';
import AthleteForm from '../components/term-tracker/AthleteForm';
import ConfirmationScreen from '../components/term-tracker/ConfirmationScreen';

const API_ENDPOINT = 'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/createTermTracker';

function TermTracker({ user }) {
  const [step, setStep] = useState(1);
  const [termConfig, setTermConfig] = useState({
    programType: '',
    termName: '',
    year: '',
    coachName: user.name, // Pre-fill with logged-in user's name
    sessionDay: '',
    sessionTime: '',
    sessionEndTime: '',
    startDate: '',
    numberOfSessions: 10,
  });
  const [athletes, setAthletes] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate session dates based on start date
  const calculateSessionDates = () => {
    if (!termConfig.startDate) return [];
    
    const dates = [];
    const start = new Date(termConfig.startDate);
    
    for (let i = 0; i < termConfig.numberOfSessions; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + (i * 7));
      dates.push(date);
    }
    
    return dates;
  };

  // Format time for display
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          termConfig: {
            ...termConfig,
            termName: `${termConfig.termName} ${termConfig.year}`,
            sessionTime: `${formatTime(termConfig.sessionTime)} - ${formatTime(termConfig.sessionEndTime)}`,
          },
          athletes,
          createdBy: user.email, // Use logged-in user's email
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setStep(3);
      } else {
        setError(data.message || 'Failed to create term tracker');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetTracker = () => {
    setStep(1);
    setTermConfig({
      programType: '',
      termName: '',
      year: '',
      coachName: user.name,
      sessionDay: '',
      sessionTime: '',
      sessionEndTime: '',
      startDate: '',
      numberOfSessions: 10,
    });
    setAthletes([]);
    setResult(null);
  };

  return (
    <div className="term-tracker-page">
      <div className="page-header-compact">
        <h1>🏀 Term Tracker Creator</h1>
        <div className="step-indicator-compact">
          <span className={step >= 1 ? 'active' : ''}>1. Term Details</span>
          <span className={step >= 2 ? 'active' : ''}>2. Athletes</span>
          <span className={step >= 3 ? 'active' : ''}>3. Complete</span>
        </div>
      </div>

      {step === 1 && (
        <TermConfigForm
          termConfig={termConfig}
          setTermConfig={setTermConfig}
          calculateSessionDates={calculateSessionDates}
          onNext={() => setStep(2)}
        />
      )}
      
      {step === 2 && (
        <AthleteForm
          athletes={athletes}
          setAthletes={setAthletes}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      )}
      
      {step === 3 && result && (
        <ConfirmationScreen
          result={result}
          termConfig={termConfig}
          athletes={athletes}
          onCreateAnother={resetTracker}
        />
      )}
    </div>
  );
}

export default TermTracker;
