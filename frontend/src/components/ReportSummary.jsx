import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

const ReportSummary = ({ summary }) => {
  const fields = {
    bloodPressure: 'Blood Pressure',
    bloodSugar: 'Blood Sugar',
    hemoglobin: 'Hemoglobin',
    cholesterol: 'Cholesterol',
    rbc: 'RBC Count',
    wbc: 'WBC Count',
    platelets: 'Platelet Count',
    uricAcid: 'Uric Acid',
    creatinine: 'Creatinine',
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">Report Summary</Typography>
      <Grid container spacing={2}>
        {Object.entries(fields).map(([key, label]) => (
          <Grid item xs={6} sm={4} key={key}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">{label}</Typography>
                <Typography variant="body1" color="primary">
                  {summary[key] || 'Not Found'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportSummary;

