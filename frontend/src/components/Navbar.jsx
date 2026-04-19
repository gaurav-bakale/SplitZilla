import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, LayoutDashboard, Heart, Bell, Check, X, UserCircle } from 'lucide-react';
import api from '../api/axios';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get('/api/notifications/').then((r) => setNotifications(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => n.notification_id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch {
      // silent
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.allSettled(unread.map((n) => api.put(`/api/notifications/${n.notification_id}/read`)));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
      isActive
        ? 'bg-ink text-paper-50 shadow-paper'
        : 'text-ink-soft hover:text-ink hover:bg-paper-200/60'
    }`;

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-paper-50 shadow-paper">
            <span className="font-serif text-lg italic text-terracotta">S</span>
            <span className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-full bg-terracotta" />
          </span>
          <div className="leading-tight">
            <span className="block font-serif text-lg text-ink" style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1' }}>
              SplitZilla
            </span>
            <span className="block text-[0.65rem] uppercase tracking-[0.28em] text-ink-mute">
              a quiet ledger
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/groups" className={linkClass}>
            <Users className="h-4 w-4" />
            Groups
          </NavLink>
          <NavLink to="/friends" className={linkClass}>
            <Heart className="h-4 w-4" />
            Friends
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifications((v) => !v)}
              className="relative inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper-50/70 px-3 py-2 text-sm text-ink-soft transition hover:border-ink/30 hover:bg-paper-100"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[0.6rem] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-ink/10 bg-paper-50 shadow-paper">
                <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                  <p className="font-serif text-base text-ink">Notifications</p>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-xs text-ink-mute transition hover:text-terracotta"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-ink-mute transition hover:text-ink"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-ink-mute">No notifications yet.</p>
                  ) : (
                    <ul>
                      {notifications.map((n) => (
                        <li
                          key={n.notification_id}
                          className={`flex items-start gap-3 border-b border-ink/5 px-4 py-3 last:border-b-0 ${
                            n.is_read ? 'opacity-60' : 'bg-terracotta-50/30'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-ink">{n.message}</p>
                            <p className="mt-0.5 text-[0.7rem] text-ink-mute">{fmt(n.created_at)}</p>
                          </div>
                          {!n.is_read && (
                            <button
                              type="button"
                              onClick={() => markAsRead(n.notification_id)}
                              className="mt-0.5 flex-none rounded-full border border-ink/15 p-1 text-ink-mute transition hover:border-sage hover:text-sage-600"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper-50/70 px-3 py-2 text-sm text-ink-soft transition hover:border-ink/30 hover:bg-paper-100 ${isActive ? 'border-terracotta/40 text-terracotta' : ''}`
            }
            title="Profile"
          >
            <UserCircle className="h-4 w-4" />
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper-50/70 px-4 py-2 text-sm text-ink-soft transition hover:border-ink/30 hover:bg-paper-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
