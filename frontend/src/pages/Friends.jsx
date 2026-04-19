import React, { useEffect, useState } from 'react';
import { Check, Clock, Heart, Mail, Plus, Trash2, UserPlus, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Reveal from '../components/Reveal';
import api from '../api/axios';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [friendsRes, reqRes] = await Promise.all([
        api.get('/api/users/friends'),
        api.get('/api/users/friend-requests'),
      ]);
      setFriends(friendsRes.data);
      setIncoming(reqRes.data.incoming || []);
      setOutgoing(reqRes.data.outgoing || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Unable to load friends.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddError('');
    setAddSuccess('');
    try {
      await api.post('/api/users/friends', { email });
      setEmail('');
      setAddSuccess('Request sent — waiting for them to accept.');
      await fetchAll();
    } catch (e) {
      setAddError(e.response?.data?.error || 'Failed to send request.');
    } finally {
      setAdding(false);
    }
  };

  const handleAccept = async (requestId) => {
    setBusyId(requestId);
    try {
      await api.post(`/api/users/friend-requests/${requestId}/accept`);
      await fetchAll();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to accept.');
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (requestId) => {
    setBusyId(requestId);
    try {
      await api.post(`/api/users/friend-requests/${requestId}/reject`);
      setIncoming((xs) => xs.filter((r) => r.request_id !== requestId));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to reject.');
    } finally {
      setBusyId('');
    }
  };

  const handleCancel = async (requestId) => {
    setBusyId(requestId);
    try {
      await api.delete(`/api/users/friend-requests/${requestId}`);
      setOutgoing((xs) => xs.filter((r) => r.request_id !== requestId));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to cancel.');
    } finally {
      setBusyId('');
    }
  };

  const handleRemove = async (userId) => {
    setBusyId(userId);
    try {
      await api.delete(`/api/users/friends/${userId}`);
      setFriends((f) => f.filter((x) => x.user_id !== userId));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to remove friend.');
    } finally {
      setBusyId('');
    }
  };

  const fieldClass = "block w-full rounded-xl border border-ink/15 bg-paper-50/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-terracotta focus:ring-4 focus:ring-terracotta/15";

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-[-8rem] h-[30rem] w-[30rem] rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-sage/12 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-3 text-ink-mute">
            <span className="h-px w-10 bg-ink-mute/50" />
            <span className="eyebrow">Volume · friends</span>
          </div>
          <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="display drop-ornament">
                Your <em className="italic text-terracotta">people</em>.
              </h1>
              <p className="hand mt-3 text-3xl text-ink-soft">— a small, kind circle.</p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                Send a request by email. The other person gets a notice on their dashboard and can accept — once they do, you can invite each other to groups with a tap.
              </p>
            </div>

            <div className="paper-card relative p-8">
              <div className="paper-tape" />
              <div className="flex items-center gap-2 text-ink-mute">
                <UserPlus className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.24em]">send a request</span>
              </div>
              <h2 className="editorial mt-4 text-2xl">Invite a friend.</h2>
              <p className="mt-2 text-sm text-ink-mute">
                They need an account already. We&rsquo;ll send them a request to accept.
              </p>
              <form onSubmit={handleSend} className="mt-6 space-y-4">
                {addError && (
                  <div className="rounded-xl border border-terracotta-200 bg-terracotta-50/80 px-4 py-3 text-sm text-terracotta-600">
                    {addError}
                  </div>
                )}
                {addSuccess && (
                  <div className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-ink-soft">
                    {addSuccess}
                  </div>
                )}
                <div>
                  <label className="label-etched">Email</label>
                  <input
                    type="email"
                    required
                    className={fieldClass}
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={adding} className="btn-terracotta w-full disabled:opacity-60">
                  {adding ? 'Sending…' : 'Send request'}
                  <Plus className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </Reveal>

        {incoming.length > 0 && (
          <Reveal delay={100}>
            <section className="paper-card mt-12 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Inbox</p>
                  <h2 className="editorial mt-2">Requests waiting.</h2>
                  <p className="mt-2 text-sm text-ink-mute">People who'd like to be on your page.</p>
                </div>
                <span className="paper-stamp">{incoming.length} pending</span>
              </div>
              <ul className="mt-6 space-y-3">
                {incoming.map((r) => (
                  <li key={r.request_id} className="flex items-center justify-between gap-4 rounded-2xl border border-terracotta/20 bg-terracotta-50/40 p-4">
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-ink/10 bg-paper-50 font-serif italic text-terracotta">
                        {(r.from_name || '?').slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-lg text-ink">{r.from_name}</p>
                        <p className="flex items-center gap-1.5 truncate text-xs text-ink-mute">
                          <Mail className="h-3 w-3" />
                          {r.from_email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === r.request_id}
                        onClick={() => handleAccept(r.request_id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs text-paper-50 transition hover:opacity-90 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.request_id}
                        onClick={() => handleReject(r.request_id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs text-ink-soft transition hover:border-terracotta hover:text-terracotta disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        {outgoing.length > 0 && (
          <Reveal delay={140}>
            <section className="paper-card mt-8 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Sent</p>
                  <h2 className="editorial mt-2">Out for reply.</h2>
                  <p className="mt-2 text-sm text-ink-mute">You can cancel any request still pending.</p>
                </div>
                <span className="paper-stamp">{outgoing.length} awaiting</span>
              </div>
              <ul className="mt-6 space-y-3">
                {outgoing.map((r) => (
                  <li key={r.request_id} className="flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-paper-50/60 p-4">
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-ink/10 bg-paper-50 font-serif italic text-ink-soft">
                        {(r.to_name || '?').slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-lg text-ink">{r.to_name}</p>
                        <p className="flex items-center gap-1.5 truncate text-xs text-ink-mute">
                          <Mail className="h-3 w-3" />
                          {r.to_email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-none items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-ink-mute">
                        <Clock className="h-3 w-3" />
                        pending
                      </span>
                      <button
                        type="button"
                        disabled={busyId === r.request_id}
                        onClick={() => handleCancel(r.request_id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs text-ink-soft transition hover:border-terracotta hover:text-terracotta disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}

        <Reveal delay={180}>
          <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Index</p>
              <h2 className="editorial mt-2">Your circle.</h2>
              <p className="mt-2 text-sm text-ink-mute">
                {friends.length
                  ? `${friends.length} ${friends.length === 1 ? 'friend' : 'friends'} on your page.`
                  : 'No one on your page yet — send a request above.'}
              </p>
            </div>
            <div className="paper-stamp">
              <Heart className="h-3 w-3 text-terracotta" />
              <span>keep it small</span>
            </div>
          </div>
          <div className="rule-dashed mt-5" />
        </Reveal>

        {error ? (
          <div className="paper-card mt-8 border-terracotta/30 p-8 text-terracotta-600">{error}</div>
        ) : loading ? (
          <div className="paper-card mt-8 p-10 text-ink-mute">Turning the page…</div>
        ) : friends.length === 0 ? (
          <Reveal delay={220}>
            <div className="paper-card mt-8 p-12 text-center">
              <Heart className="mx-auto h-6 w-6 text-ink-mute" />
              <p className="hand mt-3 text-3xl text-terracotta">an empty rolodex</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-mute">
                Send a friend request by email to start splitting faster.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {friends.map((f, i) => (
              <Reveal key={f.user_id} delay={60 * i}>
                <div className={`paper-card tilt-hover p-6 ${i % 2 ? 'tilt-right' : 'tilt-left'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-ink/10 bg-paper-50 font-serif text-lg italic text-terracotta">
                        {(f.name || '?').slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="eyebrow">Friend</p>
                        <p className="font-serif mt-1 truncate text-2xl text-ink">{f.name}</p>
                        <p className="mt-1 flex items-center gap-2 truncate text-sm text-ink-mute">
                          <Mail className="h-3.5 w-3.5 flex-none" />
                          <span className="truncate">{f.email}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={busyId === f.user_id}
                      onClick={() => handleRemove(f.user_id)}
                      className="flex-none rounded-full border border-ink/15 p-2 text-ink-mute transition hover:border-terracotta hover:text-terracotta disabled:opacity-50"
                      title="Remove friend"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="rule-dashed mt-5" />
                  <p className="mt-4 text-xs text-ink-mute">
                    Invite them to a group using this email — one tap inside any group page.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Friends;
