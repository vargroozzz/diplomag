import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1',
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getMe: builder.query<AuthResponse['user'], void>({
      query: () => 'auth/me',
    }),
    refresh: builder.mutation<{ access_token: string }, { refreshToken: string }>({
      query: (body) => ({
        url: 'auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: (body) => ({
        url: 'auth/verify-email',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { 
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useRefreshMutation,
  useVerifyEmailMutation,
} = authApi; 