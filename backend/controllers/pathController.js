const Path = require('../models/Path')(require('../config/db'));

exports.getAllPaths = async (req, res) => {
  try {
    const paths = await Path.getAllPaths();
    res.status(200).json(paths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};