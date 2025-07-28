import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { type RootState } from '../features/store';
import { clearCredentials } from '../features/userSlice';
import {
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaCog,
  FaUser,
  FaChevronDown,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaQuestionCircle,
} from 'react-icons/fa';

interface TopbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

const Topbar = ({ onToggleSidebar, isSidebarCollapsed }: TopbarProps) => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New appointment scheduled', time: '5 min ago', unread: true },
    { id: 2, message: 'Prescription ready for pickup', time: '1 hour ago', unread: true },
    { id: 3, message: 'System maintenance tonight', time: '2 hours ago', unread: false },
  ]);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length >= 2) {
      const page = segments[1];
      return page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ');
    }
    return 'Dashboard';
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const roleColors = {
    admin: 'from-purple-800 to-purple-700',
    doctor: 'from-emerald-800 to-emerald-700', 
    patient: 'from-blue-600 to-blue-500',
  };

  const currentGradient = roleColors[user?.role as keyof typeof roleColors] || 'from-blue-600 to-blue-500';

  return (
    <header className={`bg-gradient-to-r ${currentGradient} text-white shadow-lg relative z-20`}>
      <div className="flex items-center justify-between px-6 py-4 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
              aria-label="Toggle sidebar"
            >
              {isSidebarCollapsed ? <FaBars className="w-5 h-5" /> : <FaTimes className="w-5 h-5" />}
            </button>
          )}

          {/* Page Title */}
          <div>
            <h1 className="text-xl font-bold tracking-tight">{getPageTitle()}</h1>
            <p className="text-xs text-white/70 hidden sm:block">
              Welcome back, {user?.first_name}
            </p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients, appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
            </button>

            {/* Help */}
            <button
              onClick={() => navigate('/help')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
              title="Help & Support"
            >
              <FaQuestionCircle className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Notifications"
              >
                <FaBell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                          notification.unread ? 'border-blue-500 bg-blue-50/50' : 'border-transparent'
                        }`}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-black/30 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-white text-gray-800 font-bold rounded-full flex items-center justify-center shadow-sm">
                  {user.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-white/70 capitalize">
                    {user.role}
                  </div>
                </div>
                <FaChevronDown className={`w-3 h-3 transition-transform duration-200 hidden sm:block ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaUser className="w-4 h-4" />
                      My Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaCog className="w-4 h-4" />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-6 pb-4">
        <form onSubmit={handleSearch} className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
          />
        </form>
      </div>
    </header>
  );
};

export default Topbar;