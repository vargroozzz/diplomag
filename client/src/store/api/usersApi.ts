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
  tagTypes: ['User', 'AllUsersAdmin'],
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => `users/profile/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),
    updateUserProfile: builder.mutation<UserProfile, { userId: string; [key: string]: any }>({
      query: ({ userId, ...body }) => ({
        url: `users/profile/${userId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'User', id: userId }],
    }),
    getAllUsersAdmin: builder.query<UserProfile[], void>({
      query: () => 'users/admin/all',
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'AllUsersAdmin' as const, id: 'LIST' },
            ]
          : [{ type: 'AllUsersAdmin' as const, id: 'LIST' }],
    }),
    updateUserAdminStatus: builder.mutation<UserProfile, { userId: string; isAdmin: boolean }>({
      query: ({ userId, ...body }) => ({
        url: `users/admin/${userId}/set-admin-status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'AllUsersAdmin', id: 'LIST' }, 
        { type: 'User', id: userId }
      ],
    }),
  }),
});

export const { 
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetAllUsersAdminQuery,
  useUpdateUserAdminStatusMutation,
} = usersApi; 