import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getOrgByUser } from './lib/firestore';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import OrgOnboarding from './pages/OrgOnboarding';
import VolunteerIntake from './pages/VolunteerIntake';
import VolunteerMatch from './pages/VolunteerMatch';
import VolunteerConfirmed from './pages/VolunteerConfirmed';
import VolunteerSearch from './pages/VolunteerSearch';
import VolunteerDashboard from './pages/VolunteerDashboard';
import OpportunityDetail from './pages/OpportunityDetail';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import CoordinatorVolunteers from './pages/CoordinatorVolunteers';
import CoordinatorShifts from './pages/CoordinatorShifts';
import SurgeForm from './pages/SurgeForm';
import SurgeLive from './pages/SurgeLive';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
        ))}
      </div>
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    const next = encodeURIComponent(location.pathname);
    return <Navigate to={`/auth?role=${role || 'volunteer'}&next=${next}`} replace />;
  }

  return children;
}

// Coordinator route: also checks if org exists, redirects to setup if not
function CoordinatorRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasOrg, setHasOrg] = useState(false);

  useEffect(() => {
    // If auth is still loading, wait
    if (loading) return;
    // If no user, stop checking immediately — redirect below will handle it
    if (!user) { setChecking(false); return; }
    getOrgByUser(user.uid)
      .then((org) => setHasOrg(!!org))
      .catch(() => setHasOrg(false))
      .finally(() => setChecking(false));
  }, [user, loading]);

  if (loading || checking) return <LoadingScreen />;

  if (!user) {
    const next = encodeURIComponent(location.pathname);
    return <Navigate to={`/auth?role=coordinator&next=${next}`} replace />;
  }

  if (!hasOrg && location.pathname !== '/coordinator/setup') {
    return <Navigate to="/coordinator/setup" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      {/* Volunteer routes */}
      <Route path="/volunteer/search" element={<ProtectedRoute role="volunteer"><VolunteerSearch /></ProtectedRoute>} />
      <Route path="/volunteer/intake" element={<ProtectedRoute role="volunteer"><VolunteerIntake /></ProtectedRoute>} />
      <Route path="/volunteer/match" element={<ProtectedRoute role="volunteer"><VolunteerMatch /></ProtectedRoute>} />
      <Route path="/volunteer/confirmed" element={<ProtectedRoute role="volunteer"><VolunteerConfirmed /></ProtectedRoute>} />
      <Route path="/volunteer/dashboard" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
      <Route path="/volunteer/opportunity/:id" element={<ProtectedRoute role="volunteer"><OpportunityDetail /></ProtectedRoute>} />

      {/* Coordinator routes */}
      <Route path="/coordinator/setup" element={<ProtectedRoute role="coordinator"><OrgOnboarding /></ProtectedRoute>} />
      <Route path="/coordinator" element={<CoordinatorRoute><CoordinatorDashboard /></CoordinatorRoute>} />
      <Route path="/coordinator/volunteers" element={<CoordinatorRoute><CoordinatorVolunteers /></CoordinatorRoute>} />
      <Route path="/coordinator/shifts" element={<CoordinatorRoute><CoordinatorShifts /></CoordinatorRoute>} />
      <Route path="/coordinator/surge" element={<CoordinatorRoute><SurgeForm /></CoordinatorRoute>} />
      <Route path="/coordinator/surge/live" element={<CoordinatorRoute><SurgeLive /></CoordinatorRoute>} />
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
