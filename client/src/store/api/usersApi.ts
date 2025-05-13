import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UserProfile } from '../../types';

const apiUrl = import.meta.env.VITE_API_URL;

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${apiUrl}/api/v1`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => `users/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),
    updateUserProfile: builder.mutation<UserProfile, { userId: string; [key: string]: any }>({
      query: ({ userId, ...body }) => ({
        url: `users/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'User', id: userId }],
    }),
  }),
});

export const { 
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = usersApi; 