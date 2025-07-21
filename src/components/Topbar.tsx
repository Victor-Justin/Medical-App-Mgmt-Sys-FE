import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../features/store';
import { clearCredentials } from '../features/userSlice';

const Topbar = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearCredentials());
    localStorage.removeItem('token');
    navigate('/login');
  };
  console.log(user)

  return (
    <div className="navbar bg-blue-900 text-white px-6 shadow-lg flex justify-between items-center h-16">
      <div className="flex-1">
        <span className="text-xl font-bold">Dashboard</span>
      </div>

      {user && (
        <div className="flex items-center space-x-6">
          <span className="text-sm">
            👋 Hello, <span className="font-semibold">{user.first_name} {user.last_name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Topbar;
