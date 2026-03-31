import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-xl rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Authenticating</p>
            <p className="mt-4 text-lg text-slate-200">Restoring your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
