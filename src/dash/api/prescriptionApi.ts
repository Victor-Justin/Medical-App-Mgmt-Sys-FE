import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the type for a single prescription object (what's inside the array)
export type PrescriptionItem = {
  createdOn: string;
  prescriptions: any;
  prescId: number;
  apId: number;
  notes: string;
  issuedOn: string;

  users?: {
    userId: number;
    fName: string;
    lName: string;
    email: string;
    contactNo: string;
  };

  doctors?: {
    docId: number;
    fName: string;
    lName: string;
    email: string;
    specialization: string;
    contactNo: string;
  };

  appointments?: {
    apId: number;
    apDate: string;
    startTime: string;
    endTime: string;
    apStatus: string;
  };
};

// Define the type for the full API response for prescriptions by doctor ID
// Assuming it returns an object with a 'prescriptions' property that is an array of PrescriptionItem
export type PrescriptionsResponse = {
  data: PrescriptionItem[];
  prescriptions: PrescriptionItem[];
};


export const prescriptionsApi = createApi({
  reducerPath: 'prescriptionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  tagTypes: ['Prescription'], // Add tagTypes for invalidation
  endpoints: (builder) => ({

    getAllPrescriptions: builder.query<PrescriptionItem[], void>({
      query: () => `/prescriptions`,
      // **FIX for providesTags:** Handle 'result' possibly being undefined
      providesTags: (result) =>
        result // Check if result exists
          ? [...result.map(({ prescId }) => ({ type: 'Prescription' as const, id: prescId })), { type: 'Prescription', id: 'LIST' }]
          : [{ type: 'Prescription', id: 'LIST' }], // If result is undefined, just return the list tag
    }),

    getPrescriptionsByUserId: builder.query<PrescriptionItem[], number>({
      query: (userId) => `/prescriptions/user/${userId}`,
      // **FIX for providesTags:** Handle 'result' possibly being undefined
      providesTags: (result, error, userId) =>
        result
          ? [...result.map(({ prescId }) => ({ type: 'Prescription' as const, id: prescId })), { type: 'Prescription', id: `USER-${userId}` }]
          : [{ type: 'Prescription', id: `USER-${userId}` }],
    }),

    // Correctly type the response for getPrescriptionsByDoctorId
    getPrescriptionsByDoctorId: builder.query<PrescriptionsResponse, number>({
      query: (docId) => `/prescriptions/doctor/${docId}`,
      // **FIX for providesTags:** Access result.prescriptions safely
      providesTags: (result, error, docId) =>
        result && result.prescriptions // Ensure result and result.prescriptions exist
          ? [...result.prescriptions.map(({ prescId }) => ({ type: 'Prescription' as const, id: prescId })), { type: 'Prescription', id: 'LIST' }]
          : [{ type: 'Prescription', id: 'LIST' }], // If result or result.prescriptions is undefined, just return the list tag
    }),

    getPrescriptionsByDoctorAndUser: builder.query<PrescriptionItem[], { docId: number; userId: number }>({
      query: ({ docId, userId }) => `/prescriptions/doctor/${docId}/user/${userId}`,
      // **FIX for providesTags:** Handle 'result' possibly being undefined
      providesTags: (result, error, { docId, userId }) =>
        result
          ? [...result.map(({ prescId }) => ({ type: 'Prescription' as const, id: prescId })), { type: 'Prescription', id: `DOCTOR-${docId}-USER-${userId}` }]
          : [{ type: 'Prescription', id: `DOCTOR-${docId}-USER-${userId}` }],
    }),

    createPrescription: builder.mutation<PrescriptionItem, { apId: number; userId: number; notes: string }>({
      query: (body) => ({
        url: `/prescriptions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Prescription', id: 'LIST' }], // Invalidate the list after creation
    }),

    updatePrescription: builder.mutation<PrescriptionItem, { id: number; data: Partial<PrescriptionItem> }>({
      query: ({ id, data }) => ({
        url: `/prescriptions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Prescription', id }],
    }),
  }),
});

export const {
  useGetAllPrescriptionsQuery,
  useGetPrescriptionsByUserIdQuery,
  useGetPrescriptionsByDoctorIdQuery,
  useGetPrescriptionsByDoctorAndUserQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
} = prescriptionsApi;