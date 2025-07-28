import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Doctor = {
  docId: number;
  fName: string;
  lName: string;
  email: string;
  specialization: string;
  contactNo: string;
  availableDays: string;
  userId: number;
};

export const doctorApi = createApi({
  reducerPath: 'doctorApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  endpoints: (builder) => ({
    // Get all doctors
    getDoctors: builder.query<Doctor[], void>({
      query: () => ({
        url: '/doctors',
        method: 'GET',
      }),
    }),

    // Get doctor by user ID
    getDoctorByUserId: builder.query<Doctor, number>({
      query: (userId) => ({
        url: `/doctors/user/${userId}`,
        method: 'GET',
      }),
    }),

    // Book an appointment
    bookAppointment: builder.mutation({
      query: (appointment) => ({
        url: '/appointments',
        method: 'POST',
        body: appointment,
      }),
    }),

    confirmAppointment: builder.mutation<any, number>({
  query: (apId) => ({
    url: `/appointments/${apId}/confirm`,
    method: 'PATCH',
  }),
}),

  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByUserIdQuery,
  useBookAppointmentMutation,
} = doctorApi;
