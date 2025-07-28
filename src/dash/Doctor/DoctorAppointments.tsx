import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../features/store';
import {
  useGetDoctorAppointmentsQuery,
  useConfirmAppointmentMutation,
} from '../api/appointmentsApi';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaMoneyBill,
  FaSpinner,
  FaExclamationCircle,
  FaCheck,
  FaFilter,
  FaTimes,
} from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import toast from 'react-hot-toast';
import { useGetDoctorByUserIdQuery } from '../api/doctorsApi';

const DoctorAppointments = () => {
  const user = useSelector((state: RootState) => state.user?.user);
  const docId = user?.user_id;
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    data: doctorData,
    // isLoading: isDoctorLoading,
    // isError: isDoctorError,
    // error: doctorError,
  } = useGetDoctorByUserIdQuery(docId!, {
    skip: !docId,
  });

  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
  } = useGetDoctorAppointmentsQuery(doctorData?.docId!, {
    skip: !doctorData?.docId,
  });

  const [confirmAppointment] = useConfirmAppointmentMutation();

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load appointments.');
      console.error(error);
    }
  }, [isError, error]);

  const handleConfirm = async (apId: number) => {
    try {
      await confirmAppointment(apId).unwrap();
      toast.success('Appointment confirmed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to confirm appointment.');
    }
  };

  // Filter appointments based on status
  const filteredAppointments = appointments.filter((appt: any) => {
    if (statusFilter === 'all') return true;
    return (appt.appointments.apStatus || 'pending') === statusFilter;
  });

  // Get unique statuses for filter options
  const availableStatuses = ['all', ...new Set(appointments.map((appt: any) => appt.appointments.apStatus || 'pending'))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
              <p className="text-gray-600">Manage and track your patient appointments</p>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-700">
                  <FaFilter className="mr-2 text-blue-600" />
                  <span className="font-medium">Filter by Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        statusFilter === status
                          ? 'bg-blue-600 text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                      }`}
                    >
                      {status === 'all' ? 'All Appointments' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Clear filter"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-500">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                  <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                  <span className="text-lg text-gray-600">Loading appointments...</span>
                </div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <FaExclamationCircle className="mx-auto text-5xl mb-6 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'No Appointments Found' : `No ${statusFilter} Appointments`}
                </h3>
                <p className="text-gray-500">
                  {statusFilter === 'all' 
                    ? 'You don\'t have any appointments yet.' 
                    : `You don't have any ${statusFilter} appointments.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAppointments.map((appt: any) => (
                  <div
                    key={appt.appointments.apId}
                    className={`bg-white rounded-2xl shadow-sm border-2 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${getStatusColor(appt.appointments.apStatus || 'pending')}`}
                  >
                    {/* Patient Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          {appt.users?.fName} {appt.users?.lName}
                        </h2>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(appt.appointments.apStatus || 'pending')}`}>
                          {(appt.appointments.apStatus || 'pending').charAt(0).toUpperCase() + (appt.appointments.apStatus || 'pending').slice(1)}
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center text-gray-700">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FaCalendarAlt className="text-blue-600 text-sm" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="font-semibold">{appt.appointments.apDate}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <FaClock className="text-purple-600 text-sm" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Time</div>
                          <div className="font-semibold">
                            {appt.appointments.startTime} - {appt.appointments.endTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <FaUser className="text-green-600 text-sm" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Patient ID</div>
                          <div className="font-semibold">{appt.appointments.userId}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                          <FaMoneyBill className="text-yellow-600 text-sm" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Consultation Fee</div>
                          <div className="font-bold text-lg text-green-600">${appt.appointments.amount}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {appt.appointments.apStatus === 'pending' && (
                      <button
                        onClick={() => handleConfirm(appt.appointments.apId)}
                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <FaCheck className="mr-2" />
                        Confirm Appointment
                      </button>
                    )}
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

export default DoctorAppointments;