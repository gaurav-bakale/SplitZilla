import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Reveal from '../components/Reveal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, Loader } from 'lucide-react';

const fieldCls = "block w-full rounded-xl border border-ink/15 bg-paper-50/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-terracotta focus:ring-4 focus:ring-terracotta/15";
const labelCls = "label-etched";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', created_at: null });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');

  useEffect(() => {
    api.get('/api/users/profile')
      .then(r => setProfile({ name: r.data.name || '', email: r.data.email || '', created_at: r.data.created_at }))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const r = await api.put('/api/users/profile', { name: profile.name, email: profile.email });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: r.data.name, email: r.data.email }));
      setProfileMsg('saved');
    } catch (err) {
      setProfileMsg(err.response?.data?.error || 'Failed to save');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm) {
      setPwdMsg('New passwords do not match');
      return;
    }
    setPwdSaving(true);
    setPwdMsg('');
    try {
      await api.put('/api/users/profile/password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswords({ current_password: '', new_password: '', confirm: '' });
      setPwdMsg('saved');
    } catch (err) {
      setPwdMsg(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-[-8rem] h-[32rem] w-[32rem] rounded-full bg-sage/12 blur-3xl" />
        <div className="absolute top-[30%] right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-terracotta/10 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-3 text-ink-mute">
            <span className="h-px w-10 bg-ink-mute/50" />
            <span className="eyebrow">Settings · your page</span>
          </div>
          <h1 className="display mt-4 drop-ornament">
            <em className="italic text-terracotta">Profile.</em>
          </h1>
          <p className="hand mt-3 text-3xl text-ink-soft">— who you are, on record.</p>
        </Reveal>

        <Reveal delay={80}>
          <section className="paper-card mt-10 p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                <User className="h-5 w-5 text-terracotta" />
              </span>
              <div>
                <p className="eyebrow">Section 01</p>
                <h2 className="editorial mt-1 text-2xl">Your details</h2>
                <p className="mt-1 text-sm text-ink-mute">Update your display name and email address.</p>
              </div>
            </div>
            <div className="rule-dashed mt-6" />

            {profileLoading ? (
              <p className="mt-6 text-sm text-ink-mute">Loading…</p>
            ) : (
              <form onSubmit={handleProfileSave} className="mt-6 space-y-5">
                <div>
                  <label className={labelCls}>Display name</label>
                  <input
                    type="text"
                    required
                    className={fieldCls}
                    value={profile.name}
                    onChange={(e) => { const v = e.target.value; setProfile(p => ({ ...p, name: v })); }}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    required
                    className={fieldCls}
                    value={profile.email}
                    onChange={(e) => { const v = e.target.value; setProfile(p => ({ ...p, email: v })); }}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button type="submit" disabled={profileSaving} className="btn-terracotta disabled:cursor-not-allowed disabled:opacity-50">
                    {profileSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {profileSaving ? 'Saving…' : 'Save changes'}
                  </button>
                  {profileMsg && (
                    <span className={`text-sm ${profileMsg === 'saved' ? 'text-sage-500' : 'text-terracotta-600'}`}>
                      {profileMsg === 'saved' ? 'Changes saved.' : profileMsg}
                    </span>
                  )}
                </div>
              </form>
            )}
          </section>
        </Reveal>

        <Reveal delay={140}>
          <section className="paper-card mt-6 p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                <Lock className="h-5 w-5 text-terracotta" />
              </span>
              <div>
                <p className="eyebrow">Section 02</p>
                <h2 className="editorial mt-1 text-2xl">Password</h2>
                <p className="mt-1 text-sm text-ink-mute">Change your account password.</p>
              </div>
            </div>
            <div className="rule-dashed mt-6" />

            <form onSubmit={handlePasswordSave} className="mt-6 space-y-5">
              <div>
                <label className={labelCls}>Current password</label>
                <input
                  type="password"
                  required
                  className={fieldCls}
                  value={passwords.current_password}
                  onChange={(e) => { const v = e.target.value; setPasswords(p => ({ ...p, current_password: v })); }}
                />
              </div>
              <div>
                <label className={labelCls}>New password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className={fieldCls}
                  value={passwords.new_password}
                  onChange={(e) => { const v = e.target.value; setPasswords(p => ({ ...p, new_password: v })); }}
                />
              </div>
              <div>
                <label className={labelCls}>Confirm new password</label>
                <input
                  type="password"
                  required
                  className={fieldCls}
                  value={passwords.confirm}
                  onChange={(e) => { const v = e.target.value; setPasswords(p => ({ ...p, confirm: v })); }}
                />
              </div>
              <div className="flex items-center gap-4">
                <button type="submit" disabled={pwdSaving} className="btn-ink disabled:cursor-not-allowed disabled:opacity-50">
                  {pwdSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {pwdSaving ? 'Updating…' : 'Update password'}
                </button>
                {pwdMsg && (
                  <span className={`text-sm ${pwdMsg === 'saved' ? 'text-sage-500' : 'text-terracotta-600'}`}>
                    {pwdMsg === 'saved' ? 'Password updated.' : pwdMsg}
                  </span>
                )}
              </div>
            </form>
          </section>
        </Reveal>

        {profile.created_at && (
          <Reveal delay={180}>
            <section className="paper-card mt-6 p-8">
              <p className="eyebrow">Account</p>
              <h2 className="editorial mt-1 text-2xl">Member since</h2>
              <p className="mt-4 font-serif text-2xl text-ink-soft">
                {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>
          </Reveal>
        )}
      </main>
    </div>
  );
}
