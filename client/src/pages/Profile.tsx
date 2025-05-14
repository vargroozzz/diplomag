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
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../store/api/usersApi';
import { UserProfile } from '../types';
import { useTranslation } from 'react-i18next';

// Simplified EditDialog for single string-like fields for now
interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<UserProfile>) => void;
  fieldToEdit: keyof UserProfile | '';
  currentValue: string; // Simplified to always expect string from dialog state
  isMultiLine?: boolean;
  placeholderText?: string;
  label?: string;
  fieldType?: 'string' | 'number' | 'string_array'; // Hint for parsing
}

const EditDialog: React.FC<EditDialogProps> = ({ 
  open, 
  onClose, 
  onSave, 
  fieldToEdit, 
  currentValue,
  isMultiLine = false,
  placeholderText = '' ,
  label,
  fieldType = 'string'
}) => {
  const [editValue, setEditValue] = useState(currentValue);
  const { t } = useTranslation();

  React.useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue, open]);

  const handleSave = () => {
    if (fieldToEdit) {
      let valueToSave: any = editValue;
      if (fieldType === 'string_array') {
        valueToSave = typeof editValue === 'string' ? editValue.split(',').map(s => s.trim()).filter(s => s) : [];
      } else if (fieldType === 'number') {
        const num = parseFloat(editValue);
        valueToSave = isNaN(num) ? undefined : num;
      }
      onSave({ [fieldToEdit]: valueToSave });
    }
    onClose();
  };

  const dialogTitle = label || (fieldToEdit ? t(`profile.${fieldToEdit}`, fieldToEdit.charAt(0).toUpperCase() + fieldToEdit.slice(1)) : 'Edit');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('profile.editDialogTitle', `Edit ${dialogTitle}`)}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={dialogTitle}
          type={fieldType === 'number' ? 'number' : 'text'}
          fullWidth
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          multiline={isMultiLine}
          rows={isMultiLine ? 4 : 1}
          placeholder={placeholderText}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel', 'Cancel')}</Button>
        <Button onClick={handleSave} variant="contained">{t('common.save', 'Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [editDialogState, setEditDialogState] = useState<Omit<EditDialogProps, 'onSave' | 'onClose'> & { open: boolean }> ({
    open: false,
    fieldToEdit: '',
    currentValue: '',
    isMultiLine: false,
    placeholderText: '',
    label: '',
    fieldType: 'string',
  });
  const { data: profile, isLoading, error, refetch } = useGetUserProfileQuery(user?.id ?? '', { skip: !user?.id });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  const handleOpenEditDialog = (
    field: keyof UserProfile, 
    currentValue: string | string[] | number | undefined,
    fieldType: EditDialogProps['fieldType'] = 'string',
    isMultiLine: boolean = false, 
    placeholder: string = ''
  ) => {
    let valueForDialog: string;
    if (Array.isArray(currentValue)) {
      valueForDialog = currentValue.join(', ');
    } else if (typeof currentValue === 'number') {
      valueForDialog = String(currentValue);
    } else {
      valueForDialog = currentValue || '';
    }
    setEditDialogState({ 
      open: true, 
      fieldToEdit: field, 
      currentValue: valueForDialog, 
      isMultiLine, 
      placeholderText: placeholder, 
      label: t(`profile.${field}`, field), // Use t() for label
      fieldType 
    });
  };

  const handleCloseEditDialog = () => {
    setEditDialogState({ ...editDialogState, open: false, fieldToEdit: '', currentValue: '' });
  };

  const handleSaveProfileData = async (data: Partial<UserProfile>) => {
    if (!user?.id || !editDialogState.fieldToEdit) return;
    try {
      // The EditDialog's handleSave already processes based on fieldType
      await updateProfile({ userId: user.id, ...data }).unwrap();
      refetch();
      handleCloseEditDialog();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(t('profile.updateError', 'Failed to update profile.'));
    }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error || !profile) {
    return <Container><Typography color="error">{t('profile.loadError', 'Failed to load profile data')}</Typography></Container>;
  }

  const renderArrayAsChips = (items?: string[]) => {
    if (items && items.length > 0) {
      return items.map(item => <Chip key={item} label={item} size="small" sx={{mr:0.5, mb:0.5}}/>);
    }
    return <Typography variant="body2" component="span">{t('common.notSpecified', 'Not specified')}</Typography>;
  };

  return (
    <Container sx={{mt:2, mb: 4}}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}> {/* MUI v2: Grid item with responsive props */}
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}>
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h5" gutterBottom>{profile?.username || 'User'}</Typography>
            <Typography color="text.secondary">
              {t('profile.beekeeperSince', 'Beekeeper since')} {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '-'}
            </Typography>
             <Typography color="text.secondary" sx={{mt: 0.5}}>
              {profile?.isEmailVerified ? t('profile.emailVerified', 'Email Verified') : t('profile.emailNotVerified', 'Email Not Verified')}
            </Typography>
            {profile?.isAdmin && <Chip label={t('profile.adminRole','Administrator')} color="secondary" size="small" sx={{mt:1}}/>}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}> {/* MUI v2: Grid item with responsive props */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="div">{t('profile.personalInfo', 'Personal Information')}</Typography>
            </Box>
            <Divider sx={{mb:2}} />
            <Typography variant="body1" sx={{mb:1}}><EmailIcon fontSize="small" sx={{verticalAlign: 'bottom', mr:1}} />{profile.email}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon fontSize="small" sx={{verticalAlign: 'bottom', mr:1}} />
              <Typography sx={{flexGrow: 1}}>{profile.location || t('common.notSpecified')}</Typography>
              <IconButton size="small" onClick={() => handleOpenEditDialog('location', profile.location, 'string', false, t('profile.locationPlaceholder', 'e.g., Kyiv, Ukraine'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'top', mb: 1 }}>
              <Typography variant="subtitle1" sx={{mr:1, minWidth: '60px'}}>{t('profile.bio','Bio')}:</Typography>
              <Typography variant="body2" sx={{flexGrow: 1}}>{profile.bio || t('common.notSpecified')}</Typography>
              <IconButton size="small" onClick={() => handleOpenEditDialog('bio', profile.bio, 'string', true, t('profile.bioPlaceholder', 'Tell us about yourself'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="div">{t('profile.beekeepingInfo', 'Beekeeping Information')}</Typography>
            </Box>
            <Divider sx={{mb:2}} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}> {/* MUI v2: Grid item */}
                <Typography variant="subtitle2">{t('profile.hiveCount', 'Number of Hives')}:</Typography>
                <Typography variant="body2" component="span" sx={{mr:1}}>{profile.hiveCount ?? t('common.notSpecified')}</Typography>
                <IconButton size="small" onClick={() => handleOpenEditDialog('hiveCount', profile.hiveCount, 'number', false, t('profile.numberPlaceholder', 'Enter a number'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}> {/* MUI v2: Grid item */}
                <Typography variant="subtitle2">{t('profile.yearsOfExperience', 'Years of Experience')}:</Typography>
                <Typography variant="body2" component="span" sx={{mr:1}}>{profile.yearsOfExperience ?? t('common.notSpecified')}</Typography>
                <IconButton size="small" onClick={() => handleOpenEditDialog('yearsOfExperience', profile.yearsOfExperience, 'number', false, t('profile.numberPlaceholder', 'Enter a number'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
              </Grid>
              <Grid size={{ xs: 12 }}> {/* MUI v2: Grid item */}
                <Typography variant="subtitle2">{t('profile.expertise', 'Expertise/Skills')}:</Typography>
                {renderArrayAsChips(profile.expertise)}
                <IconButton size="small" onClick={() => handleOpenEditDialog('expertise', profile.expertise || [], 'string_array', false, t('profile.arrayPlaceholder', 'Comma-separated values'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
              </Grid>
              <Grid size={{ xs: 12 }}> {/* MUI v2: Grid item */}
                <Typography variant="subtitle2">{t('profile.beeTypes', 'Bee Types Kept')}:</Typography>
                {renderArrayAsChips(profile.beeTypes)}
                <IconButton size="small" onClick={() => handleOpenEditDialog('beeTypes', profile.beeTypes || [], 'string_array', false, t('profile.arrayPlaceholder', 'Comma-separated values'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
              </Grid>
              <Grid size={{ xs: 12 }}> {/* MUI v2: Grid item */}
                <Typography variant="subtitle2">{t('profile.primaryForage', 'Primary Local Forage')}:</Typography>
                {renderArrayAsChips(profile.primaryForage)}
                <IconButton size="small" onClick={() => handleOpenEditDialog('primaryForage', profile.primaryForage || [], 'string_array', false, t('profile.arrayPlaceholder', 'Comma-separated values'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
              </Grid>
              <Grid size={{ xs: 12 }}> {/* MUI v2: Grid item */}
                <Typography variant="subtitle2">{t('profile.beekeepingInterests', 'Beekeeping Interests')}:</Typography>
                {renderArrayAsChips(profile.beekeepingInterests)}
                <IconButton size="small" onClick={() => handleOpenEditDialog('beekeepingInterests', profile.beekeepingInterests || [], 'string_array', false, t('profile.arrayPlaceholder', 'Comma-separated values'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="div">{t('profile.communityInteraction', 'Community Interaction')}</Typography>
            </Box>
            <Divider sx={{mb:2}} />
            <Box sx={{ display: 'flex', alignItems: 'top', mb:1 }}>
              <Typography variant="subtitle1" sx={{mr:1, minWidth: '100px'}}>{t('profile.lookingFor', 'Looking For')}:</Typography>
              <Typography variant="body2" sx={{flexGrow: 1}} paragraph>{profile.lookingFor || t('common.notSpecified')}</Typography>
              <IconButton size="small" onClick={() => handleOpenEditDialog('lookingFor', profile.lookingFor, 'string', true, t('profile.lookingForPlaceholder', 'e.g., advice, equipment'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'top' }}>
              <Typography variant="subtitle1" sx={{mr:1, minWidth: '100px'}}>{t('profile.offering', 'Offering')}:</Typography>
              <Typography variant="body2" sx={{flexGrow: 1}} paragraph>{profile.offering || t('common.notSpecified')}</Typography>
              <IconButton size="small" onClick={() => handleOpenEditDialog('offering', profile.offering, 'string', true, t('profile.offeringPlaceholder', 'e.g., honey, mentorship'))} disabled={isUpdating}><EditIcon fontSize='small' /></IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {editDialogState.open && (
        <EditDialog
          open={editDialogState.open}
          onClose={handleCloseEditDialog}
          onSave={handleSaveProfileData}
          fieldToEdit={editDialogState.fieldToEdit}
          currentValue={editDialogState.currentValue} // Already stringified in handleOpenEditDialog
          isMultiLine={editDialogState.isMultiLine}
          placeholderText={editDialogState.placeholderText}
          label={editDialogState.label}
          fieldType={editDialogState.fieldType}
        />
      )}
    </Container>
  );
};

export default Profile; 