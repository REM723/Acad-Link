const db = require('../config/db');

const getDashboardData = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // Get teacher's courses
        const [courses] = await db.query(
            'SELECT * FROM courses WHERE teacher_id = ?',
            [teacherId]
        );

        // Get upcoming exams for teacher's courses
        const [exams] = await db.query(`
            SELECT e.*, c.name as course_name
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            WHERE c.teacher_id = ? AND e.date > NOW()
            ORDER BY e.date ASC
        `, [teacherId]);

        // Get recent leave applications
        const [leaveApplications] = await db.query(`
            SELECT la.*, s.username as student_name, c.name as course_name
            FROM leave_applications la
            JOIN students s ON la.student_id = s.id
            JOIN courses c ON la.course_id = c.id
            WHERE c.teacher_id = ?
            ORDER BY la.created_at DESC
            LIMIT 10
        `, [teacherId]);

        res.json({
            courses,
            exams,
            leaveApplications
        });
    } catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createExam = async (req, res) => {
    try {
        const { course_id, title, description, date, duration, total_marks } = req.body;
        const teacherId = req.user.id;

        // Verify teacher owns the course
        const [course] = await db.query(
            'SELECT * FROM courses WHERE id = ? AND teacher_id = ?',
            [course_id, teacherId]
        );

        if (course.length === 0) {
            return res.status(403).json({ message: 'Not authorized to create exam for this course' });
        }

        // Create exam
        await db.query(
            'INSERT INTO exams (course_id, title, description, date, duration, total_marks) VALUES (?, ?, ?, ?, ?, ?)',
            [course_id, title, description, date, duration, total_marks]
        );

        res.status(201).json({ message: 'Exam created successfully' });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateStudentMarks = async (req, res) => {
    try {
        const { student_id, course_id, marks } = req.body;
        const teacherId = req.user.id;

        // Verify teacher owns the course
        const [course] = await db.query(
            'SELECT * FROM courses WHERE id = ? AND teacher_id = ?',
            [course_id, teacherId]
        );

        if (course.length === 0) {
            return res.status(403).json({ message: 'Not authorized to update marks for this course' });
        }

        // Update marks
        await db.query(
            'UPDATE enrollments SET marks = ? WHERE student_id = ? AND course_id = ?',
            [marks, student_id, course_id]
        );

        res.json({ message: 'Marks updated successfully' });
    } catch (error) {
        console.error('Update marks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const handleLeaveApplication = async (req, res) => {
    try {
        const { leave_id, status } = req.body;
        const teacherId = req.user.id;

        // Verify teacher owns the course for this leave application
        const [leave] = await db.query(`
            SELECT la.* FROM leave_applications la
            JOIN courses c ON la.course_id = c.id
            WHERE la.id = ? AND c.teacher_id = ?
        `, [leave_id, teacherId]);

        if (leave.length === 0) {
            return res.status(403).json({ message: 'Not authorized to handle this leave application' });
        }

        // Update leave application status
        await db.query(
            'UPDATE leave_applications SET status = ? WHERE id = ?',
            [status, leave_id]
        );

        res.json({ message: 'Leave application status updated successfully' });
    } catch (error) {
        console.error('Handle leave application error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboardData,
    createExam,
    updateStudentMarks,
    handleLeaveApplication
}; 