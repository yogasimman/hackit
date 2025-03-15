// src/components/Dashboard.js
import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import PortfolioChart from './PortfolioChart';

const Dashboard = ({ simulationData, chartData }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Portfolio Dashboard
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1">Current Date:</Typography>
            <Typography variant="h6">{simulationData.currentDate || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1">Total Portfolio Value:</Typography>
            <Typography variant="h6">
              ${simulationData.portfolioValue ? simulationData.portfolioValue.toFixed(2) : '0.00'}
            </Typography>
          </Grid>
        </Grid>
        <Box mt={4}>
          <PortfolioChart chartData={chartData} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
