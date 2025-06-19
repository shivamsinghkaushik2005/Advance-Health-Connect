import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Modal,
  IconButton,
  Paper,
  useTheme
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  Chat as ChatIcon,
  Videocam as VideocamIcon,
  Star as StarIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import ReviewForm from './ReviewForm';

const PatientAppointmentCard = ({ 
  appointment, 
  onChatClick, 
  onVideoClick,
  onReviewSubmitted
 }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return theme.palette.info.main;
      case 'completed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const handleOpenReviewModal = () => {
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
  };

  const handleReviewSubmitted = () => {
    handleCloseReviewModal();
    if (onReviewSubmitted) {
      onReviewSubmitted();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          bgcolor: 'background.paper',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight="medium">
            Dr. {appointment.doctorId.name}
          </Typography>
          <Chip
            size="small"
            label={appointment.status}
            sx={{
              bgcolor: `${getStatusColor(appointment.status)}15`,
              color: getStatusColor(appointment.status),
              fontWeight: 500
            }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2} mt={1} mb={2}>
          <Box display="flex" alignItems="center">
            <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <TimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {appointment.startTime} - {appointment.endTime}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={() => onChatClick(appointment)}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                bgcolor: `${theme.palette.primary.main}10`
              }
            }}
          >
            {t('appointments.chat')}
          </Button>
          
          <Button
            size="small"
            variant="outlined"
            startIcon={<VideocamIcon />}
            onClick={() => onVideoClick(appointment)}
            sx={{
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              '&:hover': {
                borderColor: theme.palette.success.dark,
                bgcolor: `${theme.palette.success.main}10`
              }
            }}
          >
            {t('appointments.videoConsultation')}
          </Button>

          {/* Review button - only show for completed appointments */}
          {appointment.status.toLowerCase() === 'completed' && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<StarIcon />}
              onClick={handleOpenReviewModal}
              sx={{
                borderColor: theme.palette.warning.main,
                color: theme.palette.warning.main,
                '&:hover': {
                  borderColor: theme.palette.warning.dark,
                  bgcolor: `${theme.palette.warning.main}10`
                }
              }}
            >
              {t('doctors.leaveReview')}
            </Button>
          )}
        </Box>
      </Box>

      {/* Review Modal */}
      <Modal
        open={reviewModalOpen}
        onClose={handleCloseReviewModal}
        aria-labelledby="review-modal-title"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 },
            maxHeight: '90vh',
            overflow: 'auto',
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography id="review-modal-title" variant="h6" component="h2">
              {t('doctors.reviewDoctor')}
            </Typography>
            <IconButton onClick={handleCloseReviewModal} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <ReviewForm
            doctorId={appointment.doctorId._id}
            appointmentId={appointment._id}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </Paper>
      </Modal>
    </Box>
  );
};

export default PatientAppointmentCard;