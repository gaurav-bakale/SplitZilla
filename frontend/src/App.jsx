import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Groups = lazy(() => import('./pages/Groups'));
const GroupDetail = lazy(() => import('./pages/GroupDetail'));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Loading Route</p>
          <h1 className="mt-5 font-['Orbitron'] text-3xl font-bold uppercase tracking-[0.12em] text-slate-100">
            Preparing Interface
          </h1>
          <div className="mx-auto mt-8 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={<RouteFallback />}>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <PrivateRoute>
                    <Groups />
                  </PrivateRoute>
                }
              />
              <Route
                path="/groups/:groupId"
                element={
                  <PrivateRoute>
                    <GroupDetail />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
