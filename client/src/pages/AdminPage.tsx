import React from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Alert, Switch, FormControlLabel, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';
import { useGetAllUsersAdminQuery, useUpdateUserAdminStatusMutation } from '../store/api/usersApi';
// import { UserProfile } from '../types'; // UserProfile not directly used in this component's annotations
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser, loading: authLoading } = useAuth();
  
  // Skip query if auth is loading or current user is not determined or not an admin
  const skipQuery = authLoading || !currentUser || !currentUser.isAdmin;

  const { data: users, isLoading: isLoadingUsers, error, refetch } = useGetAllUsersAdminQuery(undefined, {
    skip: skipQuery,
  });
  const [updateAdminStatus, { isLoading: isUpdatingStatus }] = useUpdateUserAdminStatusMutation();

  const handleAdminStatusChange = async (userId: string, currentIsAdmin: boolean) => {
    console.log("[AdminPage] Attempting to update admin status for userId:", userId);
    if (!userId || userId === "undefined") {
      console.error("[AdminPage] User ID is undefined or the string 'undefined'!");
      alert(t('adminPage.userIdMissingError', 'Error: User ID is missing for status update.'));
      return;
    }
    try {
      await updateAdminStatus({ userId, isAdmin: !currentIsAdmin }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to update admin status:', err);
      alert(t('adminPage.updateStatusError', 'Failed to update admin status.'));
    }
  };

  if (authLoading || isLoadingUsers) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  // This check should ideally happen after authLoading is false and currentUser is determined
  if (!currentUser?.isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error">{t('adminPage.accessDenied', 'Access denied. Admin privileges required.')}</Alert>
      </Container>
    );
  }

  if (error) {
    // TODO: Parse error more effectively if possible
    return <Alert severity="error" sx={{m:2}}>{t('adminPage.loadError', 'Error loading user list.')}</Alert>;
  }

  console.log("[AdminPage] Users data received:", users);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('adminPage.title', 'Admin Panel: User Management')}
      </Typography>
      <Paper elevation={3}>
        {users && users.length > 0 ? (
          <List>
            {users.map((user, index) => {
              console.log("[AdminPage] Mapping user:", user, "with id:", user.id);
              return (
                <React.Fragment key={user.id ?? `user-item-${index}`}>
                  <ListItem>
                    <ListItemText 
                      primary={user.username} 
                      secondary={<>
                          {user.email}<br/>
                          <Typography variant="caption" color="textSecondary">ID: {user.id ?? 'N/A'}</Typography>
                          {currentUser && user.id === currentUser.id && 
                             <Typography variant="caption" color="primary" sx={{ml:1}}>({t('adminPage.thisIsYou', 'This is you')})</Typography>}
                      </>}
                    />
                    <ListItemSecondaryAction>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.isAdmin || false}
                            onChange={() => handleAdminStatusChange(user.id, user.isAdmin || false)}
                            disabled={isUpdatingStatus || (currentUser && user.id === currentUser.id) || !user.id}
                            color="primary"
                          />
                        }
                        label={user.isAdmin ? t('adminPage.adminYes', 'Admin') : t('adminPage.adminNo', 'User')}
                        labelPlacement="start"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < users.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Typography sx={{p: 2}}>{t('adminPage.noUsersFound', 'No users found.')}</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AdminPage; 