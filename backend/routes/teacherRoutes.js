const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const {
    getDashboardData,
    createExam,
    updateStudentMarks,
    handleLeaveApplication
} = require('../controllers/teacherController');

// All routes require authentication and teacher role
router.use(authMiddleware);
router.use(roleMiddleware(['teacher']));

// Protected routes
router.get('/dashboard', getDashboardData);
router.post('/exams', createExam);
router.put('/marks', updateStudentMarks);
router.put('/leave/:id', handleLeaveApplication);

module.exports = router; 