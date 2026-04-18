import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-10 text-center shadow-card-md">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Signing in
          </p>
          <p className="mt-4 text-slate-600">Restoring your session...</p>
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
