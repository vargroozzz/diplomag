import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, t('auth.usernameLengthError', 'Username must be at least 3 characters'))
        .required(t('auth.username') + ' ' + t('common.requiredError')),
      email: Yup.string()
        .email(t('auth.invalidEmail', 'Invalid email address'))
        .required(t('auth.email') + ' ' + t('common.requiredError')),
      password: Yup.string()
        .min(6, t('auth.passwordLengthError', 'Password must be at least 6 characters'))
        .required(t('auth.password') + ' ' + t('common.requiredError')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], t('auth.passwordsMustMatch', 'Passwords must match'))
        .required(t('auth.confirmPassword') + ' ' + t('common.requiredError')),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      setSuccessMessage(null);
      try {
        await register(values.username, values.email, values.password);
        setSuccessMessage(t('auth.registerSuccessMessage', 'Registration successful. Please check your email to verify your account.'));
        formik.resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('auth.registrationFailed', 'Registration failed. Please try again.'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            {t('auth.register')}
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}

          {!successMessage && (
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ mt: 3, width: '100%' }}
            >
              <TextField
                margin="normal"
                fullWidth
                id="username"
                label={t('auth.username')}
                name="username"
                autoComplete="username"
                autoFocus
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                disabled={formik.isSubmitting}
              />
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label={t('auth.email')}
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={formik.isSubmitting}
              />
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label={t('auth.password')}
                type="password"
                id="password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                disabled={formik.isSubmitting}
              />
              <TextField
                margin="normal"
                fullWidth
                name="confirmPassword"
                label={t('auth.confirmPassword')}
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                disabled={formik.isSubmitting}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? <CircularProgress size={24} /> : t('auth.register')}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                >
                  {t('auth.alreadyHaveAccount')}
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 