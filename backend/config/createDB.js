const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'RCR$',
    port: 3306
});

async function createDatabase() {
    try {
        // Create database if it doesn't exist
        await pool.promise().query('CREATE DATABASE IF NOT EXISTS universityportal');
        console.log('Database created successfully');
        
        // Switch to the created database
        await pool.promise().query('USE universityportal');
        console.log('Using database universityportal');
    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    } finally {
        pool.end();
    }
}

module.exports = createDatabase; 