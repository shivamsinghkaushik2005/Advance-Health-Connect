import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const DoctorImageUpload = ({ doctorId, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      setPreview('');
      return;
    }
    
    // Validate file type
    const fileType = file.type;
    if (!fileType.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('Please select a valid image file (JPG, PNG, WEBP)');
      setSelectedFile(null);
      setPreview('');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setSelectedFile(null);
      setPreview('');
      return;
    }
    
    setSelectedFile(file);
    setError('');
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `/api/doctors/${doctorId}/upload-image`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Profile image uploaded successfully!');
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data.image);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderWidth: 2,
          mb: 2,
          background: '#fafafa'
        }}
      >
        {preview ? (
          <Box sx={{ position: 'relative' }}>
            <img 
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                display: 'block',
                margin: '0 auto',
                borderRadius: '4px'
              }}
            />
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => {
                setSelectedFile(null);
                setPreview('');
              }}
            >
              Remove
            </Button>
          </Box>
        ) : (
          <>
            <CloudUploadIcon fontSize="large" color="primary" />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Click to select or drag and drop your profile image
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: JPG, PNG, WEBP (Max 5MB)
            </Typography>
          </>
        )}
        
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: preview ? -1 : 1
          }}
          disabled={loading}
        />
      </Paper>
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={!selectedFile || loading}
        onClick={handleUpload}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Uploading...' : 'Upload Profile Image'}
      </Button>
    </Box>
  );
};

export default DoctorImageUpload; 