const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getDashboardData = async (req, res) => {
    try {
        // Get total counts
        const [counts] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
                (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
                (SELECT COUNT(*) FROM courses) as total_courses,
                (SELECT COUNT(*) FROM exams) as total_exams
        `);

        // Get recent activities
        const [activities] = await db.query(`
            SELECT 
                'user' as type,
                u.username,
                u.role,
                u.created_at as timestamp
            FROM users u
            UNION ALL
            SELECT 
                'course' as type,
                c.name as username,
                'course' as role,
                c.created_at as timestamp
            FROM courses c
            ORDER BY timestamp DESC
            LIMIT 10
        `);

        res.json({
            counts: counts[0],
            activities
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, role, email } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await db.query(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role, email]
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createCourse = async (req, res) => {
    try {
        const { name, description, teacher_id } = req.body;

        // Verify teacher exists
        const [teacher] = await db.query(
            'SELECT * FROM users WHERE id = ? AND role = "teacher"',
            [teacher_id]
        );

        if (teacher.length === 0) {
            return res.status(400).json({ message: 'Invalid teacher ID' });
        }

        // Create course
        await db.query(
            'INSERT INTO courses (name, description, teacher_id) VALUES (?, ?, ?)',
            [name, description, teacher_id]
        );

        res.status(201).json({ message: 'Course created successfully' });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const assignStudentToCourse = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;

        // Verify student exists
        const [student] = await db.query(
            'SELECT * FROM users WHERE id = ? AND role = "student"',
            [student_id]
        );

        if (student.length === 0) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        // Verify course exists
        const [course] = await db.query(
            'SELECT * FROM courses WHERE id = ?',
            [course_id]
        );

        if (course.length === 0) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        // Check if already enrolled
        const [enrollment] = await db.query(
            'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
        );

        if (enrollment.length > 0) {
            return res.status(400).json({ message: 'Student already enrolled in this course' });
        }

        // Enroll student
        await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
            [student_id, course_id]
        );

        res.status(201).json({ message: 'Student enrolled successfully' });
    } catch (error) {
        console.error('Assign student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Verify user exists
        const [user] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [user_id]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user
        await db.query(
            'DELETE FROM users WHERE id = ?',
            [user_id]
        );

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboardData,
    createUser,
    createCourse,
    assignStudentToCourse,
    deleteUser
}; 