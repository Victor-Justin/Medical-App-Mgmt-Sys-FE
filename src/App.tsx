import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landingpage';
import AboutPage from './pages/Aboutpage';
import RegisterPage from './pages/Registerpage';
import VerifyPage from './pages/Verifypage';
import LoginPage from './pages/Loginpage';
import Footer from './components/Footer';
import PatientDashboardPage from './pages/Patientdashboard';
import Viewdoctors from './api/User/Viewdoctors.tsx';
import MyAppointments from './api/User/Myappointments.tsx';


function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
            <Route path="/user/doctors" element={<Viewdoctors />} />
            <Route path="/user/appointments" element={<MyAppointments />} />
          </Routes>
          
        </div>
        <Footer/>
      </div>
    </BrowserRouter>
  );
}

export default App;
