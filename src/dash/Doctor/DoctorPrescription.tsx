import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../features/store';
import { useGetDoctorByUserIdQuery } from '../api/doctorsApi';
import { useGetDoctorAppointmentsQuery } from '../api/appointmentsApi';
import { useCreatePrescriptionMutation, useGetPrescriptionsByDoctorIdQuery } from '../api/prescriptionApi';
import type { PrescriptionItem} from '../api/prescriptionApi';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import toast from 'react-hot-toast';
import { FaNotesMedical, FaUser, FaCalendarCheck, FaPlusCircle, FaSpinner, FaExclamationTriangle, FaSearch, FaFilter, FaTimes, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DoctorPrescriptionPage = () => {
  const user = useSelector((state: RootState) => state.user?.user);
  const userId = user?.user_id;

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  
  // Filter states
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [notesFilter, setNotesFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [prescriptionsPage, setPrescriptionsPage] = useState(1);
  const appointmentsPerPage = 5;
  const prescriptionsPerPage = 9;

  const {
    data: doctorData,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
    isSuccess: isDoctorSuccess,
    error: doctorError,
  } = useGetDoctorByUserIdQuery(userId!, {
    skip: !userId,
  });

  const doctorId = doctorData?.docId;

  const {
    data: appointments = [],
    isLoading: isAppointmentsLoading,
    isError: isAppointmentsError,
    error: appointmentsError,
  } = useGetDoctorAppointmentsQuery(doctorId!, {
    skip: !doctorId,
  });

  const {
    data: prescriptionsResponse,
    isLoading: isPrescriptionsLoading,
    isFetching: isPrescriptionsFetching,
    isError: isPrescriptionsError,
    error: prescriptionsError,
    refetch: refetchPrescriptions,
  } = useGetPrescriptionsByDoctorIdQuery(doctorId!, {
    skip: !doctorId,
  });

  // Handle different possible response structures
  let prescriptionsList: PrescriptionItem[] = [];
  
  if (prescriptionsResponse) {
    if (Array.isArray(prescriptionsResponse)) {
      prescriptionsList = prescriptionsResponse;
    } else if (prescriptionsResponse.prescriptions && Array.isArray(prescriptionsResponse.prescriptions)) {
      prescriptionsList = prescriptionsResponse.prescriptions;
    } else if (prescriptionsResponse.data && Array.isArray(prescriptionsResponse.data)) {
      prescriptionsList = prescriptionsResponse.data;
    } else {
      console.warn('Unexpected prescriptions response structure:', prescriptionsResponse);
    }
  }

  const [createPrescription, { isLoading: isCreatingPrescription }] = useCreatePrescriptionMutation();

  const confirmedAppointments = appointments.filter(
    (appt: any) => appt.appointments.apStatus === 'confirmed'
  );

  // Filtered prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptionsList.filter((presc: PrescriptionItem) => {
      const patientName = `${presc.users?.fName || ''} ${presc.users?.lName || ''}`.toLowerCase();
      const appointmentDate = presc.appointments?.apDate || '';
      const prescriptionNotes = presc.prescriptions.notes.toLowerCase();

      const matchesPatientName = patientNameFilter === '' || patientName.includes(patientNameFilter.toLowerCase());
      const matchesDate = dateFilter === '' || appointmentDate.includes(dateFilter);
      const matchesNotes = notesFilter === '' || prescriptionNotes.includes(notesFilter.toLowerCase());

      return matchesPatientName && matchesDate && matchesNotes;
    });
  }, [prescriptionsList, patientNameFilter, dateFilter, notesFilter]);

  // Pagination calculations
  const totalAppointmentsPages = Math.ceil(confirmedAppointments.length / appointmentsPerPage);
  const startAppointmentIndex = (appointmentsPage - 1) * appointmentsPerPage;
  const endAppointmentIndex = startAppointmentIndex + appointmentsPerPage;
  const paginatedAppointments = confirmedAppointments.slice(startAppointmentIndex, endAppointmentIndex);

  const totalPrescriptionsPages = Math.ceil(filteredPrescriptions.length / prescriptionsPerPage);
  const startPrescriptionIndex = (prescriptionsPage - 1) * prescriptionsPerPage;
  const endPrescriptionIndex = startPrescriptionIndex + prescriptionsPerPage;
  const paginatedPrescriptions = filteredPrescriptions.slice(startPrescriptionIndex, endPrescriptionIndex);

  const handleAppointmentClick = (appointment: any) => {
    const appointmentId = appointment.appointments.apId;
    const patientId = appointment.users.user_id || appointment.users.userId;
    
    setSelectedAppointmentId(appointmentId);
    setSelectedPatientId(patientId);
    
    // Scroll to prescription form
    const prescriptionForm = document.getElementById('prescription-form');
    if (prescriptionForm) {
      prescriptionForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const selectedId = Number(appointmentId);
    setSelectedAppointmentId(selectedId);
    
    // Find the selected appointment and extract patient ID
    const selectedAppointment = confirmedAppointments.find(
      (appt: any) => appt.appointments.apId === selectedId
    );
    
    if (selectedAppointment) {
      setSelectedPatientId(selectedAppointment.users.user_id || selectedAppointment.users.userId);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedAppointmentId) {
      toast.error('Please select an appointment.');
      return;
    }
    if (!selectedPatientId) {
      toast.error('Patient ID not found. Please reselect the appointment.');
      return;
    }
    if (!doctorId) {
      toast.error('Doctor ID not found. Please refresh the page.');
      return;
    }
    if (!notes.trim()) {
      toast.error('Please enter prescription notes.');
      return;
    }

    try {
      const prescriptionData = {
        apId: selectedAppointmentId,
        userId: selectedPatientId, // Include patient user ID
        docId: doctorId, // Include doctor ID
        notes: notes.trim()
      };

      console.log('Prescription data being sent:', prescriptionData);
      await createPrescription(prescriptionData).unwrap();
      toast.success('Prescription created successfully!');
      
      // Reset form
      setSelectedAppointmentId(null);
      setSelectedPatientId(null);
      setNotes('');
      
      // Refetch prescriptions
      refetchPrescriptions();
    } catch (error) {
      console.error('Failed to create prescription:', error);
      toast.error('Failed to create prescription. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedAppointmentId(null);
    setSelectedPatientId(null);
    setNotes('');
  };

  const clearFilters = () => {
    setPatientNameFilter('');
    setDateFilter('');
    setNotesFilter('');
    setPrescriptionsPage(1); // Reset to first page when clearing filters
  };

  const activeFiltersCount = [patientNameFilter, dateFilter, notesFilter].filter(Boolean).length;

  // Loading and error states
  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl mb-4 text-orange-500" />
          <p>User ID not available. Please ensure you are logged in.</p>
        </div>
      </div>
    );
  }

  if (isDoctorLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-4xl mb-4 text-blue-500" />
          <p>Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (isDoctorError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl mb-4" />
          <p>Error loading doctor profile: {doctorError ? (doctorError as any).message || JSON.stringify(doctorError) : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  if (isDoctorSuccess && !doctorId) {
    return (
      <div className="flex justify-center items-center min-h-screen text-orange-600">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl mb-4" />
          <p>No doctor profile found for your user ID. You may not have access to this page.</p>
        </div>
      </div>
    );
  }

  if (isAppointmentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin mx-auto text-4xl mb-4 text-blue-500" />
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (isAppointmentsError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl mb-4" />
          <p>Error loading appointments: {(appointmentsError as any)?.message || JSON.stringify(appointmentsError)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Issue Prescription</h1>
              <p className="text-gray-600">Create and manage patient prescriptions</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Appointments List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Confirmed Appointments</h2>
                    <p className="text-sm text-gray-600">Click an appointment to issue a prescription</p>
                    {confirmedAppointments.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Showing {startAppointmentIndex + 1}-{Math.min(endAppointmentIndex, confirmedAppointments.length)} of {confirmedAppointments.length}
                      </p>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {confirmedAppointments.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <FaCalendarCheck className="mx-auto text-3xl mb-3 text-gray-400" />
                        <p>No confirmed appointments</p>
                      </div>
                    ) : (
                      <>
                        <div className="divide-y divide-gray-100">
                          {paginatedAppointments.map((appt: any) => (
                            <div
                              key={appt.appointments.apId}
                              onClick={() => handleAppointmentClick(appt)}
                              className={`p-4 cursor-pointer transition-colors hover:bg-blue-50 ${
                                selectedAppointmentId === appt.appointments.apId 
                                  ? 'bg-blue-100 border-r-4 border-blue-500' 
                                  : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <FaUser className="text-blue-500 text-sm" />
                                <span className="font-medium text-gray-800">
                                  {appt.users.fName} {appt.users.lName}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <FaCalendarAlt className="text-green-500" />
                                <span>{appt.appointments.apDate}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Appointments Pagination */}
                        {totalAppointmentsPages > 1 && (
                          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                            <button
                              onClick={() => setAppointmentsPage(prev => Math.max(prev - 1, 1))}
                              disabled={appointmentsPage === 1}
                              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition ${
                                appointmentsPage === 1
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              <FaChevronLeft />
                              Previous
                            </button>
                            
                            <span className="text-sm text-gray-600">
                              Page {appointmentsPage} of {totalAppointmentsPages}
                            </span>
                            
                            <button
                              onClick={() => setAppointmentsPage(prev => Math.min(prev + 1, totalAppointmentsPages))}
                              disabled={appointmentsPage === totalAppointmentsPages}
                              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition ${
                                appointmentsPage === totalAppointmentsPages
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              Next
                              <FaChevronRight />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Prescription Form */}
              <div className="lg:col-span-2">
                <div id="prescription-form" className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">New Prescription</h2>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Reset Form
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="appointment-select" className="block font-medium mb-2 text-gray-700">
                        Select Appointment *
                      </label>
                      <select
                        id="appointment-select"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={selectedAppointmentId ?? ''}
                        onChange={(e) => handleAppointmentChange(e.target.value)}
                        disabled={isCreatingPrescription}
                      >
                        <option value="" disabled>
                          -- Select Confirmed Appointment --
                        </option>
                        {confirmedAppointments.length === 0 ? (
                          <option disabled>No confirmed appointments available</option>
                        ) : (
                          confirmedAppointments.map((appt: any) => (
                            <option key={appt.appointments.apId} value={appt.appointments.apId}>
                              {appt.users.fName} {appt.users.lName} - {appt.appointments.apDate}
                            </option>
                          ))
                        )}
                      </select>
                      {selectedPatientId && (
                        <p className="text-sm text-green-600 mt-1">
                          Patient ID: {selectedPatientId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="notes-textarea" className="block font-medium mb-2 text-gray-700">
                        Prescription Notes *
                      </label>
                      <textarea
                        id="notes-textarea"
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Write diagnosis, prescription, treatment notes, medication, dosage, and instructions here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isCreatingPrescription}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition
                        ${isCreatingPrescription 
                          ? 'bg-blue-400 cursor-not-allowed text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-lg'
                        }
                      `}
                      disabled={isCreatingPrescription}
                    >
                      {isCreatingPrescription ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FaPlusCircle />
                          Submit Prescription
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Prescriptions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Your Issued Prescriptions</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                      showFilters 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaFilter />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Name
                      </label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by patient name..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={patientNameFilter}
                          onChange={(e) => {
                            setPatientNameFilter(e.target.value);
                            setPrescriptionsPage(1); // Reset to first page when filtering
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={dateFilter}
                        onChange={(e) => {
                          setDateFilter(e.target.value);
                          setPrescriptionsPage(1); // Reset to first page when filtering
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes Content
                      </label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search in prescription notes..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={notesFilter}
                          onChange={(e) => {
                            setNotesFilter(e.target.value);
                            setPrescriptionsPage(1); // Reset to first page when filtering
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Showing {startPrescriptionIndex + 1}-{Math.min(endPrescriptionIndex, filteredPrescriptions.length)} of {filteredPrescriptions.length} filtered prescriptions
                        ({prescriptionsList.length} total)
                      </p>
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition"
                      >
                        <FaTimes />
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isPrescriptionsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaExclamationTriangle className="text-red-500" />
                    <p className="text-red-700 font-medium">Error loading prescriptions</p>
                  </div>
                  <p className="text-red-600 mb-4">
                    {(prescriptionsError as any)?.message || 'Unknown error occurred'}
                  </p>
                  <button 
                    onClick={() => refetchPrescriptions()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : isPrescriptionsLoading || isPrescriptionsFetching ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <FaSpinner className="animate-spin mx-auto text-3xl mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading past prescriptions...</p>
                  </div>
                </div>
              ) : filteredPrescriptions.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                  <FaNotesMedical className="mx-auto text-4xl mb-4 text-gray-400" />
                  {activeFiltersCount > 0 ? (
                    <>
                      <p className="text-gray-600 text-lg">No prescriptions match your filters.</p>
                      <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 text-lg">No prescriptions found.</p>
                      <p className="text-gray-500 text-sm mt-2">Your issued prescriptions will appear here.</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPrescriptions.map((presc: PrescriptionItem, index: number) => (
                      <div
                        key={presc.prescId || `prescription-${index}`}
                        className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition space-y-3"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaUser className="text-blue-500" />
                          <span className="font-medium">Patient:</span>
                          <span>{presc.users?.fName} {presc.users?.lName}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FaCalendarCheck className="text-green-500" />
                          <span className="font-medium">Appointment:</span>
                          <span>{presc.appointments?.apDate}</span>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          <div className="flex items-start gap-2 mb-2">
                            <FaNotesMedical className="text-purple-500 mt-1 flex-shrink-0" />
                            <span className="font-medium">Prescription:</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap">
                            {presc.prescriptions.notes}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                          Issued On: {new Date(presc.prescriptions.createdOn).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Prescriptions Pagination */}
                  {totalPrescriptionsPages > 1 && (
                    <div className="mt-8 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setPrescriptionsPage(prev => Math.max(prev - 1, 1))}
                          disabled={prescriptionsPage === 1}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                            prescriptionsPage === 1
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-300'
                          }`}
                        >
                          <FaChevronLeft />
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.min(5, totalPrescriptionsPages) }).map((_, index) => {
                            let pageNumber;
                            if (totalPrescriptionsPages <= 5) {
                              pageNumber = index + 1;
                            } else if (prescriptionsPage <= 3) {
                              pageNumber = index + 1;
                            } else if (prescriptionsPage >= totalPrescriptionsPages - 2) {
                              pageNumber = totalPrescriptionsPages - 4 + index;
                            } else {
                              pageNumber = prescriptionsPage - 2 + index;
                            }
                            
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setPrescriptionsPage(pageNumber)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                  prescriptionsPage === pageNumber
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-300'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setPrescriptionsPage(prev => Math.min(prev + 1, totalPrescriptionsPages))}
                          disabled={prescriptionsPage === totalPrescriptionsPages}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                            prescriptionsPage === totalPrescriptionsPages
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-300'
                          }`}
                        >
                          Next
                          <FaChevronRight />
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Showing {startPrescriptionIndex + 1}-{Math.min(endPrescriptionIndex, filteredPrescriptions.length)} of {filteredPrescriptions.length}
                        {activeFiltersCount > 0 && ` filtered`} prescriptions
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorPrescriptionPage;