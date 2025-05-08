import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface AddHiveDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, notes?: string) => Promise<void>;
  isLoading?: boolean;
}

const AddHiveDialog: React.FC<AddHiveDialogProps> = ({ open, onClose, onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (name.trim()) { // Basic validation
      onSubmit(name, notes);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('map.addHiveDialog.title', 'Add New Hive')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="hive-name"
          label={t('map.addHiveDialog.nameLabel', 'Hive Name')}
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
        <TextField
          margin="dense"
          id="hive-notes"
          label={t('map.addHiveDialog.notesLabel', 'Notes (Optional)')}
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>{t('common.cancel', 'Cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading || !name.trim()}>
          {isLoading ? <CircularProgress size={24} /> : t('common.add', 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddHiveDialog; 