import { useGetAllAppointmentsQuery } from '../../dash/api/appointmentsApi';
import type { Appointment } from '../../dash/api/appointmentsApi';
import { useState, useMemo } from 'react';
import { FaEye, FaTrashAlt, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaUserMd } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

const ViewAppointmentsPage = () => {
  const { data: appointments = [], isLoading, error } = useGetAllAppointmentsQuery();
  const [viewedAppointment, setViewedAppointment] = useState<Appointment | null>(null);

  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [appointmentIdFilter, setAppointmentIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [sortField, setSortField] = useState<string>('apDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const clearFilters = () => {
    setPatientFilter('');
    setDoctorFilter('');
    setAppointmentIdFilter('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setDateFilter('');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = appointments.filter((appt: Appointment) => {
      const fullPatientName = `${appt.users?.fName || ''} ${appt.users?.lName || ''}`.toLowerCase();
      const fullDoctorName = `${appt.doctors?.fName || ''} ${appt.doctors?.lName || ''}`.toLowerCase();

      return (
        fullPatientName.includes(patientFilter.toLowerCase()) &&
        fullDoctorName.includes(doctorFilter.toLowerCase()) &&
        (appointmentIdFilter === '' || appt.appointments.apId.toString().includes(appointmentIdFilter)) &&
        (statusFilter === 'all' || appt.appointments.apStatus === statusFilter) &&
        (paymentFilter === 'all' || appt.payments?.payStatus === paymentFilter) &&
        (dateFilter === '' || appt.appointments.apDate.includes(dateFilter))
      );
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'apDate':
          aValue = new Date(a.appointments.apDate);
          bValue = new Date(b.appointments.apDate);
          break;
        case 'patient':
          aValue = `${a.users?.fName || ''} ${a.users?.lName || ''}`;
          bValue = `${b.users?.fName || ''} ${b.users?.lName || ''}`;
          break;
        case 'doctor':
          aValue = `${a.doctors?.fName || ''} ${a.doctors?.lName || ''}`;
          bValue = `${b.doctors?.fName || ''} ${b.doctors?.lName || ''}`;
          break;
        case 'status':
          aValue = a.appointments.apStatus;
          bValue = b.appointments.apStatus;
          break;
        default:
          aValue = a.appointments.apId;
          bValue = b.appointments.apId;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [appointments, patientFilter, doctorFilter, appointmentIdFilter, statusFilter, paymentFilter, dateFilter, sortField, sortOrder]);

  const appointmentStats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((appt: Appointment) => appt.appointments.apStatus === 'pending').length;
    const confirmed = appointments.filter((appt: Appointment) => appt.appointments.apStatus === 'confirmed').length;
    const cancelled = appointments.filter((appt: Appointment) => appt.appointments.apStatus === 'cancelled').length;

    return { total, pending, confirmed, cancelled };
  }, [appointments]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <p className="text-lg font-semibold">Loading appointments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="alert alert-error max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error loading appointments. Please try again.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />

        <div className="p-4 sm:p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <div>
              <h2 className="text-3xl font-bold mb-2">Appointments Overview</h2>
              <p className="text-base-content/70">Manage and view all appointments</p>
            </div>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-primary">
                <FaCalendarAlt className="text-2xl" />
              </div>
              <div className="stat-title">Total</div>
              <div className="stat-value text-primary">{appointmentStats.total}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-warning">
                <FaUser className="text-2xl" />
              </div>
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">{appointmentStats.pending}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-success">
                <FaUserMd className="text-2xl" />
              </div>
              <div className="stat-title">Confirmed</div>
              <div className="stat-value text-success">{appointmentStats.confirmed}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-error">
                <FaTrashAlt className="text-2xl" />
              </div>
              <div className="stat-title">Cancelled</div>
              <div className="stat-value text-error">{appointmentStats.cancelled}</div>
            </div>
          </div>

          {showFilters && (
            <div className="card bg-base-100 shadow-lg mb-6">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title">
                    <FaSearch className="mr-2" />
                    Filters
                  </h3>
                  <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input className="input input-bordered input-sm" placeholder="Patient Name" value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)} />
                  <input className="input input-bordered input-sm" placeholder="Doctor Name" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} />
                  <input className="input input-bordered input-sm" placeholder="Appointment ID" value={appointmentIdFilter} onChange={(e) => setAppointmentIdFilter(e.target.value)} />
                  <input type="date" className="input input-bordered input-sm" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                  <select className="select select-bordered select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select className="select select-bordered select-sm" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-base-content/70 mb-2">
            Showing {filteredAndSortedAppointments.length} of {appointments.length} appointments
          </p>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-0">
              <div className="w-full overflow-x-auto">
                <table className="table table-zebra w-full min-w-[900px]">
                  <thead className="bg-base-200">
                    <tr>
                      <th onClick={() => handleSort('apId')} className="cursor-pointer">ID</th>
                      <th onClick={() => handleSort('apDate')} className="cursor-pointer">Date</th>
                      <th>Time</th>
                      <th onClick={() => handleSort('patient')} className="cursor-pointer">Patient</th>
                      <th onClick={() => handleSort('doctor')} className="cursor-pointer">Doctor</th>
                      <th onClick={() => handleSort('status')} className="cursor-pointer">Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedAppointments.map((appt) => (
                      <tr key={appt.apId}>
                        <td>{appt.appointments.apId}</td>
                        <td>{new Date(appt.appointments.apDate).toLocaleDateString()}</td>
                        <td>{appt.appointments.startTime} - {appt.endTime}</td>
                        <td>{appt.users?.fName} {appt.users?.lName}</td>
                        <td>{appt.doctors?.fName} {appt.doctors?.lName}</td>
                        <td>
                          <span className={`badge badge-sm ${
                            appt.appointments.apStatus === 'cancelled'
                              ? 'badge-error'
                              : appt.appointments.apStatus === 'confirmed'
                                ? 'badge-success'
                                : 'badge-warning'
                          }`}>{appt.appointments.apStatus}</span>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${
                            appt.payments?.payStatus === 'paid'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}>{appt.payments?.payStatus || 'unpaid'}</span>
                        </td>
                        <td>
                          <button className="btn btn-xs btn-outline btn-info" onClick={() => setViewedAppointment(appt)}>
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredAndSortedAppointments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center text-base-content/50 py-8">
                          <div className="flex flex-col items-center gap-2">
                            <FaSearch className="text-4xl opacity-50" />
                            <p className="text-lg">No appointments match your filters</p>
                            <button className="btn btn-sm btn-outline" onClick={clearFilters}>
                              Clear Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewedAppointment && (
        <dialog className="modal modal-open">
          <div className="modal-box w-full max-w-3xl sm:w-11/12">
            <h3 className="font-bold text-xl mb-4 flex items-center">
              <FaEye className="mr-2" /> Appointment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold border-b pb-2">Appointment Info</h4>
                <p>ID: {viewedAppointment.appointments.apId}</p>
                <p>Date: {new Date(viewedAppointment.appointments.apDate).toLocaleDateString()}</p>
                <p>Time: {viewedAppointment.appointments.startTime} - {viewedAppointment.endTime}</p>
              </div>
              <div>
                <h4 className="font-semibold border-b pb-2">Payment</h4>
                <p>Status: {viewedAppointment.payments?.payStatus || 'unpaid'}</p>
              </div>
              <div>
                <h4 className="font-semibold border-b pb-2">Patient</h4>
                <p>{viewedAppointment.users?.fName} {viewedAppointment.users?.lName}</p>
                <p>{viewedAppointment.users?.email}</p>
              </div>
              <div>
                <h4 className="font-semibold border-b pb-2">Doctor</h4>
                <p>{viewedAppointment.doctors?.fName} {viewedAppointment.doctors?.lName}</p>
                <p>{viewedAppointment.doctors?.specialization}</p>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => setViewedAppointment(null)}>Close</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setViewedAppointment(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default ViewAppointmentsPage;
