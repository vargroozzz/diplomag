import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, Polyline } from 'react-leaflet';
import L, { LatLngExpression, LatLngTuple, LatLng } from 'leaflet';
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useGetHivesQuery, useGetFieldsQuery, useAddHiveMutation, useAddFieldMutation, Hive, Field } from '../store/api/mapApi';
import AddHiveDialog from '../components/map/AddHiveDialog';
import AddFieldDialog, { FieldFormData } from '../components/map/AddFieldDialog';

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
            <Marker key={hive._id} position={[hive.location.coordinates[1], hive.location.coordinates[0]] as LatLngTuple}>
              <Popup>
                <b>{hive.name}</b><br />
                {hive.notes}
              </Popup>
            </Marker>
          ))}

          {fields?.map((field: Field) => {
            // Leaflet polygons expect [lat, lng]
            // Backend now returns coordinates as number[][][] ([[[lng, lat]]])
            const polygonPositions = field.geometry.coordinates[0].map(coords => [coords[1], coords[0]]) as LatLngTuple[];
            return (
              <Polygon key={field._id} pathOptions={{ color: 'blue' }} positions={polygonPositions}>
                <Popup>
                  <b>{field.name}</b><br />
                  Crop: {field.cropType}<br />
                  Blooms: {new Date(field.bloomingPeriodStart).toLocaleDateString()} - {new Date(field.bloomingPeriodEnd).toLocaleDateString()}
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

    </Container>
  );
};

export default MapPage; 