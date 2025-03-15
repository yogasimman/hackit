const express = require('express');
const router = express.Router();

// Sample stock trading routes
router.get('/', (req, res) => {
  res.send('List all stocks'); // Fetch stock data
});

router.post('/buy', (req, res) => {
  res.send('Buy stock endpoint'); // Handle stock purchase
});

router.post('/sell', (req, res) => {
  res.send('Sell stock endpoint'); // Handle stock sale
});

module.exports = router;