const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// JWT secret key - should be moved to environment variables in production
const JWT_SECRET = 'your-secret-key';

const login = async (req, res) => {
    console.log('\n📝 Login attempt:', { 
        username: req.body.username, 
        role: req.body.role,
        timestamp: new Date().toISOString()
    });

    try {
        const { username, password, role } = req.body;

        // Input validation
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Get user from database
        const [users] = await db.query(
            'SELECT u.*, s.roll_number, t.teacher_code, a.admin_code FROM users u ' +
            'LEFT JOIN students s ON u.user_id = s.user_id ' +
            'LEFT JOIN teachers t ON u.user_id = t.user_id ' +
            'LEFT JOIN admins a ON u.user_id = a.user_id ' +
            'WHERE u.username = ? AND u.role = ?',
            [username, role]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.user_id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare user data for response
        const userData = {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.full_name,
            department: user.department
        };

        // Add role-specific data
        if (user.role === 'student') {
            userData.rollNumber = user.roll_number;
        } else if (user.role === 'teacher') {
            userData.teacherCode = user.teacher_code;
        } else if (user.role === 'admin') {
            userData.adminCode = user.admin_code;
        }

        res.json({
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const signup = async (req, res) => {
    console.log('\n📝 Signup attempt:', { 
        username: req.body.username, 
        role: req.body.role,
        email: req.body.email,
        timestamp: new Date().toISOString()
    });
    
    try {
        const { username, password, role, email, ...additionalInfo } = req.body;

        // Input validation
        if (!username || !password || !role || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Check for existing user
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Start transaction
        await db.query('START TRANSACTION');

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const [result] = await db.query(
                'INSERT INTO users (username, password, role, email, full_name, department, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [username, hashedPassword, role, email, additionalInfo.full_name, additionalInfo.department, additionalInfo.phone_number || null]
            );

            const userId = result.insertId;

            // Create role-specific record
            if (role === 'student') {
                const { roll_number, semester } = additionalInfo;
                
                if (!roll_number || !semester) {
                    throw new Error('Missing required student information');
                }

                await db.query(
                    'INSERT INTO students (user_id, roll_number, semester) VALUES (?, ?, ?)',
                    [userId, roll_number, semester]
                );
            } else if (role === 'teacher') {
                const { teacher_code, designation } = additionalInfo;
                
                if (!teacher_code || !designation) {
                    throw new Error('Missing required teacher information');
                }

                await db.query(
                    'INSERT INTO teachers (user_id, teacher_code, designation) VALUES (?, ?, ?)',
                    [userId, teacher_code, designation]
                );
            } else if (role === 'admin') {
                const { admin_code } = additionalInfo;
                
                if (!admin_code) {
                    throw new Error('Missing required admin information');
                }

                await db.query(
                    'INSERT INTO admins (user_id, admin_code) VALUES (?, ?)',
                    [userId, admin_code]
                );
            }

            // Commit transaction
            await db.query('COMMIT');

            res.status(201).json({
                message: 'Signup successful',
                user: {
                    userId,
                    username,
                    email,
                    role
                }
            });

        } catch (error) {
            // Rollback transaction on error
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: error.message || 'Internal server error' 
        });
    }
};

module.exports = { login, signup }; 