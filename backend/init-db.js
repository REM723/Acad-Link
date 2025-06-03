require('dotenv').config();
const createDB = require('./config/createDB');
const initDB = require('./config/initDB');

async function initializeDatabase() {
    try {
        // First create the database
        await createDB();
        console.log('Database created successfully');

        // Then initialize the tables
        await initDB();
        console.log('Database tables created successfully');

        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Run the initialization
initializeDatabase(); 