import { Link } from 'react-router-dom';

function Dashboard({ user }) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
        <p>Empowered Hoops Coach Portal</p>
      </div>

      <div className="dashboard-cards">
        <Link to="/term-tracker/create" className="dashboard-card">
          <div className="card-icon">🏀</div>
          <h3>Create Term Tracker</h3>
          <p>Set up attendance and payment tracking for a new term</p>
          <span className="card-arrow">→</span>
        </Link>

     <Link to="/term-tracker" className="dashboard-card">
  <div className="card-icon">📊</div>
  <h3>Manage Term Trackers</h3>
  <p>View and manage your attendance and payment trackers</p>
  <span className="card-arrow">→</span>
</Link>
        <Link to="/resources" className="dashboard-card">
          <div className="card-icon">📚</div>
          <h3>Resources</h3>
          <p>Access training materials, manuals, and documentation</p>
          <span className="card-arrow">→</span>
        </Link>

        <div className="dashboard-card coming-soon">
          <div className="card-icon">📈</div>
          <h3>Reports</h3>
          <p>View attendance reports and analytics</p>
          <span className="coming-soon-badge">Coming Soon</span>
        </div>

        <div className="dashboard-card coming-soon">
          <div className="card-icon">🏆</div>
          <h3>XP Dashboard</h3>
          <p>Track athlete progression and achievements</p>
          <span className="coming-soon-badge">Coming Soon</span>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>📌 Quick Links</h3>
          <ul>
            <li><a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">Google Drive</a></li>
            <li><a href="https://www.empoweredhoops.com.au" target="_blank" rel="noopener noreferrer">Main Website</a></li>
            <li><a href="mailto:info@devotedabilities.com">Contact Support</a></li>
          </ul>
        </div>

        <div className="info-card">
          <h3>💡 Need Help?</h3>
          <p>If you have questions or need assistance, contact:</p>
          <p><strong>info@devotedabilities.com</strong></p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
