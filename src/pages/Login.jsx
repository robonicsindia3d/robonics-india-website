import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css'; // Shared auth styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
    setIsLoading(false);
  };

  return (
    <div className="page-transition animate-fade-in auth-page">
      <div className="auth-split-container">
        <div className="auth-image-side" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=1200&auto=format&fit=crop")' }}>
          <div className="auth-image-overlay">
            <h2>Welcome Back</h2>
            <p>Access your orders and premium wishlist.</p>
          </div>
        </div>
        
        <div className="auth-form-side">
          <div className="auth-card">
            <h1>Log In</h1>
            <p className="auth-subtitle">Enter your credentials to continue</p>
            
            {error && <div className="auth-error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Enter your password"
                />
              </div>
              
              <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            
            <div className="auth-footer">
              Don't have an account? <Link to="/register">Sign Up here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
