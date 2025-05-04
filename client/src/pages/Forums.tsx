import React, { useEffect, useState } from 'react';
import { Container, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import ForumList from '../components/forum/ForumList';
import { useAuth } from '../context/AuthContext';

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

const Forums: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/forum');
      setPosts(response.data);
    } catch (error) {
      setError('Failed to fetch forum posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (title: string, content: string) => {
    try {
      const response = await axios.post('/api/forum', { title, content });
      setPosts([response.data, ...posts]);
      setSuccess('Post created successfully');
    } catch (error) {
      setError('Failed to create post');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      setError('Please log in to like posts');
      return;
    }

    try {
      const response = await axios.post(`/api/forum/${postId}/like`);
      setPosts(
        posts.map((post) =>
          post._id === postId ? response.data : post
        )
      );
    } catch (error) {
      setError('Failed to like post');
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!user) {
      setError('Please log in to comment');
      return;
    }

    try {
      const response = await axios.post(`/api/forum/${postId}/comments`, {
        content,
      });
      setPosts(
        posts.map((post) =>
          post._id === postId ? response.data : post
        )
      );
      setSuccess('Comment added successfully');
    } catch (error) {
      setError('Failed to add comment');
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Forum Discussions
      </Typography>
      <ForumList
        posts={posts}
        loading={loading}
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