import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const ReviewForm = ({ doctorId, appointmentId, onReviewSubmitted }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError(t('reviews.ratingRequired'));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.post(
        '/api/reviews',
        {
          doctorId,
          appointmentId,
          rating,
          comment
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess(true);
      setLoading(false);
      
      // Call the callback function if provided
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
      
      // Reset form after successful submission
      setTimeout(() => {
        setRating(0);
        setComment('');
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || t('common.error'));
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('reviews.writeReview')}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('reviews.reviewSubmitted')}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography component="legend">
            {t('reviews.rateExperience')}
          </Typography>
          <Rating
            name="doctor-rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
            precision={0.5}
          />
        </Box>
        
        <TextField
          label={t('reviews.yourComment')}
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          variant="outlined"
          placeholder={t('reviews.commentPlaceholder')}
          sx={{ mb: 3 }}
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || success}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? t('common.submitting') : t('reviews.submitReview')}
        </Button>
      </form>
    </Paper>
  );
};

export default ReviewForm;