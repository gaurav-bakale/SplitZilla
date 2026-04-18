import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers3, Plus, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-card-md">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">
                Groups
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Shared groups
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Create groups and manage shared expenses in one place.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{groups.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Types</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-primary-700">4</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">Active</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 self-end">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Use cases</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Travel, roommates, events</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Workflow</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Invite members and track spending</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Your groups</h2>
            <p className="mt-1 text-sm text-slate-600">Open a group or create a new one.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-primary-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New group
          </button>
        </div>

        {pageError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-card-md">
            <h3 className="text-lg font-semibold text-red-900">Couldn&apos;t load groups</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-red-800">{pageError}</p>
          </div>
        ) : pageLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-card-md">
            <p className="font-medium text-slate-700">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-card-md">
            <h3 className="text-lg font-semibold text-slate-900">No groups yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              Create a group to track shared bills, trips, and events.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-primary-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.group_id}
                to={`/groups/${group.group_id}`}
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-card-md transition hover:border-slate-300 hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Group</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{group.name}</h3>
                  </div>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-primary-600">
                    <Users className="h-5 w-5" />
                  </span>
                </div>

                <p className="mt-4 min-h-[3rem] text-sm leading-6 text-slate-600">
                  {group.description || 'Shared expenses and balances for this group.'}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Members</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{group.members?.length || 0}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-40 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-slate-900/30"
                onClick={() => setShowModal(false)}
                aria-hidden="true"
              />
              <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-md">
                <form onSubmit={handleSubmit}>
                  <div className="px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">
                          New group
                        </span>
                        <h3 className="mt-4 text-xl font-semibold text-slate-900">Create group</h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                          Name your group, add a description, and pick a type.
                        </p>
                      </div>
                      <span className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-primary-600">
                        <Layers3 className="h-5 w-5" />
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Group name</label>
                        <input
                          type="text"
                          required
                          className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-offset-2 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                          className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-offset-2 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          rows="3"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Group type</label>
                        <select
                          className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-offset-2 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          value={formData.group_type}
                          onChange={(e) => setFormData({ ...formData, group_type: e.target.value })}
                        >
                          <option value="general">General</option>
                          <option value="travel">Travel</option>
                          <option value="roommate">Roommate</option>
                          <option value="event">Event</option>
                        </select>
                        <p className="mt-2 text-sm text-slate-500">{groupTypeDescriptions[formData.group_type]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-primary-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
