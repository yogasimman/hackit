/*
 * server.js
 * Node.js backend for Stock Market Simulator
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }  // Allow all origins for development; adjust in production
});

app.use(express.json());

let simulationTimer = null;
let simulationState = {
  currentDate: null,     // Simulation’s current date (YYYY-MM-DD)
  portfolio: [],         // List of stocks (ticker, quantity, etc.)
  speed: 1000,           // Speed in milliseconds (default: 1 second per simulated day)
  paused: false,
  historicalData: {}     // Structure: { ticker: { 'YYYY-MM-DD': price, ... } }
};

// Function to fetch historical data for a given ticker using Yahoo Finance API
async function fetchHistoricalData(ticker, startDate) {
  try {
    const period1 = Math.floor(new Date(startDate).getTime() / 1000);
    const period2 = Math.floor(Date.now() / 1000); // Using current time as the end date
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d`;
    const response = await axios.get(url);
    const result = response.data.chart.result[0];
    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0].close;
    let historicalData = {};
    timestamps.forEach((timestamp, i) => {
      // Convert Unix timestamp to YYYY-MM-DD format
      const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
      historicalData[date] = prices[i];
    });
    return historicalData;
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error.message);
    return {};
  }
}

// Initialize historical data for all stocks in the portfolio
async function initializeHistoricalData(portfolio, startDate) {
  const historicalData = {};
  await Promise.all(
    portfolio.map(async stock => {
      historicalData[stock.ticker] = await fetchHistoricalData(stock.ticker, startDate);
    })
  );
  return historicalData;
}

// Simulation engine: advances one simulated day per tick
function simulateDay() {
  if (simulationState.paused) return;

  // Advance simulation date by 1 day
  simulationState.currentDate = moment(simulationState.currentDate)
    .add(1, 'days')
    .format('YYYY-MM-DD');

  let portfolioValue = 0;
  simulationState.portfolio = simulationState.portfolio.map(stock => {
    const tickerData = simulationState.historicalData[stock.ticker];
    let newPrice = tickerData ? tickerData[simulationState.currentDate] : null;
    if (!newPrice) {
      // If no price data is available for the new date, use the last known price
      newPrice = stock.lastPrice || 0;
    }
    stock.lastPrice = newPrice;
    stock.value = newPrice * stock.quantity;
    portfolioValue += stock.value;
    return stock;
  });

  // Emit the updated simulation data to all connected clients
  io.emit('simulationUpdate', {
    currentDate: simulationState.currentDate,
    portfolio: simulationState.portfolio,
    portfolioValue: portfolioValue
  });
}

// --- API Endpoints ---

// Start Simulation: Initializes state, fetches historical data, and starts the simulation timer
app.post('/simulation/start', async (req, res) => {
  const { startDate, portfolio, speed } = req.body;
  simulationState.currentDate = startDate;
  simulationState.portfolio = portfolio.map(stock => ({
    ...stock,
    lastPrice: 0,
    value: 0
  }));
  simulationState.speed = speed * 1000; // Convert seconds to milliseconds
  simulationState.paused = false;

  // Fetch historical data for each stock in the portfolio
  simulationState.historicalData = await initializeHistoricalData(simulationState.portfolio, startDate);

  // Start the simulation timer (clear any previous timer)
  if (simulationTimer) clearInterval(simulationTimer);
  simulationTimer = setInterval(simulateDay, simulationState.speed);
  res.json({ message: 'Simulation started' });
});

// Pause Simulation
app.post('/simulation/pause', (req, res) => {
  simulationState.paused = true;
  res.json({ message: 'Simulation paused' });
});

// Resume Simulation
app.post('/simulation/resume', (req, res) => {
  simulationState.paused = false;
  res.json({ message: 'Simulation resumed' });
});

// Stop Simulation: Clears the simulation timer
app.post('/simulation/stop', (req, res) => {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
  res.json({ message: 'Simulation stopped' });
});

// Update Simulation Speed dynamically
app.post('/simulation/speed', (req, res) => {
  const { speed } = req.body;
  simulationState.speed = speed * 1000;
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = setInterval(simulateDay, simulationState.speed);
  }
  res.json({ message: 'Speed updated' });
});

// Start the Node.js server on port 3001
server.listen(3001, () => {
  console.log('Server running on port 3001');
});
