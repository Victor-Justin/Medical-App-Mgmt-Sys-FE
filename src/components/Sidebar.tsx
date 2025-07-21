import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../features/store';

const Sidebar = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <div className="w-64 h-screen bg-gradient-to-br from-blue-900 via-white to-blue-700 text-black p-6 flex flex-col space-y-6">
      <h2 className="text-2xl font-bold">Medi-Track</h2>

      <nav className="flex flex-col space-y-4">
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/users" className="hover:text-blue-300">Manage Users</Link>
            <Link to="/admin/analytics" className="hover:text-blue-300">System Analytics</Link>
            <Link to="/admin/tickets" className="hover:text-blue-300">Support Tickets</Link>
            <Link to="/admin/config" className="hover:text-blue-300">System Config</Link>
            <Link to="/admin/audit" className="hover:text-blue-300">Audit Monitor</Link>
          </>
        )}

        {user?.role === 'doctor' && (
          <>
            <Link to="/doctor/appointments" className="hover:text-blue-300">Manage Appointments</Link>
            <Link to="/doctor/patients" className="hover:text-blue-300">Patient Records</Link>
            <Link to="/doctor/prescriptions" className="hover:text-blue-300">Prescriptions</Link>
            <Link to="/doctor/schedule" className="hover:text-blue-300">My Schedule</Link>
            <Link to="/doctor/analytics" className="hover:text-blue-300">Analytics</Link>
          </>
        )}

        {user?.role === 'patient' && (
          <>
            <Link to="/user/doctors" className="hover:text-blue-300">Browse Doctors</Link>
            <Link to="/user/appointments" className="hover:text-blue-300">My Appointments</Link>
            <Link to="/user/prescriptions" className="hover:text-blue-300">Prescriptions</Link>
            <Link to="/user/tickets" className="hover:text-blue-300">Support Tickets</Link>
            <Link to="/user/payments" className="hover:text-blue-300">Payments</Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
