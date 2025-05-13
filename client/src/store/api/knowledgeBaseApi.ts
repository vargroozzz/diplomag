import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
  createdAt: string;
  updatedAt: string;
}

const apiUrl = import.meta.env.VITE_API_URL;

export const knowledgeBaseApi = createApi({
  reducerPath: 'knowledgeBaseApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${apiUrl}/api/v1`,
  }),
  tagTypes: ['Resource'],
  endpoints: (builder) => ({
    getResources: builder.query<Resource[], void>({
      query: () => 'knowledge-base',
      providesTags: ['Resource'],
    }),
    getResource: builder.query<Resource, string>({
      query: (id) => `knowledge-base/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Resource', id }],
    }),
    searchResources: builder.query<Resource[], string>({
      query: (query) => `knowledge-base/search?q=${query}`,
      providesTags: ['Resource'],
    }),
    getResourcesByCategory: builder.query<Resource[], string>({
      query: (category) => `knowledge-base/category/${category}`,
      providesTags: ['Resource'],
    }),
  }),
});

export const { 
  useGetResourcesQuery,
  useGetResourceQuery,
  useSearchResourcesQuery,
  useGetResourcesByCategoryQuery,
} = knowledgeBaseApi; 