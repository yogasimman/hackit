const express = require('express');
const pathController = require('../controllers/pathController');

const router = express.Router();

router.get('/', pathController.getAllPaths);

module.exports = router;