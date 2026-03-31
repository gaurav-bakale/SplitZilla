import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, LayoutDashboard, Zap } from 'lucide-react';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-cyan-400/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-col justify-center gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/dashboard" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <span className="block font-['Orbitron'] text-lg font-bold uppercase tracking-[0.24em] text-slate-100">
                  SplitZilla
                </span>
                <span className="block text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  Mission Control
                </span>
              </div>
            </Link>
            <div className="sm:ml-8 flex flex-wrap gap-2">
              <Link
                to="/dashboard"
                className="flex items-center rounded-full border border-cyan-400/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-slate-900 hover:text-cyan-300"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/groups"
                className="flex items-center rounded-full border border-cyan-400/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-slate-900 hover:text-cyan-300"
              >
                <Users className="w-4 h-4 mr-2" />
                Groups
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/15 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
