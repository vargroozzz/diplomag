import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Box,
  IconButton,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface ForumPostProps {
  post: {
    _id: string;
    title: string;
    content: string;
    author: {
      _id: string;
      username: string;
    };
    likes: string[];
    comments: Comment[];
    createdAt: string;
  };
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}

const ForumPost: React.FC<ForumPostProps> = ({ post, onLike, onComment }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { t } = useTranslation();

  const isLiked = user && post.likes.includes(user.id);
  const formattedDate = new Date(post.createdAt).toLocaleDateString();

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(post._id, newComment);
      setNewComment('');
    }
  };

  console.log(isLiked);

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {post.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar>{post.author.username?.[0]?.toUpperCase?.()}</Avatar>
              <Typography variant="subtitle1" component="span">
                {post.author.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formattedDate}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mt: 2 }}>
          {post.content}
        </Typography>
      </CardContent>

      <CardActions>
        <IconButton
          onClick={() => onLike(post._id)}
          color={isLiked ? 'primary' : 'default'}
        >
          {isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.likes.length} {t('forum.likes')}
        </Typography>
        <IconButton>
          <CommentIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.comments.length} {t('forum.comments')}
        </Typography>
      </CardActions>

      <Divider />

      <List>
        {post.comments.map((comment) => (
          <React.Fragment key={comment._id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{comment.author.username?.[0]?.toUpperCase?.()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={comment.author.username}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {comment.content}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>

      {user && (
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('forum.writeComment')}
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            {t('forum.addComment')}
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default ForumPost; 