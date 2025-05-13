import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// For Hives - standard GeoJSON Point
interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// --- For Field DTO Payloads (matching CreateFieldDto.ts) ---
interface PointObjectDto {
  lng: number;
  lat: number;
}
interface LinearRingObjectDto {
  ring: PointObjectDto[];
}
interface GeoJsonPolygonDtoPayload { 
  type: 'Polygon';
  coordinates: LinearRingObjectDto[]; 
}
// --- End DTO Payload types ---

// --- For Field API Responses (standard GeoJSON from DB) ---
interface GeoJsonPolygonApiResponse {
  type: 'Polygon';
  coordinates: Array<Array<[number, number]>>; // Standard GeoJSON: [[[lng, lat], ...]]
}
// --- End API Response types ---

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

// Field interface uses standard GeoJSON for geometry from API responses
export interface Field {
  _id: string;
  name: string;
  cropType: string;
  bloomingPeriodStart: string;
  bloomingPeriodEnd: string;  
  treatmentDates?: string[];
  geometry: GeoJsonPolygonApiResponse; // USE THIS FOR WHAT'S RECEIVED FROM GET /fields
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

// AddFieldRequest uses DTO Payload structure for geometry
interface AddFieldRequest {
  name: string;
  cropType: string;
  bloomingPeriodStart: string;
  bloomingPeriodEnd: string;  
  treatmentDates?: string[];
  geometry: GeoJsonPolygonDtoPayload; // USE THIS FOR SENDING DATA
}

// UpdateFieldRequest also uses DTO Payload structure for geometry
interface UpdateFieldRequest extends Partial<Omit<AddFieldRequest, 'name' | 'cropType' | 'bloomingPeriodStart' | 'bloomingPeriodEnd'> > { // Omit fields not typically in patch for geometry
  _id: string;
  geometry?: GeoJsonPolygonDtoPayload; // USE THIS FOR SENDING DATA (if geometry is updatable)
  name?: string; // Allow name update
  cropType?: string; // Allow cropType update
  // Add other updatable fields as needed
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
