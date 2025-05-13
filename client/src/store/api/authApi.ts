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

interface RegisterResponse {
  message: string;
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

const apiUrl = import.meta.env.VITE_API_URL;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${apiUrl}/api/v1`,
    prepareHeaders: (headers, { getState: _getState, endpoint }) => {
      // List of endpoints that should not have the Authorization header
      const publicEndpoints = ['login', 'register', 'verifyEmail', 'refresh'];

      if (!publicEndpoints.includes(endpoint as string)) {
        const token = localStorage.getItem('token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
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