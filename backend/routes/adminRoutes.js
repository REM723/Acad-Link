const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { createUser } = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Protected routes
router.post('/users', createUser);

module.exports = router; 