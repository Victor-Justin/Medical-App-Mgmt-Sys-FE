import { useSelector } from 'react-redux';
import { type RootState } from '../features/store';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { FaHeartbeat, FaCalendarCheck, FaNotesMedical, FaTicketAlt, FaMoneyBillWaveAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PatientDashboardPage = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

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


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link
                to="/user/doctors"
                className="w-full bg-blue-400 hover:bg-blue-500 text-white p-10 rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-5 cursor-pointer"
              >
                <FaHeartbeat className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">Browse Doctors</p>
                  <p className="text-blue-200 text-sm">Find specialists & book appointments</p>
                </div>
              </Link>

              <Link
                to="/user/appointments"
                className="w-full bg-blue-400 hover:bg-blue-500 text-white p-10 rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-5 cursor-pointer"
              >
                <FaCalendarCheck className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">My Appointments</p>
                  <p className="text-blue-200 text-sm">View and manage bookings</p>
                </div>
              </Link>


              <Link
                to="/user/prescriptions"
                className="w-full bg-blue-400 hover:bg-blue-500 text-white p-10 rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-5 cursor-pointer"
              >
                <FaNotesMedical className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">My Prescriptions</p>
                  <p className="text-blue-200 text-sm">Access treatment notes</p>
                </div>
              </Link>

              <Link
                to="/user/tickets"
                className="w-full bg-blue-400 hover:bg-blue-500 text-white p-10 rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-5 cursor-pointer"
              >
                <FaTicketAlt className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">Tickets</p>
                  <p className="text-blue-200 text-sm">View created customer support tickets</p>
                </div>
              </Link>

              <Link
                to="/user/payments"
                className="w-full bg-blue-400 hover:bg-blue-500 text-white p-10 rounded-2xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-5 cursor-pointer"
              >
                <FaMoneyBillWaveAlt className="text-5xl" />
                <div>
                  <p className="text-2xl font-semibold">Payments</p>
                  <p className="text-blue-200 text-sm">Keep track of payments</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
