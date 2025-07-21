
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = 'http://localhost:6969';

export type TLoginResponse = {
  token: string;
  user: {
    userId: number;
    fname: string;
    lname: string;
    email: string;
    role: string;
  };
};

export type TLoginInputs = {
  email: string;
  password: string;
};

export type TRegisterInputs = {
  fName: string;
  lName: string;
  email: string;
  password: string;
  role: string;
};

export type TVerifyInputs = {
  email: string;
  code: string;
};

export const authAPI = createApi({
  reducerPath: 'authAPI',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    loginUser: builder.mutation<TLoginResponse, TLoginInputs>({
      query: (loginData) => ({
        url: '/auth/login',
        method: 'POST',
        body: loginData,
      }),
    }),
    registerUser: builder.mutation<{ message: string }, TRegisterInputs>({
      query: (registerData) => ({
        url: '/auth/register',
        method: 'POST',
        body: registerData,
      }),
    }),
    verifyUser: builder.mutation<{ message: string }, TVerifyInputs>({
      query: (verifyData) => ({
        url: '/auth/verify',
        method: 'POST',
        body: verifyData,
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useVerifyUserMutation,
} = authAPI;
