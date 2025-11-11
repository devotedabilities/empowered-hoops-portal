import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './TermTrackerList.css';

function TermTrackerList() {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterTerm, setFilterTerm] = useState('All');
  const [filterYear, setFilterYear] = useState('All'); 
  
  const getProgramColor = (programType) => {
    if (programType.includes('Adults') || programType.includes('ADULTS')) {
      return 'green';
    } else if (programType.includes('JR') || programType.includes('Jr')) {
      return 'yellow';
    } else if (programType.includes('Academy') || programType.includes('ACADEMY')) {
      return 'purple';
    }
    return 'purple';
  };

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteTrackers');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (trackerId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(trackerId)
        ? prev.filter(id => id !== trackerId)
        : [...prev, trackerId];
      localStorage.setItem('favoriteTrackers', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (trackerId) => favorites.includes(trackerId);

  useEffect(() => {
    fetchTrackers();
  }, []);

  const fetchTrackers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://us-central1-empowered-hoops-term-tra-341d5.cloudfunctions.net/listTermTrackers'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch term trackers');
      }

      const data = await response.json();
      
      if (data.success) {
        // FILTER BY ROLE: Coaches only see their own trackers
        let filteredByRole = data.trackers;
        
        if (!isAdmin()) {
          // Coach can only see trackers they created
          filteredByRole = data.trackers.filter(tracker => 
            tracker.createdBy === currentUser.email || 
            tracker.name === currentUser.displayName ||
            tracker.name === currentUser.email
          );
        }
        
        setTrackers(filteredByRole);
      } else {
        throw new Error(data.message || 'Failed to load trackers');
      }
    } catch (err) {
      console.error('Error fetching trackers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const programTypes = ['All', ...new Set(trackers.map(t => t.programType))];

  const termOptions = ['All', ...new Set(trackers.map(t => {
    const match = t.termName.match(/Term \d+/i);
    return match ? match[0] : null;
  }).filter(Boolean))];

  const yearOptions = ['All', ...new Set(trackers.map(t => {
    const match = t.termName.match(/\d{4}/);
    return match ? match[0] : null;
  }).filter(Boolean))].sort().reverse();

  const filteredTrackers = trackers.filter(tracker => {
    const matchesSearch = 
      tracker.termName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tracker.programType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tracker.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgram = filterProgram === 'All' || tracker.programType === filterProgram;
    const matchesTerm = filterTerm === 'All' || tracker.termName.includes(filterTerm);
    const matchesYear = filterYear === 'All' || tracker.termName.includes(filterYear);
    
    return matchesSearch && matchesProgram && matchesTerm && matchesYear;
  });

  const sortedTrackers = [...filteredTrackers].sort((a, b) => {
    const aFav = isFavorite(a.id);
    const bFav = isFavorite(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="term-tracker-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📊 Term Tracker Management</h1>
          <p className="subtitle">
            {isAdmin() ? 'View and manage all term trackers' : 'View and manage your term trackers'}
          </p>
        </div>
        <button 
          className="btn-create-new"
          onClick={() => navigate('/term-tracker/create')}
        >
          ➕ Create New Term Tracker
        </button>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by term name or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Program:</label>
          <select 
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="filter-select"
          >
            {programTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Term:</label>
          <select 
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="filter-select"
          >
            {termOptions.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Year:</label>
          <select 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="filter-select"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <button 
          className="btn-clear-filters"
          onClick={() => {
            setSearchTerm('');
            setFilterProgram('All');
            setFilterTerm('All');
            setFilterYear('All');
          }}
          title="Clear all filters"
        >
          ✕ Clear
        </button>

        <button 
          className="btn-refresh"
          onClick={fetchTrackers}
          title="Refresh list"
        >
          🔄
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading term trackers...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p className="error-message">❌ {error}</p>
          <button className="btn-retry" onClick={fetchTrackers}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="results-header">
            <p className="results-count">
              {filteredTrackers.length} {filteredTrackers.length === 1 ? 'tracker' : 'trackers'} found
              {!isAdmin() && <span className="coach-view-badge"> (Your trackers)</span>}
            </p>
          </div>

          {filteredTrackers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No term trackers found</h3>
              <p>
                {searchTerm || filterProgram !== 'All' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first term tracker to get started!'}
              </p>
              {!searchTerm && filterProgram === 'All' && (
                <button 
                  className="btn-create-first"
                  onClick={() => navigate('/term-tracker/create')}
                >
                  ➕ Create First Tracker
                </button>
              )}
            </div>
          ) : (
            <div className="trackers-grid">
              {sortedTrackers.map(tracker => (
                <div key={tracker.id} className="tracker-card">
                  <button 
                    className={`btn-favorite ${isFavorite(tracker.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(tracker.id);
                    }}
                    title={isFavorite(tracker.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorite(tracker.id) ? '⭐' : '☆'}
                  </button>

                  <div className="card-header">
                    <span className={`program-badge program-badge-${getProgramColor(tracker.programType)}`}>
                      {tracker.programType}
                    </span>
                    <span className="creation-date">{formatDate(tracker.createdTime)}</span>
                  </div>
                  
                  <h3 className="tracker-title">
                    {tracker.termName.replace(/(\d{4})$/, '- $1')}
                  </h3>

                  <div className="card-actions">
                    <button
                      onClick={() => navigate(`/attendance/${tracker.id}`, {
                        state: {
                          trackerName: tracker.termName,
                          programType: tracker.programType,
                          spreadsheetId: tracker.id,
                        }
                      })}
                      className="btn-attendance"
                    >
                      ✓ Mark Attendance
                    </button>
                    
                    <a href={tracker.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-open"
                    >
                      📊 Open Spreadsheet
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TermTrackerList;