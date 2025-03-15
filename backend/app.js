const express = require('express');
const userRoutes = require('./routes/userRoutes');
const pathRoutes = require('./routes/pathRoutes');

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/paths', pathRoutes);

module.exports = app;