import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Appointment = {
  appointments: any;
  amount: string;
  apDate: string;
  apId: number;
  apStatus: string;
  docId: number;
  endTime: string;
  startTime: string;
  updatedOn: string;
  userId?: number;
  doctors: {
    availableDays: string;
    contactNo: string;
    createdOn: string;
    docId: number;
    email: string;
    fName: string;
    lName: string;
    specialization: string;
    updatedOn: string;
  };
};

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  endpoints: (builder) => ({
    // Get appointments for doctor on a specific day
    getAppointments: builder.query<Appointment[], { docId: number; apDate: string }>({
      query: ({ docId, apDate }) => `/appointments?docId=${docId}&apDate=${apDate}`,
    }),

    // Get all appointments for a user
    getUserAppointments: builder.query<Appointment[], number | undefined>({
      query: (userId) => `/appointments/user/${userId}`,
    }),

    // Cancel an appointment by ID
    cancelAppointment: builder.mutation<any, number>({
      query: (apId) => ({
        url: `/appointments/${apId}/cancel`,
        method: 'PATCH',
      }),
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetUserAppointmentsQuery,
  useCancelAppointmentMutation,
} = appointmentApi;
