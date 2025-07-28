import { useSelector } from 'react-redux';
import { type RootState } from '../features/store';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaUsers,
  FaFilePrescription,
  FaTicketAlt,
  FaChartBar
} from 'react-icons/fa';

const AdminDashboardPage = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Card */}
            <div className="bg-white shadow-xl rounded-3xl p-10 mb-10">
              <h1 className="text-4xl font-bold text-blue-900 mb-2 text-center">Welcome to Medi-Track</h1>
              {user ? (
                <div className="text-center">
                  <p className="text-2xl font-semibold mb-1">
                    Hello, {user.first_name} {user.last_name}! 👋
                  </p>
                  <p className="text-gray-500 text-lg capitalize">Role: {user.role}</p>
                </div>
              ) : (
                <p className="text-center text-red-500">No user data found. Please login again.</p>
              )}
            </div>

            {/* Quick Access Admin Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link
                to="/admin/appointments"
                className="w-full bg-purple-800 hover:bg-purple-700 text-white p-10 rounded-2xl shadow-lg transition-transform duration-200 transform hover:-translate-y-1 flex items-center gap-5"
              >
                <FaCalendarCheck className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">Appointments</p>
                  <p className="text-white text-sm">View all scheduled appointments</p>
                </div>
              </Link>

              <Link
                to="/admin/users"
                className="w-full bg-purple-800 hover:bg-purple-700 text-white p-10 rounded-2xl shadow-lg transition-transform duration-200 transform hover:-translate-y-1 flex items-center gap-5"
              >
                <FaUsers className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">User Management</p>
                  <p className="text-white text-sm">Manage patients and doctors</p>
                </div>
              </Link>

              <Link
                to="/admin/prescriptions"
                className="w-full bg-purple-800 hover:bg-purple-700 text-white p-10 rounded-2xl shadow-lg transition-transform duration-200 transform hover:-translate-y-1 flex items-center gap-5"
              >
                <FaFilePrescription className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">Prescriptions</p>
                  <p className="text-white text-sm">View all issued prescriptions</p>
                </div>
              </Link>

              <Link
                to="/admin/config"
                className="w-full bg-purple-800 hover:bg-purple-700 text-white p-10 rounded-2xl shadow-lg transition-transform duration-200 transform hover:-translate-y-1 flex items-center gap-5"
              >
                <FaTicketAlt className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">Support Tickets</p>
                  <p className="text-white text-sm">Respond to submitted issues</p>
                </div>
              </Link>

              <Link
                to="/admin/analytics"
                className="w-full bg-purple-800 hover:bg-purple-700 text-white p-10 rounded-2xl shadow-lg transition-transform duration-200 transform hover:-translate-y-1 flex items-center gap-5"
              >
                <FaChartBar className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">System Reports</p>
                  <p className="text-white text-sm">View platform analytics</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
