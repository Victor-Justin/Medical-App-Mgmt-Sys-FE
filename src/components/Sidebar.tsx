import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { type RootState } from '../features/store';
import {
  FaUserMd,
  FaCalendarAlt,
  FaClipboardList,
  FaTicketAlt,
  FaChartBar,
  FaUsers,
  FaFilePrescription,
  FaMoneyBillWave,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaHome,
  FaBell,
  FaUserCircle,
} from 'react-icons/fa';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({ isCollapsed = false, onToggleCollapse }: SidebarProps) => {
  const user = useSelector((state: RootState) => state.user.user);
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const showExpanded = !isCollapsed || isHovered;

  const linkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `
      group relative flex items-center gap-3 px-4 py-3 rounded-xl 
      transition-all duration-200 ease-in-out cursor-pointer
      ${isActive 
        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/10' 
        : 'text-blue-100 hover:bg-white/10 hover:text-white hover:shadow-md'
      }
      ${isCollapsed && !isHovered ? 'justify-center' : ''}
    `;
  };

  const roleConfig = {
    admin: {
      title: 'Admin Panel',
      color: 'from-purple-800 to-purple-700',
      links: [
        { path: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/admin/appointments', icon: FaCalendarAlt, label: 'Appointments' },
        { path: '/admin/users', icon: FaUsers, label: 'Users' },
        { path: '/admin/prescriptions', icon: FaFilePrescription, label: 'Prescriptions' },
        { path: '/admin/tickets', icon: FaTicketAlt, label: 'Support' },
        { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
      ],
    },
    doctor: {
      title: 'Doctor Dashboard',
      color: 'from-emerald-800 to-emerald-700',
      links: [
        { path: '/doctor/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/doctor/appointments', icon: FaCalendarAlt, label: 'Appointments' },
        { path: '/doctor/prescriptions', icon: FaFilePrescription, label: 'Prescriptions' },
        { path: '/doctor/schedule', icon: FaClipboardList, label: 'Schedule' },
      ],
    },
    patient: {
      title: 'Patient Portal',
      color: 'from-blue-600 to-blue-500',
      links: [
        { path: '/user/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/user/doctors', icon: FaUserMd, label: 'Find Doctors' },
        { path: '/user/appointments', icon: FaCalendarAlt, label: 'Appointments' },
        { path: '/user/prescriptions', icon: FaFilePrescription, label: 'Prescriptions' },
        { path: '/user/tickets', icon: FaTicketAlt, label: 'My Tickets' },
        { path: '/user/payments', icon: FaMoneyBillWave, label: 'Payments' },
      ],
    },
  };

  const currentConfig = roleConfig[user?.role as keyof typeof roleConfig];

  if (!currentConfig) return null;

  return (
    <aside 
      className={`
        ${showExpanded ? 'w-72' : 'w-20'} 
        min-h-screen bg-gradient-to-b ${currentConfig.color} 
        text-white shadow-2xl transition-all duration-300 ease-in-out
        relative z-10
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!showExpanded && 'justify-center'}`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl font-bold">M</span>
            </div>
            {showExpanded && (
              <div>
                <h1 className="text-2xl font-bold">Medi-Track</h1>
                <p className="text-xs text-blue-100 opacity-75">{currentConfig.title}</p>
              </div>
            )}
          </div>
          {onToggleCollapse && showExpanded && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle sidebar"
            >
              <FaBars className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      {showExpanded && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <FaUserCircle className="w-10 h-10 text-white/80" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {user?.first_name || 'User'}
              </p>
              <p className="text-xs text-blue-100 capitalize">
                {user?.role}
              </p>
            </div>
            <FaBell className="w-4 h-4 text-blue-200 opacity-75" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {currentConfig.links.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={linkClass(path)}
              title={!showExpanded ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {showExpanded && (
                <span className="font-medium truncate">{label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {!showExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {label}
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="space-y-2">
          <Link
            to="/settings"
            className={linkClass('/settings')}
            title={!showExpanded ? 'Settings' : undefined}
          >
            <FaCog className="w-5 h-5 flex-shrink-0" />
            {showExpanded && <span className="font-medium">Settings</span>}
          </Link>
          
          <button
            onClick={() => {/* Handle logout */}}
            className={`
              w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl 
              transition-all duration-200 ease-in-out cursor-pointer
              text-blue-100 hover:bg-red-500/20 hover:text-white hover:shadow-md
              ${isCollapsed && !isHovered ? 'justify-center' : ''}
            `}
            title={!showExpanded ? 'Sign Out' : undefined}
          >
            <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
            {showExpanded && <span className="font-medium">Sign Out</span>}
            
            {/* Tooltip for collapsed state */}
            {!showExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;