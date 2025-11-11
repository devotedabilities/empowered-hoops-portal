import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isUserAuthorized } from './utils/adminUtils';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Resources from './pages/Resources';
import TermTracker from './pages/TermTracker';
import TermTrackerList from './pages/TermTrackerList';
import MarkAttendance from './pages/MarkAttendance';
import AdminPanel from './pages/AdminPanel';
import './App.css';
import './Portal.css';

// Protected Route wrapper with Firestore authorization check
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading, true/false = result
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!currentUser) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const authorized = await isUserAuthorized(currentUser.email);
        setIsAuthorized(authorized);
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [currentUser]);

  // Show loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Checking authorization...</p>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="access-denied">
        <h2>❌ Access Denied</h2>
        <p>Your email ({currentUser.email}) is not authorized to access this portal.</p>
        <p>Please contact an administrator to request access.</p>
        <button onClick={() => window.location.href = '/login'}>Back to Login</button>
      </div>
    );
  }

  return children;
}

function AppRoutes() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  // Format user data for existing components
  const userData = {
    email: currentUser.email,
    name: currentUser.displayName,
    picture: currentUser.photoURL,
  };

  return (
    <Layout user={userData} onLogout={logout}>
      <Routes>
        <Route path="/" element={<Dashboard user={userData} />} />
        <Route path="/dashboard" element={<Dashboard user={userData} />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/term-tracker" element={<TermTrackerList />} />
        <Route path="/term-tracker/create" element={<TermTracker user={userData} />} />
        <Route path="/attendance/:trackerId" element={<MarkAttendance />} />
        <Route path="/admin" element={<Dashboard user={userData} />} />
        <Route path="/admin/users" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;