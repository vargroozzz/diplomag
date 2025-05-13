import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, Polyline } from 'react-leaflet';
import L, { LatLngExpression, LatLngTuple, LatLng } from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { Container, Typography, Box, CircularProgress, Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HiveIcon from '@mui/icons-material/Hive';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { useGetHivesQuery, useGetFieldsQuery, useAddHiveMutation, useAddFieldMutation, useDeleteHiveMutation, useUpdateFieldMutation, Hive, Field } from '../store/api/mapApi';
import AddHiveDialog from '../components/map/AddHiveDialog';
import AddFieldDialog, { FieldFormData } from '../components/map/AddFieldDialog';
import EditFieldDialog, { EditFieldFormData } from '../components/map/EditFieldDialog';

// Component to handle map clicks for adding new items
interface MapClickHandlerProps {
  onMapClick: (latLng: LatLng) => void;
  isEnabled: boolean;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick, isEnabled }) => {
  useMapEvents({
    click(e) {
      if (isEnabled) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const MapPage: React.FC = () => {
  const { t } = useTranslation();
  const initialPosition: LatLngExpression = [48.3794, 31.1656]; // Approx center of Ukraine
  const initialZoom = 6;

  const TREATMENT_SOON_DAYS = 7;
  const FIELD_COLOR_DEFAULT = 'blue';
  const FIELD_COLOR_TREATMENT_TODAY = 'red';
  const FIELD_COLOR_TREATMENT_SOON = 'orange';

  // Date utility functions
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getFieldTreatmentStatus = useMemo(() => (treatmentDates?: string[]) => {
    if (!treatmentDates || treatmentDates.length === 0) {
      return { color: FIELD_COLOR_DEFAULT, status: 'normal' };
    }
    const today = new Date();
    let isSoon = false;

    for (const dateString of treatmentDates) {
      const treatmentDate = new Date(dateString);
      if (isSameDay(treatmentDate, today)) {
        return { color: FIELD_COLOR_TREATMENT_TODAY, status: 'today' }; // Treatment today
      }
      const diffTime = treatmentDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= TREATMENT_SOON_DAYS) {
        isSoon = true; // Treatment soon, continue checking if any is today
      }
    }

    if (isSoon) {
      return { color: FIELD_COLOR_TREATMENT_SOON, status: 'soon' }; // Treatment soon
    }

    return { color: FIELD_COLOR_DEFAULT, status: 'normal' }; // No imminent treatment
  }, []);

  // Define custom hive icon using MUI HiveIcon
  const hiveLeafletIcon = L.divIcon({
    html: ReactDOMServer.renderToString(<HiveIcon sx={{ fontSize: 30, color: '#FFA500' }} />),
    className: 'leaflet-mui-icon', // Add a class for potential custom styling
    iconSize: [30, 30],
    iconAnchor: [15, 30], // Adjust anchor to point correctly
    popupAnchor: [0, -30] // Adjust popup anchor relative to icon
  });

  const [isAddHiveMode, setIsAddHiveMode] = useState(false);
  const [newHiveLocation, setNewHiveLocation] = useState<LatLng | null>(null);
  const [isAddHiveDialogOpen, setIsAddHiveDialogOpen] = useState(false);

  // New state for Add Field Mode
  const [isAddFieldMode, setIsAddFieldMode] = useState(false);
  const [newPolygonPoints, setNewPolygonPoints] = useState<LatLng[]>([]);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);

  const { data: hives, isLoading: isLoadingHives, error: errorHives } = useGetHivesQuery();
  const { data: fields, isLoading: isLoadingFields, error: errorFields } = useGetFieldsQuery();
  const [addHive, { isLoading: isAddingHive }] = useAddHiveMutation();
  const [addField, { isLoading: isAddingField }] = useAddFieldMutation();
  const [deleteHive, { isLoading: isDeletingHive }] = useDeleteHiveMutation();
  const [updateField, { isLoading: isUpdatingField }] = useUpdateFieldMutation();

  // State for delete hive confirmation
  const [isDeleteHiveConfirmOpen, setIsDeleteHiveConfirmOpen] = useState(false);
  const [hiveToDeleteId, setHiveToDeleteId] = useState<string | null>(null);

  // State for edit field dialog
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<Field | null>(null);

  const handleMapClick = (latLng: LatLng) => {
    if (isAddHiveMode) {
      setNewHiveLocation(latLng);
      setIsAddHiveDialogOpen(true);
      setIsAddHiveMode(false);
    } else if (isAddFieldMode) {
      setNewPolygonPoints((prevPoints) => [...prevPoints, latLng]);
    }
  };

  const handleFinishDrawing = () => {
    if (newPolygonPoints.length < 3) {
      // TODO: Show user-friendly error (e.g., Snackbar)
      console.warn("Need at least 3 points for a polygon");
      return;
    }
    setIsAddFieldMode(false);
    setIsAddFieldDialogOpen(true);
  };

  const handleCancelAddField = () => {
      setIsAddFieldMode(false);
      setNewPolygonPoints([]);
  };

  const handleAddHiveDialogClose = () => {
    setIsAddHiveDialogOpen(false);
    setNewHiveLocation(null); // Clear location if dialog is cancelled
  };

  const handleAddHiveSubmit = async (name: string, notes?: string) => {
    if (!newHiveLocation) return;
    try {
      await addHive({
        name,
        notes,
        location: { type: 'Point', coordinates: [newHiveLocation.lng, newHiveLocation.lat] },
      }).unwrap();
      handleAddHiveDialogClose();
      // Optionally show success message using Snackbar
    } catch (err) {
      // Optionally show error message using Snackbar
      console.error('Failed to add hive:', err);
    }
  };

  const handleAddFieldDialogClose = () => {
    setIsAddFieldDialogOpen(false);
    setNewPolygonPoints([]);
  };

  const handleAddFieldSubmit = async (formData: FieldFormData) => {
    if (newPolygonPoints.length < 3) return; 
    // Close the ring and map to {lng, lat} objects
    const pointObjects = [...newPolygonPoints, newPolygonPoints[0]].map(p => ({ lng: p.lng, lat: p.lat })); 
    // Structure according to DTO: [{ ring: [points...] }]
    const coordinates = [{ ring: pointObjects }]; 

    try {
      await addField({
        ...formData,
        // Send coordinates structured as expected by the DTO
        geometry: { type: 'Polygon', coordinates }, 
      }).unwrap();
      handleAddFieldDialogClose();
      // Optionally show success message
    } catch (err) {
      // Optionally show error message
      console.error('Failed to add field:', err);
    }
  };

  const handleOpenDeleteHiveConfirm = (hiveId: string) => {
    setHiveToDeleteId(hiveId);
    setIsDeleteHiveConfirmOpen(true);
  };

  const handleCloseDeleteHiveConfirm = () => {
    setIsDeleteHiveConfirmOpen(false);
    setHiveToDeleteId(null);
  };

  const handleConfirmDeleteHive = async () => {
    if (!hiveToDeleteId) return;
    try {
      await deleteHive(hiveToDeleteId).unwrap();
      // Optionally show success message (e.g., Snackbar)
      console.log(`Hive ${hiveToDeleteId} deleted successfully`);
    } catch (err) {
      // Optionally show error message (e.g., Snackbar)
      console.error('Failed to delete hive:', err);
    }
    handleCloseDeleteHiveConfirm();
  };

  const handleOpenEditFieldDialog = (field: Field) => {
    setFieldToEdit(field);
    setIsEditFieldDialogOpen(true);
  };

  const handleCloseEditFieldDialog = () => {
    setIsEditFieldDialogOpen(false);
    setFieldToEdit(null);
  };

  const handleEditFieldSubmit = async (formData: EditFieldFormData) => {
    if (!fieldToEdit) return;
    try {
      await updateField({ _id: fieldToEdit._id, ...formData }).unwrap();
      console.log(`Field ${fieldToEdit._id} updated successfully`);
      handleCloseEditFieldDialog();
    } catch (err) {
      console.error('Failed to update field:', err);
      // Potentially show error in dialog or via snackbar
    }
  };

  if (isLoadingHives || isLoadingFields) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('common.loading')}</Typography>
      </Box>
    );
  }

  // TODO: Better error handling for individual query errors
  if (errorHives || errorFields) {
    return <Typography color="error">{t('common.error')}</Typography>;
  }

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column', position: 'relative' }}> 
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1">
          {t('map.title', 'Interactive Map')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isAddFieldMode && ( // Only show Add Hive if not drawing field
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => setIsAddHiveMode(!isAddHiveMode)}
              color={isAddHiveMode ? 'secondary' : 'primary'}
              disabled={isAddFieldMode} // Disable if adding field
            >
              {isAddHiveMode ? t('map.cancelAddHive', 'Cancel Add Hive') : t('map.addHive', 'Add Hive')}
            </Button>
          )}
          {!isAddHiveMode && ( // Only show Add Field if not adding hive
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => { setIsAddFieldMode(true); setNewPolygonPoints([]) }}
              color="primary"
              disabled={isAddHiveMode || isAddFieldMode} // Disable if adding hive or already adding field
            >
              {t('map.addField', 'Add Field')}
            </Button>
          )}
          {isAddFieldMode && (
            <>  
              <Button 
                variant="contained" 
                color="success"
                onClick={handleFinishDrawing}
                disabled={newPolygonPoints.length < 3}
              >
                {t('map.finishDrawing', 'Finish Drawing')}
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleCancelAddField}
              >
                {t('common.cancel')}
              </Button>
            </>
          )}
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, borderRadius: 1, overflow: 'hidden' }}>
        <MapContainer 
          center={initialPosition} 
          zoom={initialZoom} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', cursor: (isAddHiveMode || isAddFieldMode) ? 'crosshair' : '' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler 
            onMapClick={handleMapClick} 
            isEnabled={isAddHiveMode || isAddFieldMode} 
          />

          {/* Temporary marker for new hive location */}
          {newHiveLocation && !isAddHiveDialogOpen && (
            <Marker position={newHiveLocation}>
              <Popup>{t('map.newHiveLocation', 'Click Add Hive button again or open dialog?')}</Popup> 
            </Marker>
          )}
          
          {/* Temporary polygon being drawn */}
          {newPolygonPoints.length > 0 && (
            <Polyline positions={newPolygonPoints} color="red" dashArray="5, 5" />
          )}
          {newPolygonPoints.length > 1 && (
             newPolygonPoints.map((point, index) => (
                <Marker key={`temp-poly-point-${index}`} position={point} icon={L.divIcon({ className: 'leaflet-div-icon leaflet-editing-icon', iconSize: [8, 8] })} />
             ))
          )}
          
          {hives?.map((hive: Hive) => (
            <Marker 
              key={hive._id} 
              position={[hive.location.coordinates[1], hive.location.coordinates[0]] as LatLngTuple}
              icon={hiveLeafletIcon} // Use the custom hive icon
            >
              <Popup>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '150px' }}>
                  <Typography variant="subtitle1" component="b" sx={{ mr: 1 }}>{hive.name}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenDeleteHiveConfirm(hive._id)} 
                    aria-label={t('map.hivePopup.deleteAria', `Delete hive ${hive.name}`)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                {hive.notes && <Typography variant="body2" sx={{ mt: 0.5 }}>{hive.notes}</Typography>}
              </Popup>
            </Marker>
          ))}

          {fields?.map((field: Field) => {
            const polygonPositions = field.geometry.coordinates[0].map(coords => [coords[1], coords[0]]) as LatLngTuple[];
            const treatmentStatus = getFieldTreatmentStatus(field.treatmentDates);
            
            return (
              <Polygon 
                key={field._id} 
                pathOptions={{ color: treatmentStatus.color }} 
                positions={polygonPositions}
              >
                <Popup>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '250px' }}>
                    <Typography variant="subtitle1" component="b" sx={{ mr: 1 }}>{field.name}</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenEditFieldDialog(field)} 
                      aria-label={t('map.fieldPopup.editAria', `Edit field ${field.name}`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>Crop: {field.cropType}</Typography>
                  <Typography variant="body2">Blooms: {new Date(field.bloomingPeriodStart).toLocaleDateString()} - {new Date(field.bloomingPeriodEnd).toLocaleDateString()}</Typography>
                  {field.treatmentDates && field.treatmentDates.length > 0 && (
                    <Box mt={0.5}>
                      <Typography variant="body2">Treatment Dates:</Typography>
                      <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>
                        {field.treatmentDates.map((dateString, index) => (
                          <li key={index}><Typography variant="caption">{new Date(dateString).toLocaleDateString()}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Popup>
              </Polygon>
            );
          })}

        </MapContainer>
      </Box>

      <AddHiveDialog 
        open={isAddHiveDialogOpen}
        onClose={handleAddHiveDialogClose}
        onSubmit={handleAddHiveSubmit}
        isLoading={isAddingHive}
      />

      <AddFieldDialog 
         open={isAddFieldDialogOpen} 
         onClose={handleAddFieldDialogClose}
         onSubmit={handleAddFieldSubmit}
         isLoading={isAddingField}
      />

      <EditFieldDialog 
        open={isEditFieldDialogOpen}
        onClose={handleCloseEditFieldDialog}
        onSubmit={handleEditFieldSubmit}
        isLoading={isUpdatingField}
        initialData={fieldToEdit}
      />

      {/* Delete Hive Confirmation Dialog */}
      <Dialog
        open={isDeleteHiveConfirmOpen}
        onClose={handleCloseDeleteHiveConfirm}
        aria-labelledby="delete-hive-dialog-title"
        aria-describedby="delete-hive-dialog-description"
      >
        <DialogTitle id="delete-hive-dialog-title">
          {t('map.deleteHiveDialog.title', 'Delete Hive?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-hive-dialog-description">
            {t('map.deleteHiveDialog.message', 'Are you sure you want to delete this hive? This action cannot be undone.')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteHiveConfirm} disabled={isDeletingHive}>{t('common.cancel', 'Cancel')}</Button>
          <Button onClick={handleConfirmDeleteHive} color="error" variant="contained" disabled={isDeletingHive} autoFocus>
            {isDeletingHive ? <CircularProgress size={24} /> : t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default MapPage; 