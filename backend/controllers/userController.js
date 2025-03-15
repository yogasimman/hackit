const User = require('../models/User')(require('../config/db'));

exports.registerUser = async (req, res) => {
  const { username, passwordHash, email } = req.body;
  try {
    const user = await User.createUser(username, passwordHash, email);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};