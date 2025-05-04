import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface CreateForumPostProps {
  onSubmit: (title: string, content: string) => void;
}

const CreateForumPost: React.FC<CreateForumPostProps> = ({ onSubmit }) => {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      await onSubmit(title, content);
      setTitle('');
      setContent('');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('forum.postTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            error={title.length > 0 && title.length < 3}
            helperText={
              title.length > 0 && title.length < 3
                ? t('forum.titleLengthError')
                : ''
            }
          />

          <TextField
            fullWidth
            label={t('forum.postContent')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
            error={content.length > 0 && content.length < 10}
            helperText={
              content.length > 0 && content.length < 10
                ? t('forum.contentLengthError')
                : ''
            }
          />

          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!title.trim() || !content.trim()}
            >
              {t('forum.createPost')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreateForumPost; 