const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAuthentication() {
    try {
        // Test student signup
        console.log('Testing student signup...');
        const studentSignupResponse = await axios.post(`${API_URL}/auth/signup`, {
            username: 'teststudent',
            password: 'password123',
            role: 'student',
            email: 'student@test.com',
            full_name: 'Test Student',
            roll_number: 'ST001',
            department: 'Computer Science',
            semester: 3
        });
        console.log('Student signup successful:', studentSignupResponse.data);

        // Test student login
        console.log('\nTesting student login...');
        const studentLoginResponse = await axios.post(`${API_URL}/auth/login`, {
            username: 'teststudent',
            password: 'password123',
            role: 'student'
        });
        console.log('Student login successful:', studentLoginResponse.data);

        // Test teacher signup
        console.log('\nTesting teacher signup...');
        const teacherSignupResponse = await axios.post(`${API_URL}/auth/signup`, {
            username: 'testteacher',
            password: 'password123',
            role: 'teacher',
            email: 'teacher@test.com',
            full_name: 'Test Teacher',
            department: 'Computer Science',
            designation: 'Professor'
        });
        console.log('Teacher signup successful:', teacherSignupResponse.data);

        // Test teacher login
        console.log('\nTesting teacher login...');
        const teacherLoginResponse = await axios.post(`${API_URL}/auth/login`, {
            username: 'testteacher',
            password: 'password123',
            role: 'teacher'
        });
        console.log('Teacher login successful:', teacherLoginResponse.data);

        // Test invalid login
        console.log('\nTesting invalid login...');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                username: 'teststudent',
                password: 'wrongpassword',
                role: 'student'
            });
        } catch (error) {
            console.log('Invalid login test successful:', error.response.data);
        }

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

// Run the tests
testAuthentication(); 