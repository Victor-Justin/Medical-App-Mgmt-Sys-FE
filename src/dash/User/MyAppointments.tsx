import { useSelector } from "react-redux";
import { useState } from "react";
import { type RootState } from "../../features/store";
import {
  useGetUserAppointmentsQuery,
  useCancelAppointmentMutation,
} from "../api/appointmentsApi";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import SupportTickets from "./MyComplaints";

const MyAppointments = () => {
  const userId = useSelector((state: RootState) => state.user?.user?.user_id);
  const [filteredStatus, setFilteredStatus] = useState<string>("all");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    pending: false,
    confirmed: false,
    cancelled: true,
  });

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

    try {
      await cancelAppointment(apId).unwrap();
      alert("Appointment cancelled successfully.");
      refetch();
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

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case "confirmed":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const getSectionIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "confirmed":
        return "✅";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-600">Loading your appointments...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to Load Appointments
              </h3>
              <p className="text-gray-600 mb-4">
                We're having trouble fetching your appointments. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="bg-white border-b border-gray-200 px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-2">
                Manage and track all your medical appointments
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⏳</span>
                    <div>
                      <p className="text-2xl font-bold text-yellow-800">
                        {grouped.pending.length}
                      </p>
                      <p className="text-sm text-yellow-600">Pending</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">✅</span>
                    <div>
                      <p className="text-2xl font-bold text-green-800">
                        {grouped.confirmed.length}
                      </p>
                      <p className="text-sm text-green-600">Confirmed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">❌</span>
                    <div>
                      <p className="text-2xl font-bold text-red-800">
                        {grouped.cancelled.length}
                      </p>
                      <p className="text-sm text-red-600">Cancelled</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <label className="mr-2 text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filteredStatus}
                  onChange={(e) => setFilteredStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Appointments Yet
                </h3>
                <p className="text-gray-600">
                  You haven't booked any appointments. Start by scheduling your first appointment.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {["pending", "confirmed", "cancelled"]
                  .filter((status) => filteredStatus === "all" || filteredStatus === status)
                  .map((status) => (
                    <section
                      key={status}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div
                        className="bg-gray-50 px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => toggleSection(status)}
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <span className="text-2xl mr-3">{getSectionIcon(status)}</span>
                            {status.charAt(0).toUpperCase() + status.slice(1)} Appointments
                            <span className="ml-3 bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">
                              {grouped[status as keyof typeof grouped].length}
                            </span>
                          </h2>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              collapsedSections[status] ? "rotate-0" : "rotate-180"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          collapsedSections[status]
                            ? "max-h-0 opacity-0 overflow-hidden"
                            : "max-h-full opacity-100"
                        }`}
                      >
                        <div className="p-6">
                          {grouped[status as keyof typeof grouped].length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-500">
                                No {status} appointments found.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                              {grouped[status as keyof typeof grouped].map((ap: any) => (
                                <div
                                  key={ap.appointments.apId}
                                  className="border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-semibold text-white text-lg">
                                        Dr. {ap.doctors?.fName} {ap.doctors?.lName}
                                      </h3>
                                      <span
                                        className={getStatusBadge(ap.appointments.apStatus)}
                                      >
                                        {ap.appointments.apStatus}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-4 space-y-3">
                                    <div className="bg-blue-50 rounded-lg p-3">
                                      <div className="flex items-center text-blue-800 mb-1">
                                        <span className="text-lg mr-2">📅</span>
                                        <span className="font-semibold text-sm uppercase tracking-wide">
                                          Appointment Schedule
                                        </span>
                                      </div>
                                      <p className="text-blue-900 font-semibold">
                                        {formatDate(ap.appointments.apDate)}
                                      </p>
                                      <p className="text-blue-700">
                                        {formatTime(ap.appointments.startTime)}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600 text-sm">
                                        Consultation Fee:
                                      </span>
                                      <span className="font-bold text-green-600 text-lg">
                                        KES {ap.appointments.amount}
                                      </span>
                                    </div>

                                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                                      Booked on:{" "}
                                      {new Date(
                                        ap.appointments.createdOn
                                      ).toLocaleString()}
                                    </div>

                                    {ap.appointments.apStatus === "pending" && (
                                      <div className="pt-3">
                                        <button
                                          onClick={() =>
                                            handleCancel(ap.appointments.apId)
                                          }
                                          disabled={isCancelling}
                                          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                                        >
                                          {isCancelling ? (
                                            <>
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                              Cancelling...
                                            </>
                                          ) : (
                                            <>
                                              <span className="mr-2">❌</span>
                                              Cancel Appointment
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}

                                    {/* Lodge Complaint Button */}
                                    {ap.appointments.apStatus === "confirmed" && (<SupportTickets apId={ap.appointments.apId} />)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyAppointments;
