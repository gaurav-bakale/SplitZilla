import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Feather, Layers3, Shield, Users } from 'lucide-react';
import Reveal from '../components/Reveal';

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

  const tenets = [
    { icon: Shield, kicker: 'i.', title: 'A quiet workspace', copy: 'Your ledger, behind a private door.' },
    { icon: Layers3, kicker: 'ii.', title: 'Groups, neatly kept', copy: 'A page per circle — roommates, trips, crews.' },
    { icon: Users, kicker: 'iii.', title: 'Decisions in the open', copy: 'Everyone sees the same plain numbers.' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-8rem] h-[32rem] w-[32rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[-10rem] h-[34rem] w-[34rem] rounded-full bg-terracotta/10 blur-3xl" />
      </div>

      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <Reveal delay={120} className="order-2 lg:order-1">
          <div className="paper-card relative p-8 sm:p-10">
            <div className="paper-tape" />
            <div className="flex items-center gap-2 text-ink-mute">
              <Feather className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.24em]">ink &amp; paper · new chapter</span>
            </div>
            <h2 className="editorial mt-6">Craft your account</h2>
            <p className="mt-3 text-ink-mute">A few small details and your ledger is ready.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl border border-terracotta-200 bg-terracotta-50/80 px-4 py-3 text-sm text-terracotta-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="label-etched">Full name</label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="input-paper"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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
                  autoComplete="new-password"
                  className="input-paper"
                  placeholder="Choose a passphrase"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-ink w-full disabled:opacity-60">
                {loading ? 'Pressing the page…' : 'Begin'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="rule-dashed pt-5 text-center text-sm text-ink-mute">
                Already a subscriber?{' '}
                <Link to="/login" className="link-underline font-medium text-terracotta">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <span className="eyebrow">
            <span className="h-px w-8 bg-ink-mute/60" />
            Chapter 02 · A new ledger
          </span>
          <h1 className="display-xl mt-6 drop-ornament">
            Begin a <em className="italic text-terracotta">gentler</em> way to split.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
            Keep receipts, rent, road-trips and rituals in one calm place. No arithmetic arguments —
            just a quiet page that does the counting for you.
          </p>
          <p className="hand mt-6 text-3xl text-terracotta">— welcome aboard.</p>

          <div className="mt-14 grid max-w-xl gap-4">
            {tenets.map((t, i) => (
              <Reveal key={t.kicker} delay={140 * (i + 1)}>
                <div className={`paper-card flex items-start gap-4 p-5 ${i === 1 ? 'tilt-right' : 'tilt-left'}`}>
                  <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                    <t.icon className="h-4 w-4 text-terracotta" />
                  </div>
                  <div>
                    <p className="eyebrow">{t.kicker}</p>
                    <p className="editorial mt-1 text-xl">{t.title}</p>
                    <p className="mt-1 text-sm text-ink-mute">{t.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default Register;
