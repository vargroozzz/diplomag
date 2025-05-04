import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  likes: string[];
  comments: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      username: string;
    };
    createdAt: string;
  }>;
  createdAt: string;
}

interface CreatePostRequest {
  title: string;
  content: string;
}

interface CreateCommentRequest {
  content: string;
}

export const forumApi = createApi({
  reducerPath: 'forumApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ForumPost'],
  endpoints: (builder) => ({
    getPosts: builder.query<ForumPost[], void>({
      query: () => 'forum',
      providesTags: ['ForumPost'],
    }),
    createPost: builder.mutation<ForumPost, CreatePostRequest>({
      query: (postData) => ({
        url: 'forum',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['ForumPost'],
    }),
    addComment: builder.mutation<ForumPost, { postId: string; comment: CreateCommentRequest }>({
      query: ({ postId, comment }) => ({
        url: `forum/${postId}/comments`,
        method: 'POST',
        body: comment,
      }),
      invalidatesTags: ['ForumPost'],
    }),
    likePost: builder.mutation<ForumPost, string>({
      query: (postId) => ({
        url: `forum/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['ForumPost'],
    }),
  }),
});

export const { 
  useGetPostsQuery,
  useCreatePostMutation,
  useAddCommentMutation,
  useLikePostMutation,
} = forumApi; 