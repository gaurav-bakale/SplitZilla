import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-14 flex-col justify-center gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/dashboard" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-200 bg-primary-50 text-primary-700">
                <LayoutDashboard className="h-4 w-4" />
              </span>
              <div>
                <span className="block text-base font-semibold text-slate-900">
                  SplitZilla
                </span>
                <span className="block text-xs text-slate-500">Expense splitting</span>
              </div>
            </Link>
            <div className="flex flex-wrap gap-2 sm:ml-6">
              <Link
                to="/dashboard"
                className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-card transition hover:border-slate-300 hover:bg-slate-50"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/groups"
                className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-card transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Users className="mr-2 h-4 w-4" />
                Groups
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-card transition hover:bg-slate-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
