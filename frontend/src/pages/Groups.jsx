import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers3, Plus, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Reveal from '../components/Reveal';
import api from '../api/axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [groupStats, setGroupStats] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', group_type: 'general' });
  const [loading, setLoading] = useState(false);

  const groupTypeDescriptions = {
    general: 'Flexible shared spending for any situation.',
    travel: 'Trips, flights, stays, and shared travel costs.',
    roommate: 'Recurring home costs and apartment life.',
    event: 'One-off plans, parties, and coordinated budgets.',
  };

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    setPageLoading(true);
    setPageError('');
    try {
      const response = await api.get('/api/groups/');
      setGroups(response.data);
      const stats = {};
      const perGroup = await Promise.allSettled(
        response.data.map((g) => api.get(`/api/expenses/group/${g.group_id}`))
      );
      perGroup.forEach((r, i) => {
        const g = response.data[i];
        if (r.status === 'fulfilled') {
          const exps = r.value.data;
          const total = exps.reduce((a, e) => a + Number(e.amount || 0), 0);
          const latest = exps.length
            ? exps.reduce((a, e) => (new Date(e.date) > new Date(a.date) ? e : a))
            : null;
          stats[g.group_id] = { total, count: exps.length, latest };
        } else {
          stats[g.group_id] = { total: 0, count: 0, latest: null };
        }
      });
      setGroupStats(stats);
    } catch (error) {
      setPageError('Unable to load groups right now.');
    } finally {
      setPageLoading(false);
    }
  };

  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/groups/', formData);
      setShowModal(false);
      setFormData({ name: '', description: '', group_type: 'general' });
      await fetchGroups();
    } catch (error) {
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "block w-full rounded-xl border border-ink/15 bg-paper-50/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-terracotta focus:ring-4 focus:ring-terracotta/15";

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-[-6rem] h-[30rem] w-[30rem] rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-sage/12 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-3 text-ink-mute">
            <span className="h-px w-10 bg-ink-mute/50" />
            <span className="eyebrow">Volume · groups</span>
          </div>
          <div className="mt-4 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="display drop-ornament">
                Shared <em className="italic text-terracotta">groups</em>.
              </h1>
              <p className="hand mt-3 text-3xl text-ink-soft">— kept in one quiet place.</p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                A page for every circle of friends, roommates, or travel crew. Create one, invite people, and let the ledger do the counting.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="paper-card p-5">
                  <p className="eyebrow">Total</p>
                  <p className="editorial mt-2 tabular-nums">{groups.length}</p>
                </div>
                <div className="paper-card p-5 tilt-right">
                  <p className="eyebrow">Types</p>
                  <p className="editorial mt-2 tabular-nums">4</p>
                </div>
                <div className="paper-card p-5">
                  <p className="eyebrow">Status</p>
                  <p className="font-serif mt-2 text-2xl text-sage-500">Active</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 self-end">
              <div className="paper-card p-5">
                <p className="eyebrow">Use cases</p>
                <p className="mt-2 font-serif text-xl text-ink">Travel, roommates, events</p>
              </div>
              <div className="paper-card-ink p-5">
                <p className="eyebrow text-paper-200">Workflow</p>
                <p className="mt-2 font-serif text-xl text-paper-50">Invite, track, settle.</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Index</p>
              <h2 className="editorial mt-2">Your groups.</h2>
              <p className="mt-2 text-sm text-ink-mute">Open a page or start a new one.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn-terracotta"
            >
              <Plus className="h-4 w-4" />
              New group
            </button>
          </div>
          <div className="rule-dashed mt-5" />
        </Reveal>

        {pageError ? (
          <div className="paper-card mt-8 border-terracotta/30 p-8 text-terracotta-600">{pageError}</div>
        ) : pageLoading ? (
          <div className="paper-card mt-8 p-10 text-ink-mute">Turning the page…</div>
        ) : groups.length === 0 ? (
          <Reveal delay={160}>
            <div className="paper-card mt-8 p-12 text-center">
              <Layers3 className="mx-auto h-6 w-6 text-ink-mute" />
              <p className="hand mt-3 text-3xl text-terracotta">a blank page</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-mute">
                Create a group to track shared bills, trips, and events.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn-terracotta mt-6"
              >
                <Plus className="h-4 w-4" />
                Create group
              </button>
            </div>
          </Reveal>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group, i) => (
              <Reveal key={group.group_id} delay={80 * i}>
                <Link
                  to={`/groups/${group.group_id}`}
                  className={`paper-card tilt-hover group block p-6 ${i % 2 ? 'tilt-right' : 'tilt-left'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">Group</p>
                      <h3 className="font-serif mt-2 text-2xl text-ink">{group.name}</h3>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper-50 text-terracotta">
                      <Users className="h-4 w-4" />
                    </span>
                  </div>

                  <p className="mt-4 min-h-[3rem] text-sm leading-6 text-ink-soft">
                    {group.description || 'Shared expenses and balances for this group.'}
                  </p>

                  <div className="rule-dashed mt-5" />

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <p className="eyebrow">Members</p>
                      <p className="mt-1 font-serif text-lg tabular-nums">{group.members?.length || 0}</p>
                    </div>
                    <div>
                      <p className="eyebrow">Entries</p>
                      <p className="mt-1 font-serif text-lg tabular-nums">{groupStats[group.group_id]?.count ?? '—'}</p>
                    </div>
                    <div>
                      <p className="eyebrow">Spent</p>
                      <p className="mt-1 font-serif text-lg tabular-nums text-terracotta">
                        {groupStats[group.group_id] ? fmt(groupStats[group.group_id].total) : '—'}
                      </p>
                    </div>
                  </div>

                  {groupStats[group.group_id]?.latest && (
                    <div className="mt-4 rounded-xl border border-ink/10 bg-paper-50/70 px-3 py-2">
                      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-ink-mute">Last entry</p>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="truncate text-sm text-ink">{groupStats[group.group_id].latest.description}</p>
                        <p className="font-serif text-sm tabular-nums text-ink-soft">{fmt(groupStats[group.group_id].latest.amount)}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end">
                    <ArrowRight className="h-4 w-4 text-ink-mute transition group-hover:translate-x-1 group-hover:text-terracotta" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-40 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 py-10">
              <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setShowModal(false)} aria-hidden="true" />
              <div className="paper-card relative w-full max-w-2xl overflow-hidden p-0">
                <div className="paper-tape" />
                <form onSubmit={handleSubmit}>
                  <div className="px-8 pt-10 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">New chapter</p>
                        <h3 className="editorial mt-2">Create a group.</h3>
                        <p className="mt-2 max-w-md text-sm text-ink-mute">
                          Name the circle, add a gentle description, pick a type.
                        </p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper-50 text-terracotta">
                        <Layers3 className="h-4 w-4" />
                      </span>
                    </div>

                    <div className="mt-6 space-y-5">
                      <div>
                        <label className="label-etched">Group name</label>
                        <input
                          type="text" required className={fieldClass}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label-etched">Description</label>
                        <textarea
                          rows="3" className={fieldClass}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label-etched">Group type</label>
                        <select
                          className={fieldClass}
                          value={formData.group_type}
                          onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
                        >
                          <option value="general">General</option>
                          <option value="travel">Travel</option>
                          <option value="roommate">Roommate</option>
                          <option value="event">Event</option>
                        </select>
                        <p className="mt-2 text-xs text-ink-mute">{groupTypeDescriptions[formData.group_type]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col-reverse gap-3 border-t border-ink/10 bg-paper-200/40 px-8 py-5 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-ink disabled:opacity-50">
                      {loading ? 'Pressing…' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Groups;
