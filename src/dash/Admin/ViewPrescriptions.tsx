import { useState, useMemo } from 'react';
import { useGetAllPrescriptionsQuery } from '../../dash/api/prescriptionApi';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import { FaEye, FaSearch, FaTimes, FaCalendar, FaUser, FaUserMd, FaFileAlt } from 'react-icons/fa';

const AdminPrescriptionsPage = () => {
  const { data: prescriptions = [], isLoading, error } = useGetAllPrescriptionsQuery();
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);


  const [nameFilter, setNameFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((presc) => {
      const nameMatch =
        `${presc.users?.fName || ''} ${presc.users?.lName || ''}`
          .toLowerCase()
          .includes(nameFilter.toLowerCase());
      const doctorMatch =
        `${presc.doctors?.fName || ''} ${presc.doctors?.lName || ''}`
          .toLowerCase()
          .includes(doctorFilter.toLowerCase());
      const appointmentMatch = presc.prescriptions.apId
        .toString()
        .includes(appointmentFilter);
      const dateMatch = dateFilter 
        ? new Date(presc.prescriptions.createdOn).toISOString().split('T')[0] === dateFilter
        : true;

      return nameMatch && doctorMatch && appointmentMatch && dateMatch;
    });
  }, [prescriptions, nameFilter, doctorFilter, appointmentFilter, dateFilter]);

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrescriptions = filteredPrescriptions.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setNameFilter('');
    setDoctorFilter('');
    setAppointmentFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <div className="p-6 flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Prescriptions</h2>
              <p className="text-gray-600">Please try refreshing the page or contact support if the problem persists.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />

        <div className="p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Prescription Management</h2>
            <p className="text-gray-600">View and manage all prescriptions in the system</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex items-center">
                <FaFileAlt className="text-blue-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-800">{prescriptions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-center">
                <FaSearch className="text-green-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Filtered Results</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredPrescriptions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
              <div className="flex items-center">
                <FaCalendar className="text-purple-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Today's Prescriptions</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {prescriptions.filter(p => 
                      new Date(p.prescriptions.createdOn).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Prescriptions</h3>
              <button
                onClick={clearFilters}
                className="btn btn-ghost btn-sm text-red-500 hover:text-red-700"
              >
                <FaTimes className="mr-1" />
                Clear Filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Patient Name</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patient..."
                    className="input input-bordered w-full pl-10"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Doctor Name</span>
                </label>
                <div className="relative">
                  <FaUserMd className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search doctor..."
                    className="input input-bordered w-full pl-10"
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Appointment ID</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter appointment ID..."
                  className="input input-bordered w-full"
                  value={appointmentFilter}
                  onChange={(e) => setAppointmentFilter(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="mt-4 text-lg font-semibold text-gray-600">Loading prescriptions...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="font-semibold text-gray-700">ID</th>
                        <th className="font-semibold text-gray-700">Appointment</th>
                        <th className="font-semibold text-gray-700">Patient</th>
                        <th className="font-semibold text-gray-700">Doctor</th>
                        <th className="font-semibold text-gray-700">Issued Date</th>
                        <th className="font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPrescriptions.length > 0 ? (
                        paginatedPrescriptions.map((presc) => (
                          <tr key={presc.prescriptions.prescId} className="hover:bg-gray-50">
                            <td className="font-medium">#{presc.prescriptions.prescId}</td>
                            <td>
                              <span className="badge badge-outline">
                                {presc.prescriptions.apId}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center">
                                <div className="avatar placeholder mr-3">
                                  <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                                    <span className="text-xs">
                                      {presc.users?.fName?.charAt(0)}{presc.users?.lName?.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {presc.users?.fName} {presc.users?.lName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {presc.users?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="font-medium">
                                  Dr. {presc.doctors?.fName} {presc.doctors?.lName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {presc.doctors?.specialization}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="text-sm">
                                {formatDate(presc.prescriptions.createdOn)}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline btn-info hover:btn-info"
                                onClick={() => setSelectedPrescription(presc)}
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center text-gray-500 py-8">
                            <div className="flex flex-col items-center">
                              <FaSearch className="text-4xl text-gray-300 mb-2" />
                              <p className="text-lg font-medium">No prescriptions found</p>
                              <p className="text-sm">Try adjusting your filters</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {filteredPrescriptions.length > itemsPerPage && (
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPrescriptions.length)} of {filteredPrescriptions.length} results
                      </div>
                      <div className="join">
                        <button 
                          className="join-item btn btn-sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                          const page = i + 1;
                          const isActive = page === currentPage;
                          return (
                            <button
                              key={page}
                              className={`join-item btn btn-sm ${isActive ? 'btn-active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button 
                          className="join-item btn btn-sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedPrescription && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-gray-800">Prescription Details</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setSelectedPrescription(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                  <FaFileAlt className="mr-2 text-blue-500" />
                  Prescription Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">ID:</span>
                    <span className="font-bold">#{selectedPrescription.prescriptions.prescId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Appointment ID:</span>
                    <span className="badge badge-outline">{selectedPrescription.prescriptions.apId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Issued On:</span>
                    <span>{formatDateTime(selectedPrescription.prescriptions.createdOn)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 block mb-1">Notes:</span>
                    <div className="bg-white p-3 rounded border min-h-[100px]">
                      {selectedPrescription.prescriptions.notes || 'No notes provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Info */}
              <div className="space-y-4">
                {/* Patient Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    Patient Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="font-semibold">{selectedPrescription.users?.fName} {selectedPrescription.users?.lName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span>{selectedPrescription.users?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Contact:</span>
                      <span>{selectedPrescription.users?.contactNo}</span>
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                    <FaUserMd className="mr-2 text-green-500" />
                    Doctor Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="font-semibold">Dr. {selectedPrescription.doctors?.fName} {selectedPrescription.doctors?.lName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span>{selectedPrescription.doctors?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Specialization:</span>
                      <span className="badge badge-success">{selectedPrescription.doctors?.specialization}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action mt-6">
              <button 
                className="btn btn-primary"
                onClick={() => setSelectedPrescription(null)}
              >
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedPrescription(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default AdminPrescriptionsPage;