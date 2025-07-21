import { useEffect, useState } from "react";
import { useGetDoctorsQuery, useBookAppointmentMutation } from "../../api/User/viewdoctors";
import { useGetAppointmentsQuery } from "../../api/User/appointmentsApi";
import { useSelector } from "react-redux";
import {type  RootState } from "../../features/store";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const availableTimes = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
];

const Viewdoctors = () => {
  const { data: doctors = [] } = useGetDoctorsQuery();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [amount] = useState(500);
  const userId = useSelector((state: RootState) => state.user?.user?.user_id);

  const {
    data: appointments = [],
    refetch: refetchAppointments,
  } = useGetAppointmentsQuery(
    { docId: selectedDoctor?.docId, apDate: appointmentDate },
    { skip: !selectedDoctor || !appointmentDate }
  );

  const [bookAppointment, { isLoading, isSuccess, isError, reset }] = useBookAppointmentMutation();

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
      alert("Please fill in all required fields");
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
    } catch (error) {
      alert("Failed to book appointment.");
    }
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setStartTime("");
    setEndTime("");
    setAppointmentDate("");
    reset();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">
            Browse and Book Doctors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.docId}
                className={`rounded-xl border p-4 shadow transition-all duration-300 cursor-pointer ${
                  selectedDoctor?.docId === doctor.docId
                    ? "bg-purple-100 border-purple-400"
                    : "bg-white hover:shadow-lg"
                }`}
                onClick={() => {
                  setSelectedDoctor(doctor);
                  reset();
                  (document.getElementById("booking_modal") as HTMLDialogElement)?.showModal();
                }}
              >
                <h3 className="text-xl font-semibold text-purple-700">
                  Dr. {doctor.fName} {doctor.lName}
                </h3>
                <p className="text-blue-700">Specialization: {doctor.specialization}</p>
                <p className="text-gray-600">Email: {doctor.email}</p>
                <p className="text-gray-600">Contact: {doctor.contactNo}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      <dialog id="booking_modal" className="modal">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-2 text-purple-700">
            Book Appointment with Dr. {selectedDoctor?.fName} {selectedDoctor?.lName}
          </h3>

          <div className="space-y-4">
            <input
            type="date"
            className="input input-bordered w-full max-w-xs border-blue-400 text-blue-700"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            disabled={isSuccess}
/>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-4">
              {availableTimes.map((time) => {
                const isDisabled =
                  appointments?.some((a: any) => a?.startTime?.startsWith(time)) || isSuccess;

                return (
                  <button
                    key={time}
                    className={`btn btn-sm ${
                      isDisabled
                        ? "btn-disabled"
                        : startTime === time
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "border border-blue-400 text-blue-700 hover:bg-blue-100"
                    }`}
                    onClick={() => handleStartTimeChange(time)}
                    disabled={isDisabled}
                  >
                    {time}
                  </button>
                );
              })}
            </div>

            {startTime && (
              <div className="mt-4 p-4 bg-blue-50 border border-purple-200 rounded-xl">
                <p className="text-purple-700 font-medium">Start Time: {startTime}</p>
                <p className="text-purple-700 font-medium">End Time: {endTime}</p>
                <button
                  className="btn bg-blue-600 text-white hover:bg-blue-700 mt-3"
                  onClick={handleBooking}
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            )}

            {isSuccess && (
              <div className="text-green-700 font-semibold mt-4">
                Appointment successfully booked!
              </div>
            )}

            {isError && (
              <p className="text-red-600 font-semibold">Error booking appointment.</p>
            )}
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn" onClick={closeModal}>
                {isSuccess ? "Done" : "Cancel"}
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Viewdoctors;
