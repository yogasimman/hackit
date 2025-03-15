// src/App.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import SimulationSetup from './components/SimulationSetup';
import Controls from './components/Controls';
import Dashboard from './components/Dashboard';
import io from 'socket.io-client';
import axios from 'axios';

// Connect to your backend (ensure the port matches your Node.js server)
const socket = io('http://localhost:3001');

function App() {
  const [simulationData, setSimulationData] = useState({
    currentDate: null,
    portfolio: [],
    portfolioValue: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    socket.on('simulationUpdate', (data) => {
      setSimulationData(data);
      // Append data point for the chart
      setChartData((prevData) => [...prevData, { date: data.currentDate, value: data.portfolioValue }]);
    });

    return () => {
      socket.off('simulationUpdate');
    };
  }, []);

  // Handlers for simulation controls
  const startSimulation = async (setupData) => {
    try {
      await axios.post('http://localhost:3001/simulation/start', setupData);
      setChartData([]); // Reset chart when simulation starts
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  const pauseSimulation = async () => {
    await axios.post('http://localhost:3001/simulation/pause');
  };

  const resumeSimulation = async () => {
    await axios.post('http://localhost:3001/simulation/resume');
  };

  const stopSimulation = async () => {
    await axios.post('http://localhost:3001/simulation/stop');
  };

  const updateSpeed = async (speed) => {
    await axios.post('http://localhost:3001/simulation/speed', { speed });
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Stock Market Simulator
        </Typography>
        <SimulationSetup onStart={startSimulation} />
        <Controls onPause={pauseSimulation} onResume={resumeSimulation} onStop={stopSimulation} onSpeedChange={updateSpeed} />
        <Dashboard simulationData={simulationData} chartData={chartData} />
      </Box>
    </Container>
  );
}

export default App;
