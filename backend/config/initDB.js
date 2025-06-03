const db = require('./db');

const initDatabase = async () => {
    try {
        // First, disable foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop existing tables in reverse order of dependencies
        await db.query(`
            DROP TABLE IF EXISTS attendance;
            DROP TABLE IF EXISTS leave_applications;
            DROP TABLE IF EXISTS exams;
            DROP TABLE IF EXISTS enrollments;
            DROP TABLE IF EXISTS courses;
            DROP TABLE IF EXISTS teachers;
            DROP TABLE IF EXISTS students;
            DROP TABLE IF EXISTS users;
        `);

        // Re-enable foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // Create users table first (parent table)
        await db.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                role ENUM('student', 'teacher', 'admin') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create students table (depends on users)
        await db.query(`
            CREATE TABLE students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                roll_number VARCHAR(20) UNIQUE NOT NULL,
                department VARCHAR(50) NOT NULL,
                semester INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create teachers table (depends on users)
        await db.query(`
            CREATE TABLE teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                department VARCHAR(50) NOT NULL,
                designation VARCHAR(50) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create courses table (depends on teachers)
        await db.query(`
            CREATE TABLE courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(20) UNIQUE NOT NULL,
                description TEXT,
                teacher_id INT NOT NULL,
                semester INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
            )
        `);

        // Create enrollments table (depends on students and courses)
        await db.query(`
            CREATE TABLE enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                marks DECIMAL(5,2) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE KEY unique_enrollment (student_id, course_id)
            )
        `);

        // Create exams table (depends on courses)
        await db.query(`
            CREATE TABLE exams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                date DATETIME NOT NULL,
                duration INT NOT NULL,
                total_marks INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        // Create leave_applications table (depends on students and courses)
        await db.query(`
            CREATE TABLE leave_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                reason TEXT NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        // Create attendance table (depends on students and courses)
        await db.query(`
            CREATE TABLE attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                course_id INT NOT NULL,
                date DATE NOT NULL,
                status ENUM('present', 'absent') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE KEY unique_attendance (student_id, course_id, date)
            )
        `);

        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating database tables:', error);
        throw error;
    }
};

module.exports = initDatabase; 