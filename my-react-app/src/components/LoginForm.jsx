import { useState } from 'react';
import { Mail, Lock, User, LogIn, LogOut, UserPlus } from 'lucide-react';

export default function LoginForm({ 
  user, 
  onLogin, 
  onLogout, 
  favouritesCount = 0, 
  watchLaterCount = 0 
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isSignUp && !username)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Simulate login / signup
    const userPayload = {
      username: isSignUp ? username : email.split('@')[0],
      email: email
    };

    onLogin(userPayload);
  };

  // If user is already logged in, show their details
  if (user) {
    return (
      <div className="login-page animate-fade">
        <div className="user-card glass">
          <div className="user-avatar-large">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="user-name-large">Welcome back, {user.username}!</h2>
          <p className="user-email">{user.email}</p>

          <div className="user-stats">
            <div className="user-stat-item">
              <span className="user-stat-val">{favouritesCount}</span>
              <span className="user-stat-label">Favourites</span>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }} />
            <div className="user-stat-item">
              <span className="user-stat-val">{watchLaterCount}</span>
              <span className="user-stat-label">Watch Later</span>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={onLogout} style={{ width: '100%' }}>
            <LogOut size={16} />
            Log Out from FlixTrailer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page animate-fade">
      <div className="login-card glass">
        {/* Sign In / Sign Up Selector Tabs */}
        <div className="login-tabs">
          <button 
            type="button"
            className={`login-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(false); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`login-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => { setIsSignUp(true); setError(''); }}
          >
            Register
          </button>
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {isSignUp ? 'Sign up to sync your favourite trailers across devices.' : 'Login to manage your watch later list and favourites.'}
        </p>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.75rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username (only for Register) */}
          {isSignUp && (
            <div className="login-form-group">
              <label className="login-input-label">Username</label>
              <div className="login-input-wrapper">
                <User className="login-input-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter your username"
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="login-form-group">
            <label className="login-input-label">Email Address</label>
            <div className="login-input-wrapper">
              <Mail className="login-input-icon" size={18} />
              <input 
                type="email" 
                placeholder="name@example.com"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-form-group">
            <label className="login-input-label">Password</label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary login-submit-btn">
            {isSignUp ? (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
