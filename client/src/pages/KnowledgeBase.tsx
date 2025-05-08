import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Chip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Beginner\'s Guide to Beekeeping',
    description: 'A comprehensive guide covering the basics of beekeeping, from setting up your first hive to harvesting honey.',
    category: 'Getting Started',
    tags: ['beginner', 'hive setup', 'basics'],
    url: '/resources/beginners-guide',
  },
  {
    id: '2',
    title: 'Hive Health Management',
    description: 'Learn how to identify and prevent common hive diseases and pests.',
    category: 'Health & Safety',
    tags: ['diseases', 'pests', 'prevention'],
    url: '/resources/hive-health',
  },
  {
    id: '3',
    title: 'Seasonal Beekeeping Calendar',
    description: 'Month-by-month guide to beekeeping tasks and activities throughout the year.',
    category: 'Seasonal Care',
    tags: ['calendar', 'seasonal', 'maintenance'],
    url: '/resources/seasonal-calendar',
  },
];

const KnowledgeBase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t } = useTranslation();

  const categories = Array.from(new Set(mockResources.map(resource => resource.category)));

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('knowledgeBase.title')}
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('knowledgeBase.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={t('knowledgeBase.categories') + ': ' + t('common.all')}
            onClick={() => setSelectedCategory(null)}
            color={selectedCategory === null ? 'primary' : 'default'}
            variant={selectedCategory === null ? 'filled' : 'outlined'}
          />
          {categories.map((category) => (
            <Chip
              key={category}
              label={t(`knowledgeBase.category.${category}`, category)}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {filteredResources.map((resource) => (
            <Card key={resource.id}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t(`knowledgeBase.resourceTitle.${resource.id}`, resource.title)}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t(`knowledgeBase.resourceDescription.${resource.id}`, resource.description)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {resource.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={t(`knowledgeBase.tag.${tag}`, tag)}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="primary">
                  {t(`knowledgeBase.category.${resource.category}`, resource.category)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default KnowledgeBase; 