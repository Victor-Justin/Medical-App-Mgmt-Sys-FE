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
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
} from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import toast from 'react-hot-toast';
import { useGetDoctorByUserIdQuery } from '../api/doctorsApi';

const DoctorScheduleCalendar = () => {
  const user = useSelector((state: RootState) => state.user?.user);
  const docId = user?.user_id;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    data: doctorData,
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

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: string) => {
    return appointments.filter((appt: any) => appt.appointments.apDate === date);
  };

  // Get appointments for selected date with status filter
  const getSelectedDateAppointments = () => {
    if (!selectedDate) return [];
    const dateAppointments = getAppointmentsForDate(selectedDate);
    if (statusFilter === 'all') return dateAppointments;
    return dateAppointments.filter((appt: any) => 
      (appt.appointments.apStatus || 'pending') === statusFilter
    );
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const appointmentsCount = getAppointmentsForDate(dateStr).length;
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      
      days.push({
        date: new Date(currentDate),
        dateStr,
        appointmentsCount,
        isCurrentMonth,
        isToday,
        isSelected,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Get available statuses for filter
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 flex justify-center items-center">
            <div className="text-center">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <span className="text-lg text-gray-600">Loading schedule...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Schedule</h1>
              <p className="text-gray-600">View your appointments calendar and manage your schedule</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FaChevronLeft className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FaChevronRight className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`
                          relative p-3 h-16 text-sm transition-all duration-200 rounded-lg
                          ${day.isCurrentMonth 
                            ? day.isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : day.isToday
                                ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                                : day.appointmentsCount > 0
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                  : 'hover:bg-gray-50 text-gray-900'
                            : 'text-gray-400 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="font-medium">{day.date.getDate()}</div>
                        {day.appointmentsCount > 0 && (
                          <div className={`
                            absolute bottom-1 right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center
                            ${day.isSelected 
                              ? 'bg-white text-blue-600' 
                              : 'bg-blue-600 text-white'
                            }
                          `}>
                            {day.appointmentsCount}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Date Details */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  {selectedDate ? (
                    <>
                      {/* Selected Date Header */}
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <FaCalendarDay className="text-blue-600 text-lg" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getAppointmentsForDate(selectedDate).length} appointments
                          </p>
                        </div>
                      </div>

                      {/* Filter for selected date */}
                      {getAppointmentsForDate(selectedDate).length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FaFilter className="text-blue-600 text-sm" />
                            <span className="text-sm font-medium text-gray-700">Filter:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {availableStatuses.map((status) => (
                              <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                  statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Appointments List */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {getSelectedDateAppointments().length === 0 ? (
                          <div className="text-center py-8">
                            <FaExclamationCircle className="mx-auto text-3xl mb-3 text-gray-300" />
                            <p className="text-gray-500 text-sm">
                              {getAppointmentsForDate(selectedDate).length === 0 
                                ? 'No appointments on this date'
                                : `No ${statusFilter} appointments`}
                            </p>
                          </div>
                        ) : (
                          getSelectedDateAppointments().map((appt: any) => (
                            <div
                              key={appt.appointments.apId}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 ${getStatusColor(appt.appointments.apStatus || 'pending')}`}
                            >
                              {/* Patient Info */}
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {appt.users?.fName} {appt.users?.lName}
                                </h4>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(appt.appointments.apStatus || 'pending')}`}>
                                  {(appt.appointments.apStatus || 'pending').charAt(0).toUpperCase() + (appt.appointments.apStatus || 'pending').slice(1)}
                                </div>
                              </div>

                              {/* Time and Details */}
                              <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <FaClock className="mr-2 text-purple-600" />
                                  <span>{appt.appointments.startTime} - {appt.appointments.endTime}</span>
                                </div>
                                <div className="flex items-center">
                                  <FaUser className="mr-2 text-green-600" />
                                  <span>ID: {appt.appointments.userId}</span>
                                </div>
                                <div className="flex items-center">
                                  <FaMoneyBill className="mr-2 text-yellow-600" />
                                  <span className="font-semibold text-green-600">${appt.appointments.amount}</span>
                                </div>
                              </div>

                              {/* Confirm Button */}
                              {appt.appointments.apStatus === 'pending' && (
                                <button
                                  onClick={() => handleConfirm(appt.appointments.apId)}
                                  className="w-full mt-3 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-xs"
                                >
                                  <FaCheck className="mr-1" />
                                  Confirm
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FaCalendarAlt className="mx-auto text-4xl mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Date</h3>
                      <p className="text-gray-500 text-sm">
                        Click on any date in the calendar to view appointments for that day
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorScheduleCalendar;