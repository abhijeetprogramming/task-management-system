const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const generateToken = (user, rememberMe = false) => {
    const expiresIn = rememberMe ? process.env.JWT_REMEMBER_EXPIRE : process.env.JWT_EXPIRE;
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

exports.register = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { full_name, email, password, role } = req.body;

        
        const [existingUsers] = await connection.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.beginTransaction();

        const [userResult] = await connection.query(
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role]
        );

        const userId = userResult.insertId;

   
        if (role === 'Employee') {
            await connection.query(
                'INSERT INTO employees (user_id, name, email) VALUES (?, ?, ?)',
                [userId, full_name, email]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: userId,
                full_name,
                email,
                role
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, remember_me } = req.body;

        const [users] = await pool.query(
            'SELECT id, full_name, email, password, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user, remember_me);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};
