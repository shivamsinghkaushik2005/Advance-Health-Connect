import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Rating,
  Divider,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Pagination,
  Stack
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';

const DoctorReviews = ({ doctorId }) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/reviews/doctor/${doctorId}`);
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.response?.data?.message || t('common.error'));
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchReviews();
    }
  }, [doctorId, t]);

  // Calculate pagination
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const displayedReviews = reviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        {t('reviews.noReviews')}
      </Alert>
    );
  }

  return (
    <Box>
      {displayedReviews.map((review) => (
        <Card key={review._id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar 
                src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 70)}.jpg`}
                alt={review.patient?.name || 'Patient'}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {review.patient?.name || t('reviews.anonymousPatient')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {review.createdAt ? format(new Date(review.createdAt), 'PPP') : ''}
                </Typography>
              </Box>
            </Box>
            
            <Rating value={review.rating} precision={0.5} readOnly size="small" />
            
            {review.comment && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {review.comment}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
      
      {totalPages > 1 && (
        <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Stack>
      )}
    </Box>
  );
};

export default DoctorReviews;