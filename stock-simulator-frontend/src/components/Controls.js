// src/components/Controls.js
import React, { useState } from 'react';
import { Box, Button, Slider, Typography, Card, CardContent, Grid } from '@mui/material';

const Controls = ({ onPause, onResume, onStop, onSpeedChange }) => {
  const [speed, setSpeed] = useState(1);

  const handleSliderChange = (event, newValue) => {
    setSpeed(newValue);
    onSpeedChange(newValue);
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Controls
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={onPause}>
              Pause
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="success" onClick={onResume}>
              Resume
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="error" onClick={onStop}>
              Stop
            </Button>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography gutterBottom>Adjust Simulation Speed (sec/day): {speed}</Typography>
          <Slider
            value={speed}
            onChange={handleSliderChange}
            min={0.1}
            max={5}
            step={0.1}
            valueLabelDisplay="auto"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default Controls;
