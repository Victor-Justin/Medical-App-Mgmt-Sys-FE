import { useSelector } from 'react-redux';
import { type RootState } from '../../features/store';
import { useGetPrescriptionsByUserIdQuery } from '../../dash/api/prescriptionApi';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import {
  FaUserMd,
  FaFilePrescription,
  FaSearch,
  FaFilter,
  FaLink,
  FaCalendarAlt,
  FaTimesCircle,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

type SortOption = 'newest' | 'oldest' | 'doctor' | 'specialization';
type StatusFilter = 'all' | 'active' | 'completed' | 'expired';

const MyPrescriptionsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const userId = user?.user?.user_id;

  const { data: prescriptions = [], isLoading, error } = useGetPrescriptionsByUserIdQuery(userId!, {
    skip: userId === undefined,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock function to determine prescription status
  const getPrescriptionStatus = (prescription: any) => {
    const createdDate = new Date(prescription.prescriptions.createdOn);
    const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated > 30) return 'expired';
    if (daysSinceCreated > 7) return 'completed';
    return 'active';
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-600 bg-green-50 border-green-200', icon: FaCheckCircle, label: 'Active' };
      case 'completed':
        return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: FaClock, label: 'Completed' };
      case 'expired':
        return { color: 'text-red-600 bg-red-50 border-red-200', icon: FaExclamationTriangle, label: 'Expired' };
      default:
        return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: FaClock, label: 'Unknown' };
    }
  };

  const filteredAndSortedPrescriptions = useMemo(() => {
    let filtered = prescriptions.filter((presc) => {
      const doctorName = `${presc.doctors?.fName ?? ''} ${presc.doctors?.lName ?? ''}`.toLowerCase();
      const notesMatch = presc.prescriptions.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const doctorMatch = doctorName.includes(searchTerm.toLowerCase());
      const specializationMatch = specializationFilter
        ? presc.doctors?.specialization === specializationFilter
        : true;
      
      const status = getPrescriptionStatus(presc);
      const statusMatch = statusFilter === 'all' || status === statusFilter;

      return (notesMatch || doctorMatch) && specializationMatch && statusMatch;
    });

    // Sort prescriptions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.prescriptions.createdOn).getTime() - new Date(a.prescriptions.createdOn).getTime();
        case 'oldest':
          return new Date(a.prescriptions.createdOn).getTime() - new Date(b.prescriptions.createdOn).getTime();
        case 'doctor':
          const doctorA = `${a.doctors?.fName ?? ''} ${a.doctors?.lName ?? ''}`;
          const doctorB = `${b.doctors?.fName ?? ''} ${b.doctors?.lName ?? ''}`;
          return doctorA.localeCompare(doctorB);
        case 'specialization':
          return (a.doctors?.specialization ?? '').localeCompare(b.doctors?.specialization ?? '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [prescriptions, searchTerm, specializationFilter, statusFilter, sortBy]);

  const specializations = Array.from(
    new Set(prescriptions.map((p) => p.doctors?.specialization).filter(Boolean))
  );

  const clearFilters = () => {
    setSearchTerm('');
    setSpecializationFilter('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || specializationFilter || statusFilter !== 'all' || sortBy !== 'newest';



  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-gray-50">
          <Topbar />
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaFilePrescription className="text-blue-600" />
                </div>
                My Prescriptions
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filteredAndSortedPrescriptions.length} of {prescriptions.length} prescriptions
                </span>
              </div>
            </div>
            <p className="text-gray-600">
              View and manage all your medical prescriptions in one place
            </p>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by doctor name or prescription notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Specialization Filter */}
              <div className="min-w-[200px]">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px]">
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Sort and View Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="doctor">Doctor Name</option>
                    <option value="specialization">Specialization</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 text-sm ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 text-sm ${
                        viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FaTimesCircle />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <FaExclamationTriangle className="text-red-500 text-4xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load prescriptions</h3>
              <p className="text-red-600">Please try refreshing the page or contact support if the problem persists.</p>
            </div>
          ) : filteredAndSortedPrescriptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FaFilePrescription className="text-gray-300 text-6xl mb-6 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No prescriptions found</h3>
              <p className="text-gray-600 mb-6">
                {prescriptions.length === 0 
                  ? "You don't have any prescriptions yet." 
                  : "No prescriptions match your current filters."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaTimesCircle />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredAndSortedPrescriptions.map((presc) => {
                const status = getPrescriptionStatus(presc);
                const statusInfo = getStatusInfo(status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={presc.prescriptions.prescId}
                    className={`bg-white shadow-sm hover:shadow-md rounded-xl transition-all duration-200 border-l-4 border-blue-500 ${
                      viewMode === 'list' ? 'p-4' : 'p-6'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          Prescription #{presc.prescriptions.prescId}
                        </h2>
                        <div className="flex items-center gap-2 mb-2">
                          <FaCalendarAlt className="text-gray-400 text-sm" />
                          <span className="text-sm text-gray-600">
                            {new Date(presc.prescriptions.createdOn).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Notes:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                        {presc.prescriptions.notes || 'No notes provided'}
                      </p>
                    </div>

                    {presc.doctors && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                          <FaUserMd />
                          Prescribed by:
                        </h3>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            Dr. {presc.doctors.fName} {presc.doctors.lName}
                          </p>
                          <p className="text-sm text-blue-700 font-medium">
                            {presc.doctors.specialization}
                          </p>
                          <p className="text-xs text-gray-600">
                            {presc.doctors.email}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {presc.appointments?.apId && (
                        <Link
                          to={`/appointments/${presc.appointments.apId}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          <FaLink />
                          View Appointment
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPrescriptionsPage;