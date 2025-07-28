import { useState, useMemo } from 'react';
import { useGetAllComplaintsQuery, useUpdateComplaintMutation } from '../api/complaintsApi';
import type { Complaint } from '../api/complaintsApi';
import { FaSearch, FaFilter, FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle, FaUser, FaCalendar, FaUserMd, FaPlay, FaCheck, FaTimes, FaEye, FaChevronDown} from 'react-icons/fa';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';

const AdminTickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: complaintsData, isLoading, error, refetch } = useGetAllComplaintsQuery();
  const [updateComplaint, { isLoading: isUpdating }] = useUpdateComplaintMutation();
  console.log(complaintsData)

  const complaints = useMemo(() => {
    if (!complaintsData) return [];
    if (Array.isArray(complaintsData)) return complaintsData;
    if (complaintsData.data && Array.isArray(complaintsData.data)) return complaintsData.data;
    if (complaintsData.complaints && Array.isArray(complaintsData.complaints)) return complaintsData.complaints;
    return [];
  }, [complaintsData]);

  const filteredComplaints = useMemo(() => {
    if (!complaintsData) return [];
    return complaintsData.filter((complaint) => {
      const doctor = complaint.doctors || complaint.doctors;
      const matchesSearch =
        complaint.complaints.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaints.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaints.compId?.toString().includes(searchTerm) ||
        doctor?.fName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.lName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || complaint.complaints.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status?.toLowerCase() === 'pending').length;
    const inProgress = complaints.filter((c) => c.status?.toLowerCase() === 'in progress').length;
    const resolved = complaints.filter((c) => c.status?.toLowerCase() === 'resolved').length;
    const closed = complaints.filter((c) => c.status?.toLowerCase() === 'closed').length;
    return { total, pending, inProgress, resolved, closed };
  }, [complaints]);

  const handleStatusUpdate = async (complaintId: number, newStatus: string) => {
    try {
      await updateComplaint({ id: complaintId, data: { status: newStatus } }).unwrap();
      refetch();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Failed to update complaint status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200';
      case 'in progress': return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200';
      case 'closed': return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200';
      default: return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <FaClock className="text-amber-500" />;
      case 'in progress': return <FaPlay className="text-blue-500" />;
      case 'resolved': return <FaCheckCircle className="text-emerald-500" />;
      case 'closed': return <FaTimesCircle className="text-gray-500" />;
      default: return <FaTicketAlt className="text-gray-500" />;
    }
  };

  const getNextStatusActions = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return [
          { status: 'In Progress', icon: FaPlay, color: 'bg-blue-600 hover:bg-blue-700 text-white', label: 'Start Progress' },
          { status: 'Resolved', icon: FaCheck, color: 'bg-emerald-600 hover:bg-emerald-700 text-white', label: 'Mark Resolved' },
          { status: 'Closed', icon: FaTimes, color: 'bg-red-600 hover:bg-red-700 text-white', label: 'Close', needsConfirm: true },
        ];
      case 'in progress':
        return [
          { status: 'Resolved', icon: FaCheck, color: 'bg-emerald-600 hover:bg-emerald-700 text-white', label: 'Mark Resolved' },
          { status: 'Closed', icon: FaTimes, color: 'bg-red-600 hover:bg-red-700 text-white', label: 'Close', needsConfirm: true },
        ];
      case 'resolved':
        return [
          { status: 'In Progress', icon: FaPlay, color: 'bg-blue-600 hover:bg-blue-700 text-white', label: 'Reopen' },
          { status: 'Closed', icon: FaTimes, color: 'bg-red-600 hover:bg-red-700 text-white', label: 'Close', needsConfirm: true },
        ];
      default:
        return [];
    }
  };

  const ComplaintDetailsModal = ({ complaint }: { complaint: Complaint }) => {
    const doctor = complaint.appointments?.DoctorsTable || complaint.doctors || complaint.doctors;
    const doctorName = doctor 
      ? `${doctor.fName || doctor.firstName || ''} ${doctor.lName || doctor.lastName || ''}`.trim()
      : 'Not assigned';

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaTicketAlt className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Complaint #{complaint.complaints.compId}</h2>
                  <p className="text-blue-100 text-sm">Complaint Details & Management</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Status Section */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                {getStatusIcon(complaint.complaints.status)}
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Status</p>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(complaint.status)}`}>
                    {complaint.complaints.status}
                  </span>
                </div>
              </div>
              {complaint.updatedOn && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm text-gray-500">{new Date(complaint.updatedOn).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Doctor Information */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <FaUserMd className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Associated Doctor</h3>
                    <p className="text-sm text-blue-600">Primary care provider</p>
                  </div>
                </div>
                {doctor ? (
                  <div className="space-y-3">
                    <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg">
                      <p className="font-semibold text-gray-800 text-lg">{doctorName}</p>
                    </div>
                    {doctor.email && (
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <span className="font-medium">Email:</span>
                        <span className="bg-white/50 px-2 py-1 rounded">{doctor.email}</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <span className="font-medium">Phone:</span>
                        <span className="bg-white/50 px-2 py-1 rounded">{doctor.phone}</span>
                      </div>
                    )}
                    {doctor.specialization && (
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <span className="font-medium">Specialization:</span>
                        <span className="bg-white/50 px-2 py-1 rounded">{doctor.specialization}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaUser className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-600 italic">No doctor assigned</p>
                  </div>
                )}
              </div>

              {/* Appointment Information */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <FaCalendar className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900">Appointment Details</h3>
                    <p className="text-sm text-emerald-600">Related appointment info</p>
                  </div>
                </div>
                {complaint.appointments ? (
                  <div className="space-y-3">
                    {complaint.appointments.apDate && (
                      <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <span className="font-medium">Date:</span>
                        <span className="bg-white/50 px-2 py-1 rounded">
                          {new Date(complaint.appointments.apDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {complaint.appointments.startTime && (
                      <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <span className="font-medium">Time:</span>
                        <span className="bg-white/50 px-2 py-1 rounded">{complaint.appointments.startTime}</span>
                      </div>
                    )}
                    {complaint.appointments.apId && (
                      <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <span className="font-medium">ID:</span>
                        <span className="bg-white/50 px-2 py-1 rounded">#{complaint.appointments.apId}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaCalendar className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-gray-600 italic">No appointment linked</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subject & Description */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <div className="p-1 bg-amber-600 text-white rounded">
                    <FaTicketAlt className="text-sm" />
                  </div>
                  Subject
                </h3>
                <p className="text-gray-800 font-medium text-lg bg-white/70 p-3 rounded-lg">
                  {complaint.complaints.subject}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
                <h3 className="font-bold text-purple-900 mb-3">Description</h3>
                <div className="text-gray-800 bg-white/70 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                  {complaint.complaints.description}
                </div>
              </div>
            </div>

            {/* Timestamps */}
            {complaint.createdOn && (
              <div className="flex items-center justify-center gap-6 p-4 bg-gray-50 rounded-xl border">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(complaint.createdOn).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(complaint.createdOn).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {complaint.status?.toLowerCase() !== 'closed' && (
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-white p-6 border-t rounded-b-2xl">
              <div className="flex justify-end items-center gap-3">
                <p className="text-sm text-gray-600 mr-4">Update Status:</p>
                {getNextStatusActions(complaint.complaints.status).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.status}
                      onClick={() => {
                        if (action.needsConfirm) {
                          const confirmed = window.confirm('Are you sure you want to close this complaint?');
                          if (!confirmed) return;
                        }
                        handleStatusUpdate(complaint.complaints.compId, action.status);
                      }}
                      disabled={isUpdating}
                      className={`px-6 py-3 rounded-xl ${action.color} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg`}
                    >
                      <Icon size={16} /> 
                      {isUpdating ? 'Updating...' : action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <div className="p-4 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg font-medium text-gray-600">Loading complaints...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <div className="p-4 flex items-center justify-center min-h-96">
            <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
              <FaTimesCircle className="mx-auto text-4xl text-red-500 mb-4" />
              <div className="text-lg font-medium text-red-700">Error loading complaints</div>
              <p className="text-red-600 mt-2">Please refresh the page or try again later</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl">
                <FaTicketAlt className="text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Complaint Management</h1>
                <p className="text-gray-600 text-lg">Track and resolve customer complaints efficiently</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FaTicketAlt className="text-xl text-gray-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 uppercase tracking-wide">Pending</p>
                  <p className="text-3xl font-bold text-amber-700 mt-1">{stats.pending}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <FaClock className="text-xl text-amber-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">In Progress</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FaPlay className="text-xl text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-lg border border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 uppercase tracking-wide">Resolved</p>
                  <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.resolved}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <FaCheckCircle className="text-xl text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Closed</p>
                  <p className="text-3xl font-bold text-gray-700 mt-1">{stats.closed}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FaTimesCircle className="text-xl text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search by ID, subject, description, or doctor name..." 
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaFilter className="text-gray-400 text-lg" />
                <div className="relative">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="appearance-none px-6 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-lg font-medium bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Complaints Cards */}
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                <FaSearch className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No complaints found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredComplaints.map((complaint) => {
                const doctor = complaint.doctors || complaint.doctors || complaint.doctors;
                const doctorName = doctor 
                  ? `${doctor.fName || doctor.firstName || ''} ${doctor.lName || doctor.lastName || ''}`.trim()
                  : 'Not assigned';

                return (
                  <div key={complaint.compId} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Left side - Main info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FaTicketAlt className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">#{complaint.complaints.compId}</h3>
                              <p className="text-sm text-gray-500">
                                {complaint.complaints.createdOn ? new Date(complaint.complaints.createdOn).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg mb-1">{complaint.complaints.subject}</h4>
                            <p className="text-gray-600 line-clamp-2">{complaint.complaints.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaUserMd className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">{doctorName}</span>
                          </div>
                        </div>

                        {/* Right side - Status and action */}
                        <div className="flex flex-col items-end gap-3 lg:min-w-[200px]">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(complaint.status)}
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(complaint.complaints.status)}`}>
                              {complaint.complaints.status}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowDetailsModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg"
                          >
                            <FaEye size={16} />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <ComplaintDetailsModal complaint={selectedComplaint} />
      )}
    </div>
  );
};

export default AdminTickets;