import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  endpoints: (builder) => ({
    getUserRoleBreakdown: builder.query<any[], void>({
      query: () => '/analytics/users/roles',
    }),
    getAppointmentsStats: builder.query<any[], void>({
      query: () => '/analytics/appointments/status',
    }),
    getTotalPrescriptions: builder.query<{ total: number }, void>({
      query: () => '/analytics/prescriptions',
    }),
    getTotalComplaints: builder.query<{ total: number }, void>({
      query: () => '/analytics/complaints',
    }),
    getTotalPayments: builder.query<{ total: number }, void>({
      query: () => '/analytics/payments',
    }),
    getAnalyticsForUser: builder.query<any, number>({
      query: (userId) => `/analytics/user/${userId}`,
    }),
    getAnalyticsForDoctor: builder.query<any, number>({
      query: (docId) => `/analytics/doctor/${docId}`,
    }),
  }),
});

export const {
  useGetUserRoleBreakdownQuery,
  useGetAppointmentsStatsQuery,
  useGetTotalPrescriptionsQuery,
  useGetTotalComplaintsQuery,
  useGetTotalPaymentsQuery,
  useGetAnalyticsForUserQuery,
  useGetAnalyticsForDoctorQuery,
} = analyticsApi;
