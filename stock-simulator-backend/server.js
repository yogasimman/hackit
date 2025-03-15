// server.js

const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Setup session middleware (use a strong secret in production)
app.use(session({
  secret: 'your_secret_key_here', // replace with a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set secure: true when using HTTPS in production
}));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: 'postgresql://openpg:openpgpwd@localhost:5432/HackDB'
  // Replace with your PostgreSQL connection string.
});

// ----------------------
// Market Simulator Logic
// ----------------------

// Global simulation state (for simplicity, one simulation at a time)
let simulationState = {
  currentDate: null,    // Current simulation date (YYYY-MM-DD)
  speed: null,          // Milliseconds per simulated day
  timer: null,          // Timer handle
  portfolio: [],        // Array of purchased stocks: { symbol, quantity, purchasePrice, currentPrice, currentValue }
  totalValue: 0         // Total portfolio value (sum of each stock’s currentValue)
};

// Utility function to increment a date string by one day
const incrementDate = (dateStr) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

// Function to update portfolio prices for the current simulation date.
// For each stock in simulationState.portfolio, query the respective table for the "Close" price.
const updatePortfolioPrices = async () => {
  let totalValue = 0;
  for (let stock of simulationState.portfolio) {
    const symbol = stock.symbol;
    // Assume the table is named exactly as the symbol.
    const query = `SELECT "Close" FROM "${symbol}" WHERE "Date" = $1`;
    try {
      const result = await pool.query(query, [simulationState.currentDate]);
      if (result.rows.length > 0) {
        stock.currentPrice = result.rows[0].Close;
        stock.currentValue = stock.quantity * stock.currentPrice;
      } else {
        // If no data exists for this date, keep previous price.
        stock.currentValue = stock.quantity * stock.currentPrice;
      }
      totalValue += stock.currentValue;
    } catch (err) {
      console.error(`Error updating price for ${symbol} on ${simulationState.currentDate}:`, err);
    }
  }
  simulationState.totalValue = totalValue;
};

// Endpoint to get stocks and their prices on a given date.
// For simplicity, we assume a predefined list of stock symbols.
app.post('/api/getStocksByDate', async (req, res) => {
  const { date } = req.body;
  const stocks = ["AAPL", "GOOG", "MSFT"]; // Update this list as needed.
  let stocksData = [];
  for (let symbol of stocks) {
    const query = `SELECT * FROM "${symbol}" WHERE "Date" = $1`;
    try {
      const result = await pool.query(query, [date]);
      if (result.rows.length > 0) {
        stocksData.push(result.rows[0]);
      }
    } catch (err) {
      console.error(`Error retrieving data for ${symbol} on ${date}:`, err);
    }
  }
  res.json({ stocks: stocksData });
});

