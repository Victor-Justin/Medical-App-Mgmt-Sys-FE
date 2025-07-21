
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Doctor = {
  docId: number,
  fName: string,
  lName: string,
  email: string,
  specialization: string,
  contactNo: string,
  availableDays: string,      
}

export const doctorApi = createApi({
  reducerPath: 'doctorApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  endpoints: (builder) => ({
    getDoctors: builder.query<Doctor[] ,void>({
      query: () => ({
        url: '/doctors',
        method: 'GET'
      })
    }),
    bookAppointment: builder.mutation({
      query: (appointment) => ({
        url: '/appointments',
        method: 'POST',
        body: appointment,
      }),
      
      
    }),
  }),
});

export const { useGetDoctorsQuery, useBookAppointmentMutation } = doctorApi;
