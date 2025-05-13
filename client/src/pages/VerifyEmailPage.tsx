import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Button, TextField } from '@mui/material';
import { useVerifyEmailMutation, useResendVerificationEmailMutation } from '../store/api/authApi';
import { useTranslation } from 'react-i18next';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [verifyEmail, { isLoading: isVerifying, isSuccess: isVerificationSuccess, isError: isVerificationError }] = useVerifyEmailMutation();
  const [
    resendVerificationEmail, 
    { isLoading: isResending, isSuccess: isResendSuccess, isError: isResendError }
  ] = useResendVerificationEmailMutation();

  const [message, setMessage] = useState<string | null>(null);
  const [showResendForm, setShowResendForm] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');
  const [resendAttempted, setResendAttempted] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setMessage(t('verifyEmail.verifying', 'Verifying your email...'));
      verifyEmail({ token })
        .unwrap()
        .then(() => {
          setMessage(t('verifyEmail.success', 'Email verified successfully! You can now log in.'));
          setShowResendForm(false);
        })
        .catch((err) => {
          const errorMessage = err?.data?.message || t('verifyEmail.error', 'Failed to verify email. The token might be invalid or expired.');
          setMessage(errorMessage);
          if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
            setShowResendForm(true);
          }
          console.error('Email verification error:', err);
        });
    } else {
      setMessage(t('verifyEmail.missingToken', 'Verification token not found in URL.'));
      setShowResendForm(true); // Show resend form if token is missing
    }
  }, [searchParams, verifyEmail, t]);

  const handleResendEmail = async () => {
    if (!emailForResend) {
      setMessage(t('verifyEmail.enterEmailForResend', 'Please enter your email address to resend the verification link.'));
      return;
    }
    setResendAttempted(true);
    setMessage(null); // Clear previous messages
    try {
      await resendVerificationEmail({ email: emailForResend }).unwrap();
      setMessage(t('verifyEmail.resendSuccess', 'A new verification email has been sent. Please check your inbox.'));
      setShowResendForm(false); // Optionally hide form on success
    } catch (err: any) {
      const errorMessage = err?.data?.message || t('verifyEmail.resendError', 'Failed to resend verification email.');
      setMessage(errorMessage);
      console.error('Resend verification email error:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('verifyEmail.title', 'Email Verification')}
      </Typography>
      <Box sx={{ mt: 4 }}>
        {(isVerifying || (resendAttempted && isResending)) && (
          <> 
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              {isVerifying ? t('verifyEmail.verifying', 'Verifying your email...') : t('verifyEmail.resending', 'Resending verification email...')}
            </Typography>
          </>
        )}

        {message && !isResending && ( // Display general messages if not in resending loading state
          <Alert 
            severity={
              isVerificationSuccess || (resendAttempted && isResendSuccess) ? 'success' : 
              isVerificationError || (resendAttempted && isResendError) ? 'error' : 
              'info'
            } 
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}

        {!isVerifying && isVerificationSuccess && (
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/login')}
          >
            {t('auth.login', 'Login')}
          </Button>
        )}

        {showResendForm && !isVerificationSuccess && !isVerifying && (
          <Box sx={{ mt: 3, p: 2, border: '1px solid grey', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              {t('verifyEmail.resendTitle', 'Resend Verification Email')}
            </Typography>
            <TextField
              fullWidth
              label={t('auth.email', 'Email Address')}
              variant="outlined"
              value={emailForResend}
              onChange={(e) => setEmailForResend(e.target.value)}
              sx={{ mb: 2 }}
              disabled={isResending}
            />
            <Button 
              variant="contained" 
              onClick={handleResendEmail}
              disabled={isResending || !emailForResend}
            >
              {isResending ? t('common.loading', 'Loading...') : t('verifyEmail.resendButton', 'Resend Email')}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmailPage; 