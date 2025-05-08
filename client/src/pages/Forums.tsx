import React, { useState } from 'react';
import { Container, Typography, Snackbar, Alert } from '@mui/material';
import ForumList from '../components/forum/ForumList';
import { useAuth } from '../context/AuthContext';
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useAddCommentMutation,
  useLikePostMutation,
  useUnlikePostMutation,
} from '../store/api/forumApi';
import { useTranslation } from 'react-i18next';

const Forums: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useTranslation();

  const { data: posts = [], isLoading } = useGetPostsQuery();
  const [createPost] = useCreatePostMutation();
  const [addComment] = useAddCommentMutation();
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();

  const handleCreatePost = async (title: string, content: string) => {
    try {
      await createPost({ title, content }).unwrap();
      setSuccess(t('forum.postCreated'));
    } catch {
      setError(t('common.error'));
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      setError(t('forum.loginToLike'));
      return;
    }
    const post = posts.find((p) => p._id === postId);
    if (!post) return;
    const hasLiked = post.likes.includes(user.id);
    try {
      if (hasLiked) {
        await unlikePost(postId).unwrap();
      } else {
        await likePost(postId).unwrap();
      }
    } catch {
      setError(t('common.error'));
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!user) {
      setError(t('forum.loginToComment'));
      return;
    }
    try {
      await addComment({ postId, comment: { content } }).unwrap();
      setSuccess(t('forum.commentAdded'));
    } catch {
      setError(t('common.error'));
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('forum.title')}
      </Typography>
      <ForumList
        posts={posts}
        loading={isLoading}
        onCreatePost={handleCreatePost}
        onLikePost={handleLikePost}
        onAddComment={handleAddComment}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Forums; 