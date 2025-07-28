import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type User = {
  userId: number;
  fName: string;
  lName: string;
  email: string;
  contactNo: string;
  role: "admin" | "doctor" | "patient";
  createdOn: string;
  updatedOn: string;
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
           query: () => ({
        url: '/users',
        method: 'GET'
      })
    }),
    promoteToDoctor: builder.mutation<any, number>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        body: { role: 'doctor' },
      }),
    }),
    demoteToPatient: builder.mutation<any, number>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'PATCH',
        body: { role: 'patient' },
      }),
    }),
    deleteUser: builder.mutation<any, number>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  usePromoteToDoctorMutation,
  useDeleteUserMutation,
  useDemoteToPatientMutation
} = usersApi;
