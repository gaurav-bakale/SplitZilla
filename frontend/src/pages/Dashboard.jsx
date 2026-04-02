import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Bell, CheckCheck, Users, WalletCards } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

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
        api.get('/api/notifications/'),
      ]);
      setGroups(groupsRes.data);
      setNotifications(notificationsRes.data.slice(0, 5));
    } catch (fetchError) {
      console.error('Error fetching dashboard data:', fetchError);
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
        prev.map((notification) =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (markError) {
      console.error('Error marking notification as read:', markError);
    } finally {
      setMarkingRead(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-sky-300">
                Overview
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
                Dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Review active groups, recent notifications, and the current status of your shared expenses.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Groups</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">{groups.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Unread Alerts</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">{unreadCount}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Status</p>
                  <p className="mt-3 text-3xl font-semibold text-sky-300">Live</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/groups"
                  className="inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                >
                  Open Groups
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-end">
              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Activity</p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">System operating normally</p>
                  </div>
                  <Activity className="h-5 w-5 text-sky-300" />
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-4/5 rounded-full bg-sky-500" />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Notifications</p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">{notifications.length} recent items</p>
                  </div>
                  <Bell className="h-5 w-5 text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">Your Groups</h2>
                <p className="mt-2 text-sm text-slate-400">Open a group to review balances and expenses.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                <Users className="h-5 w-5 text-sky-300" />
              </div>
            </div>

            {error ? (
              <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-200">
                {error}
              </div>
            ) : loading ? (
              <p className="text-slate-400">Loading dashboard feed...</p>
            ) : groups.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-700 bg-slate-950 py-12 text-center">
                <p className="mb-4 text-slate-400">You haven't joined any groups yet.</p>
                <Link
                  to="/groups"
                  className="inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
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
                    className="block rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700 hover:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-slate-100">{group.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{group.members?.length || 0} members</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">Recent Notifications</h2>
                <p className="mt-2 text-sm text-slate-400">Recent alerts and group activity.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                <WalletCards className="h-5 w-5 text-sky-300" />
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
                        ? 'border-slate-800 bg-slate-950'
                        : 'border-sky-500/20 bg-sky-500/10'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${notification.is_read ? 'text-slate-400' : 'font-medium text-slate-100'}`}>
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.notification_id)}
                        disabled={markingRead === notification.notification_id}
                        className="flex-shrink-0 rounded-full border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300 transition hover:border-sky-500/40 hover:text-white disabled:opacity-50"
                        title="Mark as read"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
