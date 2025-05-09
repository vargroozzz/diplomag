import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
// import { useAuth } from '../context/AuthContext'; // Optional: To potentially trigger context update
import axios from 'axios';

const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const { checkAuthStatus } = useAuth(); // Or similar method if context needs explicit update

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);

      // Set default Authorization header for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Optional: Force context update if needed
      // checkAuthStatus(); // Or navigate home and let AuthContext's useEffect handle it

      // Navigate to home or intended page
      navigate('/'); 
    } else {
      // Handle error: Tokens not found in URL parameters
      console.error('OAuth callback error: Tokens not found in URL');
      // Redirect to login page with an error indicator
      navigate('/login?error=oauth_failed');
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5">Processing login...</Typography>
        <CircularProgress />
      </Box>
    </Container>
  );
};

export default AuthCallbackPage; 