import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DonorDashboard from './components/DonorDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import AdminDashboard from './components/AdminDashboard';  // ← AJOUTÉ

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard-donateur" element={<DonorDashboard />} />
        <Route path="/dashboard-hopital" element={<HospitalDashboard />} />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />  {/* ← AJOUTÉ */}
      </Routes>
    </Router>
  );
}

export default App;