const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

// Test database connection
async function testDatabaseConnection() {
    try {
        // Try to execute a simple query
        await db.query('SELECT 1');
        console.log('✅ Database connection successful');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\nTroubleshooting steps:');
        console.log('1. Check if MySQL server is running');
        console.log('2. Verify database credentials in config/db.js');
        console.log('3. Ensure the database "universityportal" exists');
        console.log('4. Check if the MySQL port (3306) is accessible');
        console.log('5. Verify network connectivity to the database server');
        process.exit(1); // Exit the application if database connection fails
    }
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to University Portal API' });
});

// Set port and start server
const PORT = process.env.PORT || 5001;

// Test database connection before starting the server
testDatabaseConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}); 