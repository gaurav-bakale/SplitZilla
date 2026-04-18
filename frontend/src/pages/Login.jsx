import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Shield, WalletCards, Users } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <section className="auth-brand-panel">
          <span className="auth-kicker">Sign In</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Manage group spending, balances, and settlements from one clear workspace built for shared finance.
          </p>

          <div className="auth-stat-grid">
            <div className="auth-stat">
              <p className="auth-stat-label">Groups</p>
              <p className="auth-stat-value">Shared</p>
            </div>
            <div className="auth-stat">
              <p className="auth-stat-label">Balances</p>
              <p className="auth-stat-value">Clear</p>
            </div>
            <div className="auth-stat">
              <p className="auth-stat-label">Status</p>
              <p className="auth-stat-value">Live</p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Shield className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-sm font-medium text-slate-900">Secure access</p>
              <p className="mt-2 text-sm text-slate-600">Private access to your account and groups.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <WalletCards className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-sm font-medium text-slate-900">Shared visibility</p>
              <p className="mt-2 text-sm text-slate-600">Keep expenses, balances, and settlements organized.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <Users className="h-5 w-5 text-primary-600" />
              <p className="mt-3 text-sm font-medium text-slate-900">Built for groups</p>
              <p className="mt-2 text-sm text-slate-600">Manage roommates, trips, and events in one place.</p>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="relative z-10">
            <span className="auth-kicker">Account Access</span>
            <h2 className="auth-form-title mt-5">Sign in to continue</h2>
            <p className="auth-form-copy">
              Enter your account details to access your groups and activity.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div>
                <label htmlFor="email" className="auth-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="auth-label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <div className="pt-2 text-center text-sm text-slate-600">
                New to the platform?{' '}
                <Link to="/register" className="auth-link">
                  Create an account
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
