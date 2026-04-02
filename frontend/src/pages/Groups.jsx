import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers3, Plus, Sparkles, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'general',
  });
  const [loading, setLoading] = useState(false);

  const groupTypeDescriptions = {
    general: 'Flexible shared spending for any situation.',
    travel: 'Trips, flights, stays, and shared travel costs.',
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-sky-300">
                Groups
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
                Shared Groups
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Create focused groups and manage shared expenses in a clear, organized way.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Total Groups</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">{groups.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Modes</p>
                  <p className="mt-3 text-3xl font-semibold text-sky-300">4</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Status</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">Live</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 self-end">
              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Coverage</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">Trips, roommates, events, and more</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Workflow</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">Create, invite, and track spending</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Active Groups</h2>
            <p className="mt-2 text-sm text-slate-400">Open any group or create a new shared workspace.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </button>
        </div>

        {pageError ? (
          <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 px-6 py-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <h3 className="text-xl font-semibold text-rose-100">Feed Error</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-rose-100/80">{pageError}</p>
          </div>
        ) : pageLoading ? (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 px-6 py-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <p className="text-lg font-semibold text-slate-200">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-900 px-6 py-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <Sparkles className="mx-auto h-10 w-10 text-sky-300" />
            <h3 className="mt-5 text-xl font-semibold text-slate-100">No Groups Yet</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Start your first shared space to track bills, trips, and event spending.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
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
                className="group rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Expense Group</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-100">{group.name}</h3>
                  </div>
                  <span className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sky-300">
                    <Users className="h-5 w-5" />
                  </span>
                </div>

                <p className="mt-4 min-h-[3rem] text-sm leading-6 text-slate-400">
                  {group.description || 'A shared space for tracking expenses and balances.'}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Members</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-100">{group.members?.length || 0}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
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
              <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <form onSubmit={handleSubmit}>
                  <div className="px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-sky-300">
                          Create Group
                        </span>
                        <h3 className="mt-5 text-2xl font-semibold text-slate-100">Create New Group</h3>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                          Set up a group, add a description, and choose the type that fits the use case.
                        </p>
                      </div>
                      <span className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sky-300">
                        <Layers3 className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">Group Name</label>
                        <input
                          type="text"
                          required
                          className="block w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/30"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">Description</label>
                        <textarea
                          className="block w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/30"
                          rows="3"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">Group Type</label>
                        <select
                          className="block w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/30"
                          value={formData.group_type}
                          onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
                        >
                          <option value="general">General</option>
                          <option value="travel">Travel</option>
                          <option value="roommate">Roommate</option>
                          <option value="event">Event</option>
                        </select>
                        <p className="mt-3 text-sm text-slate-500">{groupTypeDescriptions[formData.group_type]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
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
  );
};

export default Groups;
