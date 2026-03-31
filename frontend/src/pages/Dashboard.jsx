import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Users, Bell, CheckCheck, ArrowRight, Radar, WalletCards, Activity } from 'lucide-react';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingRead, setMarkingRead] = useState(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [groupsRes, notificationsRes] = await Promise.all([
        api.get('/api/groups/'),
        api.get('/api/notifications/')
      ]);
      setGroups(groupsRes.data);
      setNotifications(notificationsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Unable to load dashboard data right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setMarkingRead(notificationId);
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setMarkingRead(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_75%_15%,rgba(168,85,247,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(92,225,230,0.06),transparent_35%,rgba(168,85,247,0.08)_70%,transparent)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
                  Live Overview
                </span>
                <h1 className="mt-6 font-['Orbitron'] text-4xl font-bold uppercase tracking-[0.12em] text-slate-50 sm:text-5xl">
                  Financial Mission Dashboard
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                  Monitor group activity, incoming alerts, and settlement momentum from a single futuristic command surface.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Groups Online</p>
                    <p className="mt-3 font-['Orbitron'] text-3xl font-bold text-slate-100">{groups.length}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Unread Alerts</p>
                    <p className="mt-3 font-['Orbitron'] text-3xl font-bold text-slate-100">{unreadCount}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/40 p-4">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Feed Status</p>
                    <p className="mt-3 font-['Orbitron'] text-3xl font-bold text-cyan-300">Live</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/groups"
                    className="inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
                  >
                    Open Groups
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950/50 px-5 py-3 text-sm uppercase tracking-[0.2em] text-slate-400">
                    <Radar className="mr-2 h-4 w-4 text-cyan-300" />
                    Synced With Backend
                  </div>
                </div>
              </div>

              <div className="grid gap-4 self-end">
                <div className="rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Activity Pulse</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">System operating normally</p>
                    </div>
                    <Activity className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400" />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Notification Stream</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">{notifications.length} recent events loaded</p>
                    </div>
                    <Bell className="h-5 w-5 text-fuchsia-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-slate-100">Your Groups</h2>
                  <p className="mt-2 text-sm text-slate-400">Jump into any active space and manage shared spending.</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-3">
                  <Users className="h-5 w-5 text-cyan-300" />
                </div>
              </div>
              {error ? (
                <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-200">
                  {error}
                </div>
              ) : loading ? (
                <p className="text-slate-400">Loading dashboard feed...</p>
              ) : groups.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-700 bg-slate-950/40 py-12 text-center">
                  <p className="mb-4 text-slate-400">You haven't joined any groups yet.</p>
                  <Link
                    to="/groups"
                    className="inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
                  >
                    Create First Group
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.slice(0, 5).map((group) => (
                    <Link
                      key={group.group_id}
                      to={`/groups/${group.group_id}`}
                      className="block rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/40 p-4 transition hover:border-cyan-400/30 hover:bg-slate-900"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-slate-100">
                            {group.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {group.members?.length || 0} members
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-cyan-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-slate-100">Recent Notifications</h2>
                  <p className="mt-2 text-sm text-slate-400">Your latest alerts and activity pings.</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-400/10 bg-fuchsia-400/10 p-3">
                  <WalletCards className="h-5 w-5 text-fuchsia-300" />
                </div>
              </div>
              {error ? (
                <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-200">
                  {error}
                </div>
              ) : loading ? (
                <p className="text-slate-400">Loading notification stream...</p>
              ) : notifications.length === 0 ? (
                <p className="text-slate-400">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.notification_id}
                      className={`flex items-start gap-3 rounded-[1.5rem] border p-4 ${
                        notification.is_read
                          ? 'border-slate-800 bg-slate-950/35'
                          : 'border-cyan-400/20 bg-cyan-400/10'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.is_read ? 'text-slate-400' : 'font-medium text-slate-100'}`}>
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.notification_id)}
                          disabled={markingRead === notification.notification_id}
                          className="flex-shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300 transition hover:border-cyan-400/40 hover:text-white disabled:opacity-50"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
