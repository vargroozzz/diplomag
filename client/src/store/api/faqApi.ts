import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiUrl = import.meta.env.VITE_API_URL;

export interface AskFaqRequest {
  question: string;
}

export interface AskFaqResponse {
  answer: string;
}

export const faqApi = createApi({
  reducerPath: 'faqApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiUrl}/api/v1`,
    prepareHeaders: (headers) => {
      // Add Authorization header if your /faq/ask endpoint is protected
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    askFaq: builder.mutation<AskFaqResponse, AskFaqRequest>({
      query: ({ question }) => ({
        url: 'faq/ask',
        method: 'POST',
        body: { question },
      }),
    }),
  }),
});

export const { useAskFaqMutation } = faqApi; 