// Endpoint to "buy" a stock: record a purchase in the simulation portfolio.
app.post('/api/buyStock', async (req, res) => {
  const { symbol, quantity, date } = req.body;
  const query = `SELECT "Close" FROM "${symbol}" WHERE "Date" = $1`;
  try {
    const result = await pool.query(query, [date]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No data for this stock on that date' });
    }
    const purchasePrice = result.rows[0].Close;
    // Add the stock to the simulation portfolio.
    simulationState.portfolio.push({
      symbol,
      quantity,
      purchasePrice,
      currentPrice: purchasePrice,
      currentValue: purchasePrice * quantity
    });
    res.json({ message: 'Stock purchased successfully', portfolio: simulationState.portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to buy stock' });
  }
});

// Endpoint to start the simulator
app.post('/api/startSimulator', (req, res) => {
  const { startDate, speed } = req.body;
  simulationState.currentDate = startDate;
  simulationState.speed = speed * 1000; // Convert seconds to milliseconds.
  // Clear any existing timer.
  if (simulationState.timer) clearInterval(simulationState.timer);
  simulationState.timer = setInterval(async () => {
    simulationState.currentDate = incrementDate(simulationState.currentDate);
    await updatePortfolioPrices();
    // Optionally, you could broadcast simulationState using WebSockets here.
    console.log(`Simulated Date: ${simulationState.currentDate}, Total Value: ${simulationState.totalValue}`);
  }, simulationState.speed);
  res.json({ message: 'Simulator started', simulationState });
});

// Endpoint to pause the simulator.
app.post('/api/pauseSimulator', (req, res) => {
  if (simulationState.timer) {
    clearInterval(simulationState.timer);
    simulationState.timer = null;
    res.json({ message: 'Simulator paused' });
  } else {
    res.status(400).json({ error: 'Simulator is not running' });
  }
});

// Endpoint to resume the simulator.
app.post('/api/resumeSimulator', (req, res) => {
  if (!simulationState.timer && simulationState.currentDate && simulationState.speed) {
    simulationState.timer = setInterval(async () => {
      simulationState.currentDate = incrementDate(simulationState.currentDate);
      await updatePortfolioPrices();
      console.log(`Simulated Date: ${simulationState.currentDate}, Total Value: ${simulationState.totalValue}`);
    }, simulationState.speed);
    res.json({ message: 'Simulator resumed' });
  } else {
    res.status(400).json({ error: 'Simulator is already running or not initialized' });
  }
});

// Endpoint to stop the simulator and reset simulation state.
app.post('/api/stopSimulator', (req, res) => {
  if (simulationState.timer) {
    clearInterval(simulationState.timer);
    simulationState.timer = null;
  }
  simulationState.currentDate = null;
  simulationState.speed = null;
  simulationState.portfolio = [];
  simulationState.totalValue = 0;
  res.json({ message: 'Simulator stopped' });
});

// Endpoint to get the current simulator status (for dynamic UI updates)
app.get('/api/simulatorStatus', (req, res) => {
  res.json({ simulationState });
});

// ----------------------
// Authentication Endpoints (unchanged)
// ----------------------

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    const user = result.rows[0];
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint with session creation
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ message: 'Login successful', user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Session endpoint for checking login status
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logout successful' });
  });
});


//kesav

// API to get user progress and levels
app.get('/api/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const xpResult = await pool.query('SELECT total_xp FROM user_xp WHERE user_id = $1', [userId]);
    const totalXp = xpResult.rows[0]?.total_xp || 0;
    const progressResult = await pool.query(
      `SELECT l.id, l.level_number, l.title, l.xp_required, 
              up.completed, up.current, up.xp_earned
       FROM levels l
       LEFT JOIN user_progress up ON l.id = up.level_id AND up.user_id = $1
       ORDER BY l.level_number`,
      [userId]
    );
    const levels = progressResult.rows.map((row) => ({
      id: row.id,
      levelNumber: row.level_number,
      title: row.title,
      xpRequired: row.xp_required,
      completed: row.completed || false,
      current: row.current || false,
      xpEarned: row.xp_earned || 0,
    }));
    res.json({ totalXp, levels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to get modules for a specific level
app.get('/api/modules/:levelId', async (req, res) => {
  const { levelId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM modules WHERE level_id = $1 ORDER BY order_number', [levelId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to get questions for a specific level
app.get('/api/questions/:levelId', async (req, res) => {
  const { levelId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM questions WHERE level_id = $1', [levelId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to submit user responses
app.post('/api/responses', async (req, res) => {
  const { userId, responses } = req.body;
  try {
    let allCorrect = true;
    for (const response of responses) {
      const { questionId, selectedOption } = response;
      const questionResult = await pool.query('SELECT correct_option FROM questions WHERE id = $1', [questionId]);
      const correctOption = questionResult.rows[0]?.correct_option;
      const isCorrect = selectedOption === correctOption;
      await pool.query(
        'INSERT INTO user_responses (user_id, question_id, selected_option, is_correct) VALUES ($1, $2, $3, $4)',
        [userId, questionId, selectedOption, isCorrect]
      );
      if (!isCorrect) {
        allCorrect = false;
      }
    }
    if (allCorrect) {
      await pool.query('UPDATE user_progress SET completed = TRUE, xp_earned = xp_earned + 100 WHERE user_id = $1 AND level_id = 1', [userId]);
      await pool.query('UPDATE user_xp SET total_xp = total_xp + 100 WHERE user_id = $1', [userId]);
    }
    res.json({ success: true, allCorrect });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------
// Catch-All Route: Serve index.html for any other request (for client-side routing)
// ----------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
