import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define TypeScript interfaces for Hive and Field based on backend schemas
// Ensure these match the structure returned by your backend, especially GeoJSON parts

interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: Array<Array<[number, number]>>; // Array of rings, first is exterior
}

export interface Hive {
  _id: string;
  name: string;
  notes?: string;
  location: GeoJsonPoint;
  user: string;
  insights?: string[]; 
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  _id: string;
  name: string;
  cropType: string;
  bloomingPeriodStart: string;
  bloomingPeriodEnd: string;  
  treatmentDates?: string[];
  geometry: GeoJsonPolygon;
  user: string;
  insights?: string[];
  createdAt: string;
  updatedAt: string;
}

// Request types for mutations (Payloads)
interface AddHiveRequest {
  name: string;
  notes?: string;
  location: GeoJsonPoint;
}

interface UpdateHiveRequest extends Partial<AddHiveRequest> {
  _id: string;
}

interface AddFieldRequest {
  name: string;
  cropType: string;
  bloomingPeriodStart: string;
  bloomingPeriodEnd: string;  
  treatmentDates?: string[];
  geometry: GeoJsonPolygon;
}

interface UpdateFieldRequest extends Partial<AddFieldRequest> {
  _id: string;
  geometry?: GeoJsonPolygon;
}

const apiUrl = import.meta.env.VITE_API_URL;

export const mapApi = createApi({
  reducerPath: 'mapApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}/api/v1`,
    prepareHeaders: (headers, { getState: _getState }) => {
      // Consider using a selector to get the token from your auth state if managed by Redux
      const token = localStorage.getItem('token'); 
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Hive', 'Field'],
  endpoints: (builder) => ({
    getHives: builder.query<Hive[], void>({
      query: () => 'hives',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Hive' as const, id: _id })),
              { type: 'Hive', id: 'LIST' },
            ]
          : [{ type: 'Hive', id: 'LIST' }],
    }),
    getFields: builder.query<Field[], void>({
      query: () => 'fields',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Field' as const, id: _id })),
              { type: 'Field', id: 'LIST' },
            ]
          : [{ type: 'Field', id: 'LIST' }],
    }),
    addHive: builder.mutation<Hive, AddHiveRequest>({
      query: (newHive) => ({
        url: 'hives',
        method: 'POST',
        body: newHive,
      }),
      invalidatesTags: [{ type: 'Hive', id: 'LIST' }],
    }),
    updateHive: builder.mutation<Hive, UpdateHiveRequest>({
      query: ({ _id, ...patch }) => ({
        url: `hives/${_id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { _id }) => [{ type: 'Hive', id: _id }],
    }),
    deleteHive: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `hives/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Hive', id }],
    }),
    addField: builder.mutation<Field, AddFieldRequest>({
      query: (newField) => ({
        url: 'fields',
        method: 'POST',
        body: newField,
      }),
      invalidatesTags: [{ type: 'Field', id: 'LIST' }],
    }),
    updateField: builder.mutation<Field, UpdateFieldRequest>({
      query: ({ _id, ...patch }) => ({
        url: `fields/${_id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { _id }) => [{ type: 'Field', id: _id }],
    }),
    deleteField: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `fields/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Field', id }],
    }),
  }),
});

export const {
  useGetHivesQuery,
  useGetFieldsQuery,
  useAddHiveMutation,
  useUpdateHiveMutation,
  useDeleteHiveMutation,
  useAddFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldMutation,
} = mapApi; 