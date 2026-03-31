import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Layers3, Radar, Users } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-gridline" />
      <div className="auth-orbit left-8 top-10 h-56 w-56 bg-sky-500/20" />
      <div className="auth-orbit bottom-0 right-10 h-72 w-72 bg-fuchsia-500/20" />
      <div className="auth-orbit left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 bg-cyan-400/15" />

      <div className="auth-grid">
        <section className="auth-brand-panel">
          <span className="auth-kicker">New Operator</span>
          <h1 className="auth-title">Create Your Expense Identity</h1>
          <p className="auth-subtitle">
            Join a collaborative finance layer designed for trips, roommates, and fast-moving shared plans.
            Build your account once and manage every split from a single, futuristic hub.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/30 p-5">
              <div className="flex items-center gap-3">
                <Radar className="h-5 w-5 text-cyan-300" />
                <p className="text-sm font-medium text-slate-100">Realtime balance awareness</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Keep every group aligned with instant balance snapshots and settlement suggestions.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/30 p-5">
              <div className="flex items-center gap-3">
                <Layers3 className="h-5 w-5 text-sky-300" />
                <p className="text-sm font-medium text-slate-100">Multi-mode split engine</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Start simple now and scale into equal, percentage, or exact group flows.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/30 p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-fuchsia-300" />
                <p className="text-sm font-medium text-slate-100">Built for shared decisions</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Invite people fast, track activity clearly, and keep group spending transparent.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="relative z-10">
            <span className="auth-kicker">Create Account</span>
            <h2 className="auth-form-title mt-5">Initialize Split Access</h2>
            <p className="auth-form-copy">
              Set up your profile to start building groups, tracking expenses, and settling smarter.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div>
                <label htmlFor="name" className="auth-label">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="auth-input"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="auth-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="auth-input"
                  placeholder="you@futurepay.space"
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
                  placeholder="Create a strong passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading ? 'Creating Account...' : 'Activate Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <div className="pt-2 text-center text-sm text-slate-400">
                Already inside the network?{' '}
                <Link to="/login" className="auth-link">
                  Return to sign in
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
