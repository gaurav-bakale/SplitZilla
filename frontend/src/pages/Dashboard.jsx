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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-card-md">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">
                Overview
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Active groups, recent notifications, and shared expense activity.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Groups</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{groups.length}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Unread</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{unreadCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sync</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">Up to date</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/groups"
                  className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-primary-700"
                >
                  View groups
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-end">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Activity</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">Operating normally</p>
                  </div>
                  <Activity className="h-5 w-5 text-primary-600" />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-4/5 rounded-full bg-primary-600" />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notifications</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{notifications.length} recent</p>
                  </div>
                  <Bell className="h-5 w-5 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card-md">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Your groups</h2>
                <p className="mt-1 text-sm text-slate-600">Open a group for balances and expenses.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            ) : loading ? (
              <p className="text-slate-600">Loading...</p>
            ) : groups.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <p className="mb-4 text-slate-600">You haven&apos;t joined any groups yet.</p>
                <Link
                  to="/groups"
                  className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-primary-700"
                >
                  Create a group
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.slice(0, 5).map((group) => (
                  <Link
                    key={group.group_id}
                    to={`/groups/${group.group_id}`}
                    className="block rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-slate-900">{group.name}</h3>
                        <p className="mt-0.5 text-sm text-slate-600">{group.members?.length || 0} members</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card-md">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                <p className="mt-1 text-sm text-slate-600">Recent alerts and activity.</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <WalletCards className="h-5 w-5 text-primary-600" />
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            ) : loading ? (
              <p className="text-slate-600">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-slate-600">No notifications yet.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      notification.is_read
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-primary-200 bg-primary-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${notification.is_read ? 'text-slate-600' : 'font-medium text-slate-900'}`}>
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.notification_id)}
                        disabled={markingRead === notification.notification_id}
                        className="flex-shrink-0 rounded-lg border border-primary-200 bg-white p-2 text-primary-700 transition hover:bg-primary-50 disabled:opacity-50"
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
