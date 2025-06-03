const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'university-portal-secure-secret-key-2025';

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken }; 