import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
} from '@mui/material';
import {
  Hive as HiveIcon,
  Forum as ForumIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const features = [
    {
      key: 'forum',
      title: t('home.features.forum.title', 'Forum'),
      description: t('home.features.forum.description', 'Connect with fellow beekeepers, share experiences, and get advice.'),
      icon: <ForumIcon sx={{ fontSize: 40 }} />,
      link: '/forums',
      protected: true,
    },
    {
      key: 'knowledgeBase',
      title: t('home.features.knowledgeBase.title', 'Knowledge Base'),
      description: t('home.features.knowledgeBase.description', 'Access comprehensive guides and resources about beekeeping.'),
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      link: '/knowledge-base',
      protected: true,
    },
    {
      key: 'mapManagement',
      title: t('home.features.mapManagement.title', 'Hive & Field Map'),
      description: t('home.features.mapManagement.description', 'Manage your hives and fields with our interactive map tools.'),
      icon: <HiveIcon sx={{ fontSize: 40 }} />,
      link: '/map',
      protected: true,
    },
  ];

  const handleFeatureClick = (link: string, isProtected: boolean) => {
    if (isProtected && !isAuthenticated) {
      navigate('/login');
    } else {
      navigate(link);
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="calc(100vh - 64px - 56px - 48px)"
      textAlign="center"
      width="100%"
      sx={{ pt: {xs: 2, md: 0}, pb: {xs: 2, md: 0} }}
    >
      <Container maxWidth="md">
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Typography variant="h2" component="h1" gutterBottom>
            {t('home.welcomeTitle', 'Welcome to Beekeepers Community')}
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            {t('home.welcomeSubtitle', 'Connect, learn, and grow with fellow beekeepers')}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 4 }, mb: 8 }}>
          {features.map((feature) => (
            <Card key={feature.key} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ mb: 2, color: 'primary.main' }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                </Box>
                <Button
                  onClick={() => handleFeatureClick(feature.link, feature.protected)}
                  variant="contained"
                  size="large"
                  sx={{ mt: 'auto' }}
                >
                  {t('home.exploreButton', 'Explore')} {feature.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 