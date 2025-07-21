import { useSelector } from "react-redux";
import { type RootState } from "../../features/store";
import {
  useGetUserAppointmentsQuery,
  useCancelAppointmentMutation,
} from "../../api/User/appointmentsApi";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

const MyAppointments = () => {
  const userId = useSelector((state: RootState) => state.user?.user?.user_id);

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useGetUserAppointmentsQuery(userId, {
    skip: !userId,
  });

  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();

  const handleCancel = async (apId: number) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

console.log ("ttty", apId)

    try {
      await cancelAppointment(apId).unwrap();
      alert("Appointment cancelled successfully.");
      refetch(); // Refresh list
    } catch (error) {
      console.error("Cancellation failed", error);
      alert("Failed to cancel appointment.");
    }
  };

  const grouped = {
    pending: appointments.filter((a) => a.appointments.apStatus === "pending"),
    confirmed: appointments.filter((a) => a.appointments.apStatus === "confirmed"),
    cancelled: appointments.filter((a) => a.appointments.apStatus === "cancelled"),
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">My Appointments</h2>

          {isLoading && <p className="text-center text-blue-600">Loading...</p>}
          {isError && <p className="text-center text-red-600">Failed to fetch appointments.</p>}

          {!isLoading && !isError && (
            <>
              {["pending", "confirmed", "cancelled"].map((status) => (
                <section key={status} className="mb-8">
                  <h3 className="text-xl font-semibold capitalize text-purple-700 mb-4">
                    {status} Appointments
                  </h3>

                  {grouped[status as keyof typeof grouped].length === 0 ? (
                    <p className="text-gray-500 italic">No {status} appointments.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {grouped[status as keyof typeof grouped].map((ap: any) => (
                        <div
                          key={ap.appointments.apId}
                          className="border border-blue-300 bg-white rounded-xl shadow p-4 relative"
                        >
                          <p className="text-purple-700 font-medium">
                            Doctor: Dr. {ap.doctors?.fName} {ap.doctors?.lName}
                          </p>
                          <p className="text-gray-600">
                            Status: {ap.appointments.apStatus}
                          </p>
                          <p className="text-gray-600">
                            Amount: KES {ap.appointments.amount}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Booked on:{" "}
                            {new Date(ap.appointments.createdOn).toLocaleString()}
                          </p>

                          {ap.appointments.apStatus === "pending" && (
                            <button
                              onClick={() => handleCancel(ap.appointments.apId)}
                              disabled={isCancelling}
                              className="mt-3 px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm text-sm"
                            >
                              {isCancelling ? "Cancelling..." : "Cancel Appointment"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyAppointments;
