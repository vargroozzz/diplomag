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
import { Link as RouterLink } from 'react-router-dom';

const features = [
  {
    title: 'Forum',
    description: 'Connect with fellow beekeepers, share experiences, and get advice.',
    icon: <ForumIcon sx={{ fontSize: 40 }} />,
    link: '/forums',
  },
  {
    title: 'Knowledge Base',
    description: 'Access comprehensive guides and resources about beekeeping.',
    icon: <BookIcon sx={{ fontSize: 40 }} />,
    link: '/knowledge',
  },
  {
    title: 'Hive Management',
    description: 'Track and manage your hives with our digital tools.',
    icon: <HiveIcon sx={{ fontSize: 40 }} />,
    link: '/hives',
  },
];

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Beekeepers Community
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Connect, learn, and grow with fellow beekeepers
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 8 }}>
        {features.map((feature) => (
          <Card key={feature.title} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, color: 'primary.main' }}>{feature.icon}</Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                {feature.description}
              </Typography>
              <Button
                component={RouterLink}
                to={feature.link}
                variant="contained"
                size="large"
                sx={{ mt: 'auto' }}
              >
                Explore {feature.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Home; 