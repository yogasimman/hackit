// server.js

const express = require('express');
const path = require('path');
const { Pool } = require('pg');  // PostgreSQL client

const app = express();

// PostgreSQL connection using your Supabase credentials
const pool = new Pool({
  connectionString: 'postgresql://postgres:tbrVYiovdaQg7tlA@db.solcqvybycsrjyvmzxfx.supabase.co:5432/postgres'
});

// Middleware to parse JSON bodies (if you plan to add more API endpoints)
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Example API endpoint to test database connectivity
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Catch-all route to serve index.html (for a single-page application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server on the specified port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
