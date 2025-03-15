const express = require('express');
const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes'); // Renamed for clarity [[7]]

const app = express();

app.use(express.json());
app.use('/', userRoutes);    // User authentication/profiles
app.use('/', stockRoutes);  // Stock trading endpoints

module.exports = app;