import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { useVerifyEmailMutation } from '../store/api/authApi';
import { useTranslation } from 'react-i18next';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [verifyEmail, { isLoading, isSuccess, isError }] = useVerifyEmailMutation();
  const [message, setMessage] = useState<string | null>(null);
  const [tokenExists, setTokenExists] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    setMessage(t('verifyEmail.verifying', 'Verifying your email...'));
    setTokenExists(!!token);

    if (token) {
      verifyEmail({ token })
        .unwrap()
        .then(() => {
          setMessage(t('verifyEmail.success', 'Email verified successfully! You can now log in.'));
        })
        .catch((err) => {
          const errorMessage = err?.data?.message || t('verifyEmail.error', 'Failed to verify email. The token might be invalid or expired.');
          setMessage(errorMessage);
          console.error('Email verification error:', err);
        });
    } else {
      setMessage(t('verifyEmail.missingToken', 'Verification token not found.'));
    }
  }, [searchParams, verifyEmail, t]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('verifyEmail.title', 'Email Verification')}
      </Typography>
      <Box sx={{ mt: 4 }}>
        {isLoading && (
          <> 
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>{message}</Typography>
          </>
        )}
        {!isLoading && isSuccess && (
          <>
            <Alert severity="success">{message}</Alert>
            <Button 
              variant="contained" 
              sx={{ mt: 3 }}
              onClick={() => navigate('/login')}
            >
              {t('auth.login')}
            </Button>
          </>
        )}
        {!isLoading && (isError || !tokenExists) && (
          <Alert severity="error">{message}</Alert>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmailPage; 