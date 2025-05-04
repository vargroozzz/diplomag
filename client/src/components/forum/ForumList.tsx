import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ForumPost from './ForumPost';
import CreateForumPost from './CreateForumPost';
import { useTranslation } from 'react-i18next';

interface ForumListProps {
  posts: Array<{
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
  }>;
  loading: boolean;
  onCreatePost: (title: string, content: string) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

const ForumList: React.FC<ForumListProps> = ({
  posts,
  loading,
  onCreatePost,
  onLikePost,
  onAddComment,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <CreateForumPost onSubmit={onCreatePost} />
      {posts.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          {t('forum.noPosts')}
        </Typography>
      ) : (
        posts.map((post) => (
          <ForumPost
            key={post._id}
            post={post}
            onLike={onLikePost}
            onComment={onAddComment}
          />
        ))
      )}
    </Box>
  );
};

export default ForumList; 