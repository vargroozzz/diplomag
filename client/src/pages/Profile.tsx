import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Avatar,
  Box,
  IconButton,
  CircularProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../store/api/usersApi';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  expertise?: string[];
  isAdmin?: boolean;
  createdAt: string;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<UserProfile>) => void;
  field: keyof UserProfile;
  value: string | string[];
}

const EditDialog: React.FC<EditDialogProps> = ({ open, onClose, onSave, field, value }) => {
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave({ [field]: editValue });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit {field}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={field}
          fullWidth
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          multiline={field === 'bio'}
          rows={field === 'bio' ? 4 : 1}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editDialog, setEditDialog] = useState<{ open: boolean; field: keyof UserProfile }>({ open: false, field: 'bio' });
  const { data: profile, isLoading, error } = useGetUserProfileQuery(user?.id ?? '', { skip: !user?.id });
  const [updateProfile] = useUpdateUserProfileMutation();

  const handleEditClick = (field: keyof UserProfile) => {
    setEditDialog({ open: true, field });
  };

  const handleSave = async (data: Partial<UserProfile>) => {
    if (!user?.id) return;
    try {
      await updateProfile({ userId: user.id, ...data });
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">Failed to load profile data</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'grid', gap: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}>
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {profile?.username || user?.username || 'User'}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Beekeeper since {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2023'}
            </Typography>
          </Paper>

          <Box sx={{ display: 'grid', gap: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography>{profile?.email ?? user?.email ?? 'No email provided'}</Typography>
                </Box>
                {profile?.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="action" />
                    <Typography>{profile.location}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Expertise</Typography>
                  <IconButton size="small" onClick={() => handleEditClick('expertise')}>
                    <EditIcon />
                  </IconButton>
                </Box>
                <Typography>
                  {profile?.expertise?.length 
                    ? profile.expertise.join(', ') 
                    : 'Not specified'}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Bio</Typography>
                  <IconButton size="small" onClick={() => handleEditClick('bio')}>
                    <EditIcon />
                  </IconButton>
                </Box>
                <Typography>{profile?.bio || 'Not specified'}</Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>

      <EditDialog
        open={editDialog.open}
        onClose={() => setEditDialog({ ...editDialog, open: false })}
        onSave={handleSave}
        field={editDialog.field}
        value={profile?.[editDialog.field] || ''}
      />
    </Container>
  );
};

export default Profile; 