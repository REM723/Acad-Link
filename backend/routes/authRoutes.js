const express = require('express');
const router = express.Router();
const { login, signup } = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/signup', signup);

module.exports = router; 