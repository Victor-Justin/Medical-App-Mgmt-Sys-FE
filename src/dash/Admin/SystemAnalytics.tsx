import React, { useState } from 'react';
import {
  useGetUserRoleBreakdownQuery,
  useGetAppointmentsStatsQuery,
  useGetTotalPrescriptionsQuery,
  useGetTotalComplaintsQuery,
  useGetTotalPaymentsQuery,
  useGetAnalyticsForUserQuery,
  useGetAnalyticsForDoctorQuery,
} from '../api/analyticsApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#1E40AF'];

const StatCard = ({ title, value, icon, isLoading }: { title: string; value: number | string; icon: string; isLoading: boolean }) => (
  <div className="card bg-white shadow-md border border-blue-100">
    <div className="card-body">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-600">{title}</h3>
          {isLoading ? (
            <div className="skeleton h-6 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-semibold text-blue-700">{value}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, isLoading }: { title: string; children: React.ReactNode; isLoading: boolean }) => (
  <div className="card bg-white shadow-md border border-blue-100">
    <div className="card-body">
      <h3 className="text-lg font-semibold text-blue-700 mb-3">{title}</h3>
      {isLoading ? <div className="skeleton h-64 w-full" /> : children}
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);

  const { data: userRoles = [], isLoading: rolesLoading } = useGetUserRoleBreakdownQuery();
  const { data: appointmentsStats = [], isLoading: appointmentsLoading } = useGetAppointmentsStatsQuery();
  const { data: totalPrescriptions, isLoading: prescriptionsLoading } = useGetTotalPrescriptionsQuery();
  const { data: totalComplaints, isLoading: complaintsLoading } = useGetTotalComplaintsQuery();
  const { data: totalPayments, isLoading: paymentsLoading } = useGetTotalPaymentsQuery();
  const { data: userAnalytics, isLoading: userAnalyticsLoading } = useGetAnalyticsForUserQuery(selectedUserId);
  const { data: doctorAnalytics, isLoading: doctorAnalyticsLoading } = useGetAnalyticsForDoctorQuery(selectedDoctorId);

  const allLoading =
    rolesLoading || appointmentsLoading || prescriptionsLoading || complaintsLoading || paymentsLoading;

  return (
    <div className="flex h-screen">

      <Sidebar />


      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-white overflow-auto">

        <Topbar />

        <div className="p-6 max-w-7xl mx-auto">

          <header className="mb-10">
            <h1 className="text-4xl font-bold text-blue-900">📊 System Reports</h1>
            <p className="text-blue-700 mt-1">Monitor system health & user behavior </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Prescriptions" value={totalPrescriptions?.total || 0} icon="💊" isLoading={prescriptionsLoading} />
            <StatCard title="Total Complaints" value={totalComplaints?.total || 0} icon="📢" isLoading={complaintsLoading} />
            <StatCard title="Total Payments" value={totalPayments?.total || 0} icon="💰" isLoading={paymentsLoading} />
            <StatCard title="User Roles" value={userRoles.length} icon="👥" isLoading={rolesLoading} />
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

            <ChartCard title="User Roles" isLoading={rolesLoading}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={userRoles.map(r => ({ name: r.role, value: r.total }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    dataKey="value"
                >
                    {userRoles.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

   
            <ChartCard title="Appointments by Status" isLoading={appointmentsLoading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentsStats.map(s => ({ ...s, total: s.total || s.count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <ChartCard title="User Analytics" isLoading={userAnalyticsLoading}>
              <div className="mb-4 flex items-center gap-4">
                <label className="font-medium text-blue-700">User ID:</label>
                <input
                  type="number"
                  className="input input-bordered input-sm w-32"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  placeholder="Enter User ID"
                />
              </div>
              {userAnalytics ? (
                <div className="space-y-2 text-blue-900">
                  <div>Appointments: {userAnalytics.appointments}</div>
                  <div>Prescriptions: {userAnalytics.prescriptions}</div>
                  <div>Complaints: {userAnalytics.complaints}</div>
                  <div>Payments: {userAnalytics.payments}</div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data available for this user.</p>
              )}
            </ChartCard>


            <ChartCard title="Doctor Analytics" isLoading={doctorAnalyticsLoading}>
              <div className="mb-4 flex items-center gap-4">
                <label className="font-medium text-blue-700">Doctor ID:</label>
                <input
                  type="number"
                  className="input input-bordered input-sm w-32"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  placeholder="Enter Doctor ID"
                />
              </div>
              {doctorAnalytics ? (
                <div className="space-y-2 text-blue-900">
                  <div>Appointments: {doctorAnalytics.appointments}</div>
                  <div>Prescriptions: {doctorAnalytics.prescriptions}</div>
                  <div>Complaints: {doctorAnalytics.complaints}</div>
                  <div>Payments: {doctorAnalytics.payments}</div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data available for this doctor.</p>
              )}
            </ChartCard>
          </div>


          {allLoading && (
            <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
              <div className="text-center text-blue-700 space-y-2">
                <span className="loading loading-spinner loading-lg"></span>
                <div>Loading system analytics...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
