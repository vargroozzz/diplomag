import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Paper } from '@mui/material';
import { useAskFaqMutation } from '../../store/api/faqApi'; // Corrected path assuming FaqSection is in components/faq
import { useTranslation } from 'react-i18next';

const FaqSection: React.FC = () => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askFaq, { isLoading, error, reset }] = useAskFaqMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAnswer(''); // Clear previous answer
    reset(); // Reset error state from previous mutation
    try {
      const result = await askFaq({ question }).unwrap();
      setAnswer(result.answer);
    } catch (err) {
      console.error("FAQ error:", err);
      // The actual error message from the backend (e.g., API key issue) might be in err.data.message
      const errorMessage = (err as any)?.data?.message || t('faq.defaultError', "An error occurred while fetching the answer.");
      setAnswer(errorMessage); // Display error as answer for simplicity, or use a separate error state
    }
  };

  return (
    <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('faq.title', 'Frequently Asked Questions (AI Powered)')}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label={t('faq.questionLabel', 'Ask your question here...')}
          variant="outlined"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          sx={{ mb: 2 }}
          multiline
          minRows={2}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={isLoading || !question.trim()}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {isLoading ? <CircularProgress size={24} sx={{mr: 1}} /> : null}
          {t('faq.submitButton', 'Ask AI Assistant')}
        </Button>
      </Box>
      { (answer || error) && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: error && !answer.startsWith('Вибачте') ? 'error.lighter' : 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            {t('faq.answerTitle', 'Answer:')}
          </Typography>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{answer}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FaqSection; 