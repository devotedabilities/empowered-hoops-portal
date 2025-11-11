import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/empoweredhoops-horizontal.svg';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Signed in:', result.user);
      
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="login-page">
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
  <div className="logo-wrapper" style={{ '--logo-url': `url(${logo})` }}></div>
  
</div>

        <div className="login-content">
            <h1 className="tagline">Coach Portal</h1>
          <p className="welcome-text">Welcome Back!</p>
          <p className="subtitle">Sign in to manage your term trackers</p>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button
            className="btn-google-signin"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Signing in...
              </>
            ) : (
              <>
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="google-icon"
                />
                Sign in with Google
              </>
            )}
          </button>

          <p className="privacy-note">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  </div>
);
}

export default Login;