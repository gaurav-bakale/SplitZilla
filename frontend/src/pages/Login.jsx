import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Shield, Sparkles, WalletCards } from 'lucide-react';

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
      <div className="auth-gridline" />
      <div className="auth-orbit -left-16 top-20 h-48 w-48 bg-cyan-400/20" />
      <div className="auth-orbit right-0 top-1/3 h-64 w-64 bg-fuchsia-500/20" />
      <div className="auth-orbit bottom-0 left-1/3 h-56 w-56 bg-sky-500/20" />

      <div className="auth-grid">
        <section className="auth-brand-panel">
          <span className="auth-kicker">Expense Command Center</span>
          <h1 className="auth-title">Welcome Back To SplitZilla</h1>
          <p className="auth-subtitle">
            Step into a sharper way to manage shared money. Track group spending, surface balances instantly,
            and move from chaos to clarity with a dashboard that feels built for the next decade.
          </p>

          <div className="auth-stat-grid">
            <div className="auth-stat">
              <p className="auth-stat-label">Signal</p>
              <p className="auth-stat-value">24/7</p>
            </div>
            <div className="auth-stat">
              <p className="auth-stat-label">Sync</p>
              <p className="auth-stat-value">Live</p>
            </div>
            <div className="auth-stat">
              <p className="auth-stat-label">Split Modes</p>
              <p className="auth-stat-value">3X</p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/30 p-4">
              <Shield className="h-5 w-5 text-cyan-300" />
              <p className="mt-3 text-sm font-medium text-slate-100">Secure access</p>
              <p className="mt-2 text-sm text-slate-400">JWT-protected entry for private groups and balances.</p>
            </div>
            <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/30 p-4">
              <WalletCards className="h-5 w-5 text-sky-300" />
              <p className="mt-3 text-sm font-medium text-slate-100">Smart settlement</p>
              <p className="mt-2 text-sm text-slate-400">See who owes whom instead of guessing after every trip.</p>
            </div>
            <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/30 p-4">
              <Sparkles className="h-5 w-5 text-fuchsia-300" />
              <p className="mt-3 text-sm font-medium text-slate-100">Clean visibility</p>
              <p className="mt-2 text-sm text-slate-400">Balances, history, and notifications in one flow.</p>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="relative z-10">
            <span className="auth-kicker">Sign In</span>
            <h2 className="auth-form-title mt-5">Launch Your Workspace</h2>
            <p className="auth-form-copy">
              Access your groups, settlements, and expense timeline from one secure cockpit.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div>
                <label htmlFor="email" className="auth-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="auth-input"
                  placeholder="captain@splitzilla.ai"
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
                  required
                  className="auth-input"
                  placeholder="Enter your secure passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading ? 'Signing In...' : 'Enter SplitZilla'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <div className="pt-2 text-center text-sm text-slate-400">
                New to the platform?{' '}
                <Link to="/register" className="auth-link">
                  Create your access key
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
