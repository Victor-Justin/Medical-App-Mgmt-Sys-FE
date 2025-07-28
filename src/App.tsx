import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/Landingpage';
import AboutPage from './pages/Aboutpage';
import RegisterPage from './pages/Registerpage';
import VerifyPage from './pages/Verifypage';
import LoginPage from './pages/Loginpage';
import Footer from './components/Footer';
import PatientDashboardPage from './pages/Patientdashboard';
import Viewdoctors from './dash/User/Viewdoctors.tsx';
import MyAppointments from './dash/User/MyAppointments.tsx';
import AdminDashboardPage from './pages/Admindashboard.tsx';
import ViewAppointmentsPage from './dash/Admin/ViewAppointments.tsx';
import ViewUsersPage from './dash/Admin/ViewUsers.tsx';
import PrescriptionsPage from './dash/Admin/ViewPrescriptions.tsx';
import AnalyticsDashboard from './dash/Admin/SystemAnalytics.tsx';
import MyPrescriptionsPage from './dash/User/MyPrescriptions.tsx';
import SupportTickets from './dash/User/MyComplaints.tsx';
import MyTickets from './dash/User/MyTickets.tsx';
import DoctorDashboardPage from './pages/Doctordashboard.tsx';
import DoctorAppointments from './dash/Doctor/DoctorAppointments.tsx';
import DoctorScheduleCalendar from './dash/Doctor/DoctorSchedule.tsx';
import AdminTickets from './dash/Admin/AdminTicktes.tsx';
import DoctorPrescriptionsPage from './dash/Doctor/DoctorPrescription.tsx';
import MyPayments from './dash/User/MyPayments.tsx';


function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/appointments" element={<ViewAppointmentsPage />} />
            <Route path="/admin/users" element={<ViewUsersPage />} />
            <Route path="/admin/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />


            <Route path="/user/dashboard" element={<PatientDashboardPage />} />
            <Route path="/user/doctors" element={<Viewdoctors />} />
            <Route path="/user/appointments" element={<MyAppointments />} />
            <Route path="/user/prescriptions" element={<MyPrescriptionsPage />} />
            <Route path="/user/complaint" element={<SupportTickets apId={0}/>} />
            <Route path="/user/tickets" element={<MyTickets />} />
            <Route path="/user/payments" element={<MyPayments />} />

            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/schedule" element={<DoctorScheduleCalendar />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />

           
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
