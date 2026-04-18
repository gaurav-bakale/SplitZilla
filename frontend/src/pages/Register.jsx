import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Layers3, Shield, Users } from 'lucide-react';

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
      <div className="auth-grid">
        <section className="auth-brand-panel">
          <span className="auth-kicker">Create Account</span>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Set up your profile to start tracking group expenses, balances, and settlements with clarity.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary-600" />
                <p className="text-sm font-medium text-slate-900">Secure sign-in</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Create an account and access your groups from a protected workspace.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <Layers3 className="h-5 w-5 text-primary-600" />
                <p className="text-sm font-medium text-slate-900">Group-ready setup</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Start with a clean account and organize shared spending by group.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-600" />
                <p className="text-sm font-medium text-slate-900">Built for shared decisions</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Invite members, track activity, and keep expenses transparent.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="relative z-10">
            <span className="auth-kicker">Registration</span>
            <h2 className="auth-form-title mt-5">Create your profile</h2>
            <p className="auth-form-copy">
              Enter your details to get started with shared expense tracking.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div>
                <label htmlFor="name" className="auth-label">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
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
                  autoComplete="new-password"
                  required
                  className="auth-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-button"
              >
                {loading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <div className="pt-2 text-center text-sm text-slate-600">
                Already inside the network?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
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
