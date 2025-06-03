const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { getDashboardData, applyLeave } = require('../controllers/studentController');

// All routes require authentication and student role
router.use(authMiddleware);
router.use(roleMiddleware(['student']));

// Protected routes
router.get('/dashboard', getDashboardData);
router.post('/leave', applyLeave);

module.exports = router; 