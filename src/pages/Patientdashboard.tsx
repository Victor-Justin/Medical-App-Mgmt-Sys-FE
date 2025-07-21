import { useSelector } from 'react-redux';
import { type RootState } from '../features/store';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';

const PatientDashboardPage = () => {
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex flex-col items-center justify-center p-8">
          <div className="card w-full max-w-lg bg-white shadow-xl rounded-2xl p-8 mt-8">
            <h1 className="text-4xl font-bold text-center mb-6">Medi-Track</h1>

            {user ? (
              <div className="text-center">
                <p className="text-xl font-semibold mb-2">
                  Welcome, {user.first_name} {user.last_name}! 👋
                </p>
                <p className="text-gray-600 mb-4">Role: {user.role}</p>
              </div>
            ) : (
              <p className="text-center text-red-500">No user data found. Please login again.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboardPage;
