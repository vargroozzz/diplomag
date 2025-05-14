import { configureStore } from '@reduxjs/toolkit';
import { usersApi } from './api/usersApi';
import { authApi } from './api/authApi';
import { forumApi } from './api/forumApi';
import { knowledgeBaseApi } from './api/knowledgeBaseApi';
import { mapApi } from './api/mapApi';
import { faqApi } from './api/faqApi';

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [forumApi.reducerPath]: forumApi.reducer,
    [knowledgeBaseApi.reducerPath]: knowledgeBaseApi.reducer,
    [mapApi.reducerPath]: mapApi.reducer,
    [faqApi.reducerPath]: faqApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApi.middleware,
      authApi.middleware,
      forumApi.middleware,
      knowledgeBaseApi.middleware,
      mapApi.middleware,
      faqApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 