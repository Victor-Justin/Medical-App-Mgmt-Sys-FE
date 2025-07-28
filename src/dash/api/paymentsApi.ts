import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Payment {
  payments: any;
  transID: number;
  payId: number;
  amount: number;
  payStatus: string;
  payDate: string;
  apId: number;
  createdOn: string;
  updatedOn: string;
  appointments?: {
    apId: number;
    userId: number;
    apDate: string;
    apStatus: string;
  };
}

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:6969' }),
  endpoints: (builder) => ({
    getPaymentsByUserId: builder.query<Payment[], number>({
      query: (userId) => `/payments/user/${userId}`,
    }),

  }),
});

export const { useGetPaymentsByUserIdQuery } = paymentsApi;
