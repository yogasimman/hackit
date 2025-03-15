// src/components/SimulationSetup.js
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Grid } from '@mui/material';

const SimulationSetup = ({ onStart }) => {
  const [startDate, setStartDate] = useState('2020-01-01');
  const [speed, setSpeed] = useState(1);
  const [portfolio, setPortfolio] = useState([
    { ticker: 'AAPL', quantity: 10 },
    { ticker: 'GOOG', quantity: 5 }
  ]);

  const handleStart = () => {
    onStart({ startDate, portfolio, speed });
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Simulation Setup
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Simulation Speed (sec/day)"
              type="number"
              fullWidth
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </Grid>
        </Grid>
        <Box mt={2}>
          <Typography variant="subtitle1">Portfolio (Ticker & Quantity):</Typography>
          {portfolio.map((stock, index) => (
            <Grid container spacing={1} key={index} alignItems="center">
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Ticker"
                  fullWidth
                  value={stock.ticker}
                  onChange={(e) => {
                    const newPortfolio = [...portfolio];
                    newPortfolio[index].ticker = e.target.value.toUpperCase();
                    setPortfolio(newPortfolio);
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={stock.quantity}
                  onChange={(e) => {
                    const newPortfolio = [...portfolio];
                    newPortfolio[index].quantity = Number(e.target.value);
                    setPortfolio(newPortfolio);
                  }}
                />
              </Grid>
            </Grid>
          ))}
        </Box>
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleStart}>
            Start Simulation
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SimulationSetup;
