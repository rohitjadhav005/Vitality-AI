import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, Activity, Brain, Moon } from 'lucide-react';
import { apiUrl } from '../config/api';

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="login-stat-badge">
    <div className="login-stat-icon" style={{ background: color }}>
      <Icon size={16} />
    </div>
    <div>
      <div className="login-stat-value">{value}</div>
      <div className="login-stat-label">{label}</div>
    </div>
  </div>
);

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const url = isRegister ? apiUrl('/register') : apiUrl('/login');
      let body, headers = {};

      if (isRegister) {
        body = JSON.stringify(formData);
        headers = { 'Content-Type': 'application/json' };
      } else {
        const p = new URLSearchParams();
        p.append('username', formData.username);
        p.append('password', formData.password);
        body = p;
        headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      }

      const res = await fetch(url, { method: 'POST', headers, body });
      const data = await res.json();

      if (res.ok) {
        if (isRegister) {
          toast.success('Account created! Please log in.');
          setIsRegister(false);
          setFormData({ username: formData.username, password: '' });
        } else {
          login(data.access_token);
          toast.success(`Welcome back, ${formData.username}!`);
          navigate('/');
        }
      } else {
        toast.error(data.detail || 'Authentication failed');
      }
    } catch {
      toast.error('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Left Panel ── */}
      <div className="login-left-panel">
        <div className="login-brand">
          <img
            src="/logo.png"
            alt="Vitality AI"
            style={{ height: '5rem', width: 'auto', objectFit: 'contain', borderRadius: '12px' }}
          />
        </div>

        <div className="login-hero-text">
          <h1>Unlock Your<br /><span className="login-gradient-text">Peak Performance</span></h1>
          <p>AI-powered health analytics that predicts your energy and productivity — so you can always be at your best.</p>
        </div>

        <div className="login-stats-row">
          <StatBadge icon={Zap}      value="92%" label="Energy Accuracy"  color="rgba(239, 68, 68, 0.25)"  />
          <StatBadge icon={Activity} value="10k+" label="Predictions Made" color="rgba(239, 68, 68, 0.15)" />
          <StatBadge icon={Brain}    value="AI" label="Powered Insights"  color="rgba(239, 68, 68, 0.2)" />
          <StatBadge icon={Moon}     value="7h"  label="Optimal Sleep"    color="rgba(255, 255, 255, 0.1)"  />
        </div>

        <div className="login-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right-panel">
        <div className="login-form-card">
          <div className="login-form-header">
            <h2>{isRegister ? 'Join Vitality AI ✨' : 'Welcome Back! 👋'}</h2>
            <p>{isRegister ? 'Create an account to start tracking your peak performance.' : "We're glad to see you again. Sign in to continue."}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading
                ? <span className="login-spinner" />
                : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>

          <p className="login-toggle">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => { setIsRegister(v => !v); setFormData({ username: '', password: '' }); }}>
              {isRegister ? ' Log In' : ' Sign Up'}
            </button>
          </p>

          <p className="login-footer-note">
            🔒 Your data is encrypted and private. Only you can see your health insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
