import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  CircularProgress,
  Grid,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Field } from '../../store/api/mapApi'; // Import Field type

// Use Omit to exclude _id, geometry, user, insights, createdAt, updatedAt from Field for form data
export type EditFieldFormData = Omit<Field, '_id' | 'geometry' | 'user' | 'insights' | 'createdAt' | 'updatedAt'>;

interface EditFieldDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: EditFieldFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Field | null; // Field to edit
}

const EditFieldDialog: React.FC<EditFieldDialogProps> = ({ open, onClose, onSubmit, isLoading, initialData }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EditFieldFormData>({
    name: '',
    cropType: '',
    bloomingPeriodStart: '',
    bloomingPeriodEnd: '',
    treatmentDates: []
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name || '',
        cropType: initialData.cropType || '',
        // Dates from backend are ISO strings, ensure they are formatted for date input (YYYY-MM-DD)
        bloomingPeriodStart: initialData.bloomingPeriodStart ? new Date(initialData.bloomingPeriodStart).toISOString().split('T')[0] : '',
        bloomingPeriodEnd: initialData.bloomingPeriodEnd ? new Date(initialData.bloomingPeriodEnd).toISOString().split('T')[0] : '',
        treatmentDates: initialData.treatmentDates?.map(date => new Date(date).toISOString().split('T')[0]) || []
      });
    } else if (open) { // If open without initial data (should not happen for edit but good practice)
      setFormData({ 
        name: '', 
        cropType: '', 
        bloomingPeriodStart: '', 
        bloomingPeriodEnd: '', 
        treatmentDates: [] 
      });
    }
  }, [open, initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleTreatmentDateChange = (index: number, value: string) => {
    const newDates = [...(formData.treatmentDates || [])];
    newDates[index] = value;
    setFormData({ ...formData, treatmentDates: newDates });
  };

  const addTreatmentDate = () => {
    setFormData({ ...formData, treatmentDates: [...(formData.treatmentDates || []), ''] });
  };

  const removeTreatmentDate = (index: number) => {
    const newDates = (formData.treatmentDates || []).filter((_, i) => i !== index);
    setFormData({ ...formData, treatmentDates: newDates });
  };

  const handleSubmit = () => {
    if (formData.name.trim() && formData.cropType.trim() && formData.bloomingPeriodStart && formData.bloomingPeriodEnd) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('map.editFieldDialog.title', 'Edit Field')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label={t('map.addFieldDialog.nameLabel', 'Field Name')}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <TextField
          margin="dense"
          name="cropType"
          label={t('map.addFieldDialog.cropTypeLabel', 'Crop Type')}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.cropType}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              margin="dense"
              name="bloomingPeriodStart"
              label={t('map.addFieldDialog.bloomStartLabel', 'Blooming Starts')}
              type="date"
              fullWidth
              variant="outlined"
              value={formData.bloomingPeriodStart}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              margin="dense"
              name="bloomingPeriodEnd"
              label={t('map.addFieldDialog.bloomEndLabel', 'Blooming Ends')}
              type="date"
              fullWidth
              variant="outlined"
              value={formData.bloomingPeriodEnd}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              disabled={isLoading}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('map.addFieldDialog.treatmentDatesLabel', 'Planned Treatment Dates')}
          </Typography>
          {(formData.treatmentDates || []).map((date, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                type="date"
                size="small"
                value={date}
                onChange={(e) => handleTreatmentDateChange(index, e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={isLoading}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <IconButton onClick={() => removeTreatmentDate(index)} size="small" disabled={isLoading}>
                <RemoveCircleOutline />
              </IconButton>
            </Box>
          ))}
          <Button 
            startIcon={<AddCircleOutline />} 
            onClick={addTreatmentDate} 
            size="small"
            disabled={isLoading}
          >
            {t('map.addFieldDialog.addTreatmentDate', 'Add Treatment Date')}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>{t('common.cancel')}</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isLoading || !formData.name.trim() || !formData.cropType.trim() || !formData.bloomingPeriodStart || !formData.bloomingPeriodEnd}
        >
          {isLoading ? <CircularProgress size={24} /> : t('common.save', 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFieldDialog; 