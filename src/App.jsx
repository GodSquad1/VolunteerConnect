import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VolunteerIntake from './pages/VolunteerIntake';
import VolunteerMatch from './pages/VolunteerMatch';
import VolunteerConfirmed from './pages/VolunteerConfirmed';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import SurgeForm from './pages/SurgeForm';
import SurgeLive from './pages/SurgeLive';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/volunteer/intake" element={<VolunteerIntake />} />
        <Route path="/volunteer/match" element={<VolunteerMatch />} />
        <Route path="/volunteer/confirmed" element={<VolunteerConfirmed />} />
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/coordinator/surge" element={<SurgeForm />} />
        <Route path="/coordinator/surge/live" element={<SurgeLive />} />
      </Routes>
    </BrowserRouter>
  );
}
