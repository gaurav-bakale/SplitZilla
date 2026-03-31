import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Plus, Users, ArrowRight, Radar, Sparkles, Orbit, Layers3 } from 'lucide-react';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'general'
  });
  const [loading, setLoading] = useState(false);

  const groupTypeDescriptions = {
    general: 'Flexible shared spending for any mission.',
    travel: 'Trips, flights, stays, and shared adventures.',
    roommate: 'Recurring home costs and apartment life.',
    event: 'One-off plans, parties, and coordinated budgets.',
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setPageLoading(true);
    setPageError('');
    try {
      const response = await api.get('/api/groups/');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setPageError('Unable to load groups right now.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/groups/', formData);
      setShowModal(false);
      setFormData({ name: '', description: '', group_type: 'general' });
      await fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_70%_18%,rgba(168,85,247,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(92,225,230,0.06),transparent_35%,rgba(168,85,247,0.08)_70%,transparent)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
                  Group Network
                </span>
                <h1 className="mt-6 font-['Orbitron'] text-4xl font-bold uppercase tracking-[0.12em] text-slate-50 sm:text-5xl">
                  Launch Shared Spaces
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                  Create focused expense groups, move between active circles fast, and keep every shared budget in one command layer.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Total Pods</p>
                    <p className="mt-3 font-['Orbitron'] text-3xl font-bold text-slate-100">{groups.length}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Modes</p>
                    <p className="mt-3 font-['Orbitron'] text-3xl font-bold text-cyan-300">4</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Status</p>
                    <p className="mt-3 font-['Orbitron'] text-3xl font-bold text-slate-100">Live</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 self-end">
                <div className="rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Group Engine</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">Multi-room coordination ready</p>
                    </div>
                    <Orbit className="h-5 w-5 text-cyan-300" />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Recommended Flow</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">Create, invite, track, settle</p>
                    </div>
                    <Radar className="h-5 w-5 text-fuchsia-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 mt-8 flex items-center justify-between">
            <div>
              <h2 className="font-['Orbitron'] text-2xl font-bold uppercase tracking-[0.12em] text-slate-100">Active Groups</h2>
              <p className="mt-2 text-sm text-slate-400">Tap into any shared expense universe or initialize a new one.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </button>
          </div>

          {pageError ? (
            <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 px-6 py-16 text-center shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
              <h3 className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-rose-100">
                Feed Error
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-rose-100/80">
                {pageError}
              </p>
            </div>
          ) : pageLoading ? (
            <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/50 px-6 py-16 text-center shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
              <p className="font-['Orbitron'] text-lg uppercase tracking-[0.12em] text-slate-200">Loading Groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
              <Sparkles className="mx-auto h-10 w-10 text-cyan-300" />
              <h3 className="mt-5 font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-slate-100">
                No Groups Yet
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Start your first shared space to track bills, trips, and event spending with a cleaner workflow.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-6 inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {groups.map((group) => (
                <Link
                  key={group.group_id}
                  to={`/groups/${group.group_id}`}
                  className="group relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-slate-900"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(92,225,230,0.05),transparent_38%,rgba(168,85,247,0.08)_78%,transparent)] opacity-0 transition group-hover:opacity-100" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Expense Group</p>
                        <h3 className="mt-3 text-xl font-semibold text-slate-100">{group.name}</h3>
                      </div>
                      <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
                        <Users className="h-5 w-5" />
                      </span>
                    </div>

                    <p className="mt-4 min-h-[3rem] text-sm leading-6 text-slate-400">
                      {group.description || 'A coordinated space for shared expenses and streamlined settlement.'}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Members</p>
                        <p className="mt-2 font-['Orbitron'] text-2xl font-bold text-slate-100">
                          {group.members?.length || 0}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-cyan-300 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 z-40 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center px-4 py-10">
                <div
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                  onClick={() => setShowModal(false)}
                />
                <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-900/90 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(92,225,230,0.06),transparent_35%,rgba(168,85,247,0.08)_70%,transparent)]" />
                  <form onSubmit={handleSubmit}>
                    <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
                            Create Group
                          </span>
                          <h3 className="mt-5 font-['Orbitron'] text-2xl font-bold uppercase tracking-[0.12em] text-slate-100">
                            Initialize New Space
                          </h3>
                          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                            Choose a type, name the mission, and start inviting people into a cleaner shared-finance workflow.
                          </p>
                        </div>
                        <span className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 text-cyan-300">
                          <Layers3 className="h-5 w-5" />
                        </span>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Group Name</label>
                          <input
                            type="text"
                            required
                            className="block w-full rounded-2xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Description</label>
                          <textarea
                            className="block w-full rounded-2xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Group Type</label>
                          <select
                            className="block w-full rounded-2xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                            value={formData.group_type}
                            onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
                          >
                            <option value="general">General</option>
                            <option value="travel">Travel</option>
                            <option value="roommate">Roommate</option>
                            <option value="event">Event</option>
                          </select>
                          <p className="mt-3 text-sm text-slate-500">
                            {groupTypeDescriptions[formData.group_type]}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex flex-col-reverse gap-3 border-t border-cyan-400/10 bg-slate-950/60 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
