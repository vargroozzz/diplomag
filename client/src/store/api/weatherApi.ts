import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ProcessedWeatherForecast } from '../../types'; // Assuming types are in ../../types

export interface WeatherForecastQueryArgs {
  lat: number;
  lon: number;
}

const apiUrl = import.meta.env.VITE_API_URL;

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
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
  endpoints: (builder) => ({
    getWeatherForecast: builder.query<ProcessedWeatherForecast | null, WeatherForecastQueryArgs>({
      query: ({ lat, lon }) => `weather/forecast?lat=${lat}&lon=${lon}`,
      // providesTags: (result, error, arg) => [{ type: 'Weather', id: `${arg.lat}-${arg.lon}` }], // Optional: for caching
      transformResponse: (response: ProcessedWeatherForecast | null) => {
        // Here you could further transform the response if needed, or handle nulls.
        // For now, just return it as is or ensure it fits the ProcessedWeatherForecast type.
        return response;
      },
      // Example of how to handle errors if needed, though RTK Query handles many cases by default
      // queryFn: async (args, queryApi, extraOptions, fetchWithBQ) => {
      //   const result = await fetchWithBQ(`weather/forecast?lat=${args.lat}&lon=${args.lon}`);
      //   if (result.error) {
      //     console.error('Weather API error:', result.error);
      //     return { error: result.error as any };
      //   }
      //   return { data: result.data as ProcessedWeatherForecast | null };
      // },
    }),
  }),
});

export const { useGetWeatherForecastQuery, useLazyGetWeatherForecastQuery } = weatherApi; 