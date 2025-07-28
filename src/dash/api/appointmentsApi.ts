import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Appointment = {
    users: any;
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
    payments?: payments
};
type payments ={
    payStatus: string;
  }
export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  endpoints: (builder) => ({

       // ADMIN: Get all appointments
    getAllAppointments: builder.query<Appointment[], void>({
      query: () => `/appointments`,
    }),
    
    // Get appointments for doctor on a specific day
    getAppointments: builder.query<Appointment[], { docId: number; apDate: string }>({
      query: ({ docId, apDate }) => `/appointments?docId=${docId}&apDate=${apDate}`,
    }),

    // Get all appointments for a user
    getUserAppointments: builder.query<Appointment[], number | undefined>({
      query: (userId) => `/appointments/user/${userId}`,
    }),

    //Get all appointments for doctor
    getDoctorAppointments: builder.query<any[], number>({
      query: (docId) => `/appointments/doctor/${docId}`,
    }),

    // Cancel an appointment by ID
    cancelAppointment: builder.mutation<any, number>({
      query: (apId) => ({
        url: `/appointments/${apId}/cancel`,
        method: 'PATCH',
      }),
    }),

    //Doctor confirms appointment
        confirmAppointment: builder.mutation<any, number>({
      query: (apId) => ({
        url: `/appointments/${apId}/confirm`,
        method: 'PATCH',
      }),
    }),

  }),
});

export const {
  useGetAppointmentsQuery,
  useGetUserAppointmentsQuery,
  useCancelAppointmentMutation,
  useConfirmAppointmentMutation,
  useGetAllAppointmentsQuery,
  useGetDoctorAppointmentsQuery,
} = appointmentApi;
