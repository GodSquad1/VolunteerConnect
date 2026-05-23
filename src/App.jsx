import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import VolunteerIntake from './pages/VolunteerIntake';
import VolunteerMatch from './pages/VolunteerMatch';
import VolunteerConfirmed from './pages/VolunteerConfirmed';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import SurgeForm from './pages/SurgeForm';
import SurgeLive from './pages/SurgeLive';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname);
    return <Navigate to={`/auth?role=${role || 'volunteer'}&next=${next}`} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/volunteer/intake"
        element={<ProtectedRoute role="volunteer"><VolunteerIntake /></ProtectedRoute>}
      />
      <Route
        path="/volunteer/match"
        element={<ProtectedRoute role="volunteer"><VolunteerMatch /></ProtectedRoute>}
      />
      <Route
        path="/volunteer/confirmed"
        element={<ProtectedRoute role="volunteer"><VolunteerConfirmed /></ProtectedRoute>}
      />
      <Route
        path="/coordinator"
        element={<ProtectedRoute role="coordinator"><CoordinatorDashboard /></ProtectedRoute>}
      />
      <Route
        path="/coordinator/surge"
        element={<ProtectedRoute role="coordinator"><SurgeForm /></ProtectedRoute>}
      />
      <Route
        path="/coordinator/surge/live"
        element={<ProtectedRoute role="coordinator"><SurgeLive /></ProtectedRoute>}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
