import { useEffect, useState } from "react";
import { useGetDoctorsQuery, useBookAppointmentMutation } from "../api/doctorsApi";
import { useGetAppointmentsQuery } from "../api/appointmentsApi";
import { useSelector } from "react-redux";
import { type RootState } from "../../features/store";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import toast from 'react-hot-toast';

import { FaSearch, FaCalendarAlt, FaClock, FaUserMd, FaPhone, FaEnvelope, FaTimes, FaCheck, FaSpinner, FaStar } from "react-icons/fa";

const availableTimes = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
];

const Viewdoctors = () => {
  const { data: doctors = [], isLoading: isDoctorsLoading } = useGetDoctorsQuery();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [amount] = useState(500);
  const userId = useSelector((state: RootState) => state.user?.user?.user_id);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: appointments = [], refetch: refetchAppointments } = useGetAppointmentsQuery(
    { docId: selectedDoctor?.docId, apDate: appointmentDate },
    { skip: !selectedDoctor || !appointmentDate }
  );

  const [bookAppointment, { isLoading, isSuccess, isError, error, reset }] = useBookAppointmentMutation();

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      refetchAppointments();
    }
  }, [selectedDoctor, appointmentDate, refetchAppointments]);

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    const [hour, minute] = time.split(":").map(Number);
    const end = new Date();
    end.setHours(hour);
    end.setMinutes(minute + 30);
    const formattedEndTime = end.toTimeString().slice(0, 5);
    setEndTime(formattedEndTime);
  };

  const handleBooking = async () => {
    if (!userId || !selectedDoctor || !appointmentDate || !startTime || !endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    const payload = {
      userId,
      docId: selectedDoctor.docId,
      apDate: appointmentDate,
      startTime: startTime + ":00",
      endTime: endTime + ":00",
      amount,
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    };

    try {
      await bookAppointment(payload).unwrap();
      refetchAppointments();
      toast.success("Appointment booked successfully!");
    } catch (err: any) {
      console.error("Booking error", err);
            toast.error(
        "data" in (error ?? {}) && (error as any)?.data?.message
          ? (error as any).data.message
          : "Error booking appointment. Please try again."
      )
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setStartTime("");
    setEndTime("");
    setAppointmentDate("");
    reset();
  };

  const openBookingModal = (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    reset();
  };

  const uniqueSpecializations = [...new Set(doctors.map((doc: any) => doc.specialization))];

  const filteredDoctors = doctors.filter((doc: any) => {
    const matchesSearch = `${doc.fName} ${doc.lName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecialization ? doc.specialization === filterSpecialization : true;
    return matchesSearch && matchesFilter;
  });

  const getAvatarUrl = (fName: string, lName: string) => {
    return `https://ui-avatars.com/api/?name=${fName}+${lName}&background=3b82f6&color=ffffff&size=200&rounded=true`;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="bg-white shadow-sm border-b border-blue-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Find Your Doctor</h1>
                  <p className="mt-1 text-sm text-gray-600">Book appointments with trusted healthcare professionals</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {filteredDoctors.length} doctors available
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by doctor name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="lg:w-64">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={filterSpecialization}
                    onChange={(e) => setFilterSpecialization(e.target.value)}
                  >
                    <option value="">All Specializations</option>
                    {uniqueSpecializations.map((spec: string, idx: number) => (
                      <option key={idx} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {isDoctorsLoading ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                <span className="ml-3 text-lg text-gray-600">Loading doctors...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDoctors.map((doctor: any) => (
                  <div
                    key={doctor.docId}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => openBookingModal(doctor)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                      <img
                        src={getAvatarUrl(doctor.fName, doctor.lName)}
                        alt={`Dr. ${doctor.fName} ${doctor.lName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-2 py-1">
                        <span className="text-sm font-semibold text-gray-800 flex items-center">
                          <FaStar className="text-yellow-400 mr-1" />
                          4.{Math.floor(Math.random() * 4) + 5}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Dr. {doctor.fName} {doctor.lName}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-blue-600">
                          <FaUserMd className="mr-2 text-sm flex-shrink-0" />
                          <span className="text-sm font-medium">{doctor.specialization}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FaEnvelope className="mr-2 text-sm flex-shrink-0" />
                          <span className="text-sm truncate">{doctor.email}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FaPhone className="mr-2 text-sm flex-shrink-0" />
                          <span className="text-sm">{doctor.contactNo}</span>
                        </div>
                      </div>

                      <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredDoctors.length === 0 && !isDoctorsLoading && (
              <div className="text-center py-12">
                <FaUserMd className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <img
                  src={getAvatarUrl(selectedDoctor.fName, selectedDoctor.lName)}
                  alt={`Dr. ${selectedDoctor.fName}`}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Dr. {selectedDoctor.fName} {selectedDoctor.lName}
                  </h3>
                  <p className="text-sm text-blue-600">{selectedDoctor.specialization}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={isSuccess}
                />
              </div>

              {appointmentDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <FaClock className="inline mr-2" />
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                    {availableTimes.map((time) => {
                      const isDisabled = appointments?.some((a: any) =>
                        a?.startTime?.startsWith(time)
                      ) || isSuccess;

                      return (
                        <button
                          key={time}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            isDisabled
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : startTime === time
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          }`}
                          onClick={() => handleStartTimeChange(time)}
                          disabled={isDisabled}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {startTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Appointment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{appointmentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">{startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">{endTime}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Consultation Fee:</span>
                      <span className="font-semibold text-blue-600">${amount}</span>
                    </div>
                  </div>
                </div>
              )}

              {isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <FaCheck className="text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900">Appointment Booked Successfully!</h4>
                  </div>
                </div>
              )}

              {isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">
                    {"data" in (error ?? {}) && (error as any)?.data?.message
                      ? (error as any).data.message
                      : "Error booking appointment. Please try again."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isSuccess ? "Close" : "Cancel"}
              </button>
              {!isSuccess && startTime && (
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewdoctors;