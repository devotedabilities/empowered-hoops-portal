import { GoogleLogin } from '@react-oauth/google';
import logo from '../assets/empoweredhoops-logo.png';

function Login({ onLoginSuccess }) {
  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Empowered Hoops" className="login-logo" />
        <h1>Coach Portal</h1>
        <p className="login-subtitle">Sign in with your authorized Google account</p>
        
        <div className="login-button-container">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={() => {
              console.log('Login Failed');
              alert('Login failed. Please try again.');
            }}
            useOneTap
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        <div className="login-footer">
          <p>Access restricted to authorized coaches only</p>
          <p className="login-contact">
            Need access? Contact{' '}
            <a href="mailto:info@devotedabilities.com">info@devotedabilities.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
