import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/empoweredhoops-logo.png';

function Layout({ user, onLogout, children }) {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="portal-layout">
      <nav className="portal-nav">
        <div className="nav-header">
          <img src={logo} alt="Empowered Hoops" className="nav-logo" />
          <h2>Coach Portal</h2>
        </div>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>
          <Link to="/term-tracker" className={`nav-link ${isActive('/term-tracker')}`}>
            <span className="nav-icon">📊</span>
            Term Trackers
          </Link>
          <Link to="/resources" className={`nav-link ${isActive('/resources')}`}>
            <span className="nav-icon">📚</span>
            Resources
          </Link>
          
          {/* Admin-only link */}
          {isAdmin() && (
            <>
              <div className="nav-divider"></div>
              <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>
                <span className="nav-icon">👥</span>
                Admin Panel
              </Link>
            </>
          )}
        </div>

        <div className="nav-footer">
          <div className="user-info">
            {user.picture && <img src={user.picture} alt={user.name} className="user-avatar" />}
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
              {isAdmin() && <span className="user-role-badge">Admin</span>}
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <main className="portal-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;