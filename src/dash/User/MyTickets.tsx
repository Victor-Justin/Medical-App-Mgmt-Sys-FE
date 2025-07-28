import { useSelector } from 'react-redux';
import { useState } from 'react';
import { type RootState } from '../../features/store';
import { useGetUserComplaintsQuery } from '../../dash/api/complaintsApi';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { 
  FaTicketAlt, 
  FaFilter, 
  FaSearch, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf,
  FaCalendarAlt,
  FaUserMd,
  FaExclamationTriangle,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';

const MyTickets = () => {
  const userId = useSelector((state: RootState) => state.user?.user?.user_id);
  const { data: complaints = [], isLoading, isError} = useGetUserComplaintsQuery(userId!, {
    skip: !userId,
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'subject'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const getStatusBadge = (status: string) => {
    const base = 'inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide';
    switch (status) {
      case 'In Progress':
        return `${base} bg-amber-100 text-amber-800 border border-amber-200`;
      case 'Resolved':
        return `${base} bg-emerald-100 text-emerald-800 border border-emerald-200`;
      case 'Closed':
        return `${base} bg-slate-100 text-slate-700 border border-slate-200`;
      default:
        return `${base} bg-red-100 text-red-800 border border-red-200`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <FaHourglassHalf className="w-3 h-3 mr-1" />;
      case 'Resolved':
        return <FaCheckCircle className="w-3 h-3 mr-1" />;
      case 'Closed':
        return <FaTimesCircle className="w-3 h-3 mr-1" />;
      default:
        return <FaClock className="w-3 h-3 mr-1" />;
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return complaints.length;
    return complaints.filter(comp => comp.complaints.status === status).length;
  };

  const handleSort = (field: 'date' | 'status' | 'subject') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: 'date' | 'status' | 'subject') => {
    if (sortBy !== field) return <FaSort className="w-3 h-3 opacity-40" />;
    return sortOrder === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />;
  };

  let filteredComplaints = statusFilter === 'all'
    ? complaints
    : complaints.filter((comp) => comp.complaints.status === statusFilter);

  // Apply search filter
  if (searchTerm) {
    filteredComplaints = filteredComplaints.filter((comp) =>
      comp.complaints.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.complaints.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.doctors && `${comp.doctors.fName} ${comp.doctors.lName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Apply sorting
  filteredComplaints = [...filteredComplaints].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'date':
        aVal = new Date(a.complaints.createdOn).getTime();
        bVal = new Date(b.complaints.createdOn).getTime();
        break;
      case 'status':
        aVal = a.complaints.status;
        bVal = b.complaints.status;
        break;
      case 'subject':
        aVal = a.complaints.subject.toLowerCase();
        bVal = b.complaints.subject.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const statusOptions = [
    { value: 'all', label: 'All Tickets', count: getStatusCount('all') },
    { value: 'In Progress', label: 'In Progress', count: getStatusCount('In Progress') },
    { value: 'Resolved', label: 'Resolved', count: getStatusCount('Resolved') },
    { value: 'Closed', label: 'Closed', count: getStatusCount('Closed') },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FaTicketAlt className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Track and manage your appointment complaints and feedback
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {statusOptions.map((option) => (
                  <div 
                    key={option.value}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      statusFilter === option.value 
                        ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{option.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{option.count}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${
                        option.value === 'all' ? 'bg-gray-100' :
                        option.value === 'In Progress' ? 'bg-amber-100' :
                        option.value === 'Resolved' ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        {option.value === 'all' ? <FaTicketAlt className="w-4 h-4 text-gray-600" /> :
                         option.value === 'In Progress' ? <FaHourglassHalf className="w-4 h-4 text-amber-600" /> :
                         option.value === 'Resolved' ? <FaCheckCircle className="w-4 h-4 text-emerald-600" /> :
                         <FaTimesCircle className="w-4 h-4 text-slate-600" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tickets by subject, description, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  <FaCalendarAlt className="w-4 h-4" />
                  Date {getSortIcon('date')}
                </button>
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  <FaFilter className="w-4 h-4" />
                  Status {getSortIcon('status')}
                </button>
                <button
                  onClick={() => handleSort('subject')}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  Subject {getSortIcon('subject')}
                </button>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 text-lg">Loading your tickets...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                  <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 text-lg font-medium">Failed to load tickets</p>
                <p className="text-gray-500 text-sm mt-1">Please try refreshing the page</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <FaTicketAlt className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  {searchTerm ? 'No tickets match your search' : 
                   statusFilter !== 'all' ? `No ${statusFilter.toLowerCase()} tickets found` : 
                   'No tickets found'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Your tickets will appear here once you submit them'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredComplaints.map((comp) => (
                  <div
                    key={comp.complaints.compId}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                          {comp.complaints.subject}
                        </h3>
                        <span className={getStatusBadge(comp.complaints.status)}>
                          {getStatusIcon(comp.complaints.status)}
                          {comp.complaints.status}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {comp.complaints.description}
                      </p>

                      {/* Appointment Details */}
                      {comp.appointments && (
                        <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaUserMd className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              Dr. {comp.doctors?.fName} {comp.doctors?.lName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                            <span>
                              {formatDate(comp.appointments.apDate)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FaClock className="w-3 h-3" />
                          <span>Filed {formatRelativeDate(comp.complaints.createdOn)}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          #{comp.complaints.compId}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyTickets;