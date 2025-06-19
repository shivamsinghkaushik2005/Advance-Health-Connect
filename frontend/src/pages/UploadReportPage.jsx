import React, { useState } from 'react';
import { Box, Button, Typography, Input, CircularProgress, Alert } from '@mui/material';
import ReportSummary from '../components/ReportSummary';
import axios from 'axios';

const UploadReportPage = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a report image first.');
      return;
    }

    const formData = new FormData();
    formData.append('report', file);

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('/api/health-report/upload-report', formData);
      if (response.data.success) {
        setSummary(response.data.summary);
      } else {
        setError('Failed to process the report.');
      }
    } catch (err) {
      setError('Something went wrong while uploading the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upload Your Health Report
      </Typography>

      <Input type="file" onChange={handleFileChange} />
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Summarize Report'}
        </Button>
      </Box>

      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {summary && (
        <Box mt={4}>
          <ReportSummary summary={summary} />
        </Box>
      )}
    </Box>
  );
};

export default UploadReportPage;

