const db = require('../config/db');

const getDashboardData = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Get student's courses
        const [courses] = await db.query(`
            SELECT c.*, e.marks 
            FROM courses c
            LEFT JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = ?
        `, [studentId]);

        // Get upcoming exams
        const [exams] = await db.query(`
            SELECT e.*, c.name as course_name
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            JOIN enrollments en ON c.id = en.course_id
            WHERE en.student_id = ? AND e.date > NOW()
            ORDER BY e.date ASC
        `, [studentId]);

        // Get attendance
        const [attendance] = await db.query(`
            SELECT a.*, c.name as course_name
            FROM attendance a
            JOIN courses c ON a.course_id = c.id
            WHERE a.student_id = ?
            ORDER BY a.date DESC
            LIMIT 10
        `, [studentId]);

        res.json({
            courses,
            exams,
            attendance
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const applyLeave = async (req, res) => {
    try {
        const { course_id, start_date, end_date, reason } = req.body;
        const studentId = req.user.id;

        // Check if student is enrolled in the course
        const [enrollment] = await db.query(
            'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
            [studentId, course_id]
        );

        if (enrollment.length === 0) {
            return res.status(400).json({ message: 'Not enrolled in this course' });
        }

        // Insert leave application
        await db.query(
            'INSERT INTO leave_applications (student_id, course_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
            [studentId, course_id, start_date, end_date, reason, 'pending']
        );

        res.status(201).json({ message: 'Leave application submitted successfully' });
    } catch (error) {
        console.error('Leave application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getDashboardData, applyLeave }; 