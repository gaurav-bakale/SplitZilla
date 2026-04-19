import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, CheckCheck, Compass, Coins, Receipt, TrendingUp, Users, WalletCards } from 'lucide-react';
import Navbar from '../components/Navbar';
import Reveal from '../components/Reveal';
import api from '../api/axios';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
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

      const perGroup = await Promise.allSettled(
        groupsRes.data.map((g) => api.get(`/api/expenses/group/${g.group_id}`))
      );
      const flat = [];
      perGroup.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          const gName = groupsRes.data[i].name;
          const gId = groupsRes.data[i].group_id;
          r.value.data.forEach((e) => flat.push({ ...e, group_name: gName, group_id: gId }));
        }
      });
      setAllExpenses(flat);
    } catch (fetchError) {
      console.error('Error fetching dashboard data:', fetchError);
      setError('Unable to load dashboard data right now.');
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const sum = allExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = allExpenses
      .filter((e) => new Date(e.date) >= monthStart)
      .reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const categories = {};
    allExpenses.forEach((e) => { categories[e.category || 'GENERAL'] = (categories[e.category || 'GENERAL'] || 0) + Number(e.amount || 0); });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    return { sum, thisMonth, topCategory, count: allExpenses.length };
  }, [allExpenses]);

  const recent = useMemo(() =>
    [...allExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6),
    [allExpenses]
  );

  const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

  const handleMarkAsRead = async (notificationId) => {
    setMarkingRead(notificationId);
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (markError) {
      console.error('Error marking notification as read:', markError);
    } finally {
      setMarkingRead(null);
    }
  };

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute bottom-[-16rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-sage/15 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-3 text-ink-mute">
            <span className="h-px w-10 bg-ink-mute/50" />
            <span className="eyebrow">Issue № 07 · {today}</span>
          </div>
          <h1 className="display mt-4 drop-ornament">
            The <em className="italic text-terracotta">morning</em> ledger.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
            A front-page look at your groups, the quiet balances between friends, and what needs your attention today.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="paper-card p-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow">vol.i · circles</p>
                <Users className="h-4 w-4 text-terracotta" />
              </div>
              <p className="editorial mt-3 tabular-nums">{groups.length}</p>
              <p className="mt-2 text-sm text-ink-mute">Groups you keep a page for.</p>
            </div>
            <div className="paper-card p-6 tilt-right">
              <div className="flex items-center justify-between">
                <p className="eyebrow">vol.ii · entries</p>
                <Receipt className="h-4 w-4 text-terracotta" />
              </div>
              <p className="editorial mt-3 tabular-nums">{totals.count}</p>
              <p className="mt-2 text-sm text-ink-mute">Expenses filed across groups.</p>
            </div>
            <div className="paper-card p-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow">vol.iii · this month</p>
                <TrendingUp className="h-4 w-4 text-sage-500" />
              </div>
              <p className="editorial mt-3 tabular-nums">{fmt(totals.thisMonth)}</p>
              <p className="mt-2 text-sm text-ink-mute">Spent since the first.</p>
            </div>
            <div className="paper-card-ink p-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-paper-200">vol.iv · all-time</p>
                <Coins className="h-4 w-4 text-paper-200" />
              </div>
              <p className="editorial mt-3 text-paper-50 tabular-nums">{fmt(totals.sum)}</p>
              <p className="mt-2 text-sm text-paper-200">
                {totals.topCategory ? `${totals.topCategory[0].toLowerCase()} leads` : 'quiet so far'}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal delay={140}>
            <section className="paper-card p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Section A</p>
                  <h2 className="editorial mt-2">Your groups</h2>
                  <p className="mt-2 text-sm text-ink-mute">Open one for balances and its story.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                  <Users className="h-4 w-4 text-terracotta" />
                </span>
              </div>

              <div className="rule-dashed mt-6" />

              {error ? (
                <p className="mt-6 rounded-xl border border-terracotta-200 bg-terracotta-50/70 px-4 py-3 text-sm text-terracotta-600">{error}</p>
              ) : loading ? (
                <p className="mt-6 text-ink-mute">Turning the page…</p>
              ) : groups.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-paper-50/60 p-10 text-center">
                  <Compass className="mx-auto h-6 w-6 text-ink-mute" />
                  <p className="hand mt-3 text-2xl text-terracotta">start a circle</p>
                  <p className="mt-1 text-sm text-ink-mute">You haven&rsquo;t joined any groups yet.</p>
                  <Link to="/groups" className="btn-terracotta mt-5 inline-flex">
                    Create a group
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <ul className="mt-6 divide-y divide-ink/10">
                  {groups.slice(0, 5).map((group, i) => (
                    <li key={group.group_id}>
                      <Link
                        to={`/groups/${group.group_id}`}
                        className="group flex items-center justify-between gap-4 py-4 transition hover:bg-paper-200/40"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-serif text-sm italic text-ink-mute tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="editorial text-xl">{group.name}</p>
                            <p className="mt-0.5 text-xs uppercase tracking-[0.22em] text-ink-mute">
                              {group.members?.length || 0} members
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-ink-mute transition group-hover:translate-x-1 group-hover:text-terracotta" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {groups.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Link to="/groups" className="link-underline text-sm text-terracotta">
                    See the full index
                  </Link>
                </div>
              )}
            </section>
          </Reveal>

          <Reveal delay={200}>
            <section className="paper-card p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Section B</p>
                  <h2 className="editorial mt-2">Notices</h2>
                  <p className="mt-2 text-sm text-ink-mute">Gentle nudges from your ledger.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                  <Bell className="h-4 w-4 text-terracotta" />
                </span>
              </div>

              <div className="rule-dashed mt-6" />

              {error ? (
                <p className="mt-6 text-sm text-terracotta-600">{error}</p>
              ) : loading ? (
                <p className="mt-6 text-ink-mute">Turning the page…</p>
              ) : notifications.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-paper-50/60 p-8 text-center">
                  <WalletCards className="mx-auto h-5 w-5 text-ink-mute" />
                  <p className="hand mt-2 text-2xl text-terracotta">all quiet</p>
                  <p className="mt-1 text-sm text-ink-mute">No notifications yet.</p>
                </div>
              ) : (
                <ul className="mt-6 space-y-3">
                  {notifications.map((notification) => (
                    <li
                      key={notification.notification_id}
                      className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                        notification.is_read
                          ? 'border-ink/10 bg-paper-50/60'
                          : 'border-terracotta/30 bg-terracotta-50/60'
                      }`}
                    >
                      <span
                        className={`mt-1 h-2 w-2 flex-none rounded-full ${
                          notification.is_read ? 'bg-ink/20' : 'bg-terracotta'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${notification.is_read ? 'text-ink-mute' : 'text-ink'}`}>
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-ink-mute">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification.notification_id)}
                          disabled={markingRead === notification.notification_id}
                          className="flex-none rounded-full border border-ink/15 bg-paper-50 p-2 text-ink-soft transition hover:border-terracotta hover:text-terracotta disabled:opacity-50"
                          title="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        </div>

        <Reveal delay={260}>
          <section className="paper-card mt-8 p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Section C · feed</p>
                <h2 className="editorial mt-2">Latest entries.</h2>
                <p className="mt-2 text-sm text-ink-mute">A quiet chronicle across every group.</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                <Receipt className="h-4 w-4 text-terracotta" />
              </span>
            </div>
            <div className="rule-dashed mt-5" />

            {loading ? (
              <p className="mt-6 text-ink-mute">Turning the page…</p>
            ) : recent.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-paper-50/60 p-10 text-center">
                <p className="hand text-3xl text-terracotta">a pleasantly blank page</p>
                <p className="mt-2 text-sm text-ink-mute">No expenses recorded yet — create one inside any group.</p>
              </div>
            ) : (
              <ul className="mt-6 grid gap-2 md:grid-cols-2">
                {recent.map((e, i) => (
                  <li key={`${e.expense_id}-${i}`}>
                    <Link
                      to={`/groups/${e.group_id}`}
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-paper-50/60 p-4 transition hover:border-terracotta/40 hover:bg-terracotta-50/30"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-ink-mute">
                          <span>{e.group_name}</span>
                          <span className="h-1 w-1 rounded-full bg-ink/20" />
                          <span>{e.category || 'GENERAL'}</span>
                        </div>
                        <p className="font-serif mt-1 truncate text-xl text-ink">{e.description}</p>
                        {e.paid_by_name && (
                          <p className="mt-1 text-xs text-ink-mute">paid by <span className="text-terracotta">{e.paid_by_name}</span></p>
                        )}
                      </div>
                      <div className="text-right flex-none">
                        <p className="font-serif text-lg tabular-nums">{fmt(e.amount)}</p>
                        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink-mute">
                          {new Date(e.date).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>
      </main>
    </div>
  );
};

export default Dashboard;
