import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Complaint = {
  doctors: any;
  complaints: any;
  compId: number;
  userId: number;
  apId: number;
  subject: string;
  description: string;
  status: string;
  createdOn: string;
  updatedOn: string;
  appointments?: {
    apId: number;
    apDate: string;
    startTime:string;
    DoctorsTable?: {
      docId: number;
      fName: string;
      lName: string;
      email: string;
      specialization: string;
      contactNo: string;
    };
  };
};

export const complaintsApi = createApi({
  reducerPath: 'complaintsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  endpoints: (builder) => ({
    createComplaint: builder.mutation<Complaint, Partial<Complaint>>({
      query: (complaint) => ({
        url: '/complaints',
        method: 'POST',
        body: complaint,
      }),
    }),

    getUserComplaints: builder.query<Complaint[], number>({
      query: (userId) => `/complaints/user/${userId}`,
    }),

    getAllComplaints: builder.query<Complaint[], void>({
      query: () => `/complaints`,
    }),

    updateComplaint: builder.mutation<{ message: string }, { id: number; data: Partial<Complaint> }>({
      query: ({ id, data }) => ({
        url: `/complaints/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateComplaintMutation,
  useGetUserComplaintsQuery,
  useGetAllComplaintsQuery,
  useUpdateComplaintMutation,
} = complaintsApi;
