import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Scissors } from 'lucide-react';
import Reveal from '../components/Reveal';

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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-[34rem] w-[34rem] rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-sage/15 blur-3xl" />
      </div>

      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <Reveal className="relative">
          <span className="eyebrow">
            <span className="h-px w-8 bg-ink-mute/60" />
            Chapter 01 · Welcome back
          </span>
          <h1 className="display-xl mt-6 drop-ornament">
            Shared spend, <em className="italic text-terracotta">beautifully</em> settled.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
            A calmer way to keep ledgers between friends. Roommate rent, road-trip receipts,
            wedding co-pays — SplitZilla folds them all into one quiet, thoughtful page.
          </p>
          <p className="hand mt-6 text-3xl text-terracotta">— glad you&rsquo;re back.</p>

          <div className="mt-14 grid max-w-xl gap-4 sm:grid-cols-3">
            {[
              { kicker: 'vol.i', title: 'Groups', copy: 'Roommates, trips, crews.' },
              { kicker: 'vol.ii', title: 'Balances', copy: 'Who owes whom, plainly.' },
              { kicker: 'vol.iii', title: 'Settle', copy: 'Fewest possible transfers.' },
            ].map((item, i) => (
              <Reveal key={item.kicker} delay={120 * (i + 1)}>
                <div className={`paper-card p-5 ${i % 2 ? 'tilt-right' : 'tilt-left'}`}>
                  <p className="eyebrow">{item.kicker}</p>
                  <p className="editorial mt-3 text-2xl">{item.title}</p>
                  <p className="mt-2 text-sm text-ink-mute">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160} className="relative">
          <div className="paper-card relative p-8 sm:p-10">
            <div className="paper-tape" />
            <div className="flex items-center gap-2 text-ink-mute">
              <Scissors className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.24em]">cut along the dotted line</span>
            </div>
            <h2 className="editorial mt-6">Sign in</h2>
            <p className="mt-3 text-ink-mute">Open the ledger to your groups and recent activity.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl border border-terracotta-200 bg-terracotta-50/80 px-4 py-3 text-sm text-terracotta-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label-etched">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-paper"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="label-etched">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="input-paper"
                  placeholder="Your passphrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-ink w-full disabled:opacity-60">
                {loading ? 'Turning the page…' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="rule-dashed pt-5 text-center text-sm text-ink-mute">
                New here?{' '}
                <Link to="/register" className="link-underline font-medium text-terracotta">
                  Craft your account
                </Link>
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default Login;
