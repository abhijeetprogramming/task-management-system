const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');


exports.getAllEmployees = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            sortBy = 'created_at', 
            sortOrder = 'DESC' 
        } = req.query;

        const offset = (page - 1) * limit;
        const allowedSortFields = ['id', 'name', 'email', 'department', 'designation', 'created_at'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const searchCondition = search ? 
            'WHERE name LIKE ? OR email LIKE ? OR department LIKE ? OR designation LIKE ?' : '';
        const searchParams = search ? 
            [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [];

        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM employees ${searchCondition}`,
            searchParams
        );

        const total = countResult[0].total;

        const [employees] = await pool.query(
            `SELECT id, user_id, name, email, department, designation, created_at, updated_at 
            FROM employees 
            ${searchCondition}
            ORDER BY ${sortField} ${order}
            LIMIT ? OFFSET ?`,
            [...searchParams, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: employees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
            error: error.message
        });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const [employees] = await pool.query(
            'SELECT id, user_id, name, email, department, designation, created_at, updated_at FROM employees WHERE id = ?',
            [id]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employees[0]
        });

    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee',
            error: error.message
        });
    }
};

exports.createEmployee = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { name, email, department, designation, password = 'Employee@123' } = req.body;

       
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
            [name, email, hashedPassword, 'Employee']
        );

        const userId = userResult.insertId;

      
        const [employeeResult] = await connection.query(
            'INSERT INTO employees (user_id, name, email, department, designation) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, department, designation]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                id: employeeResult.insertId,
                user_id: userId,
                name,
                email,
                department,
                designation
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Create employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create employee',
            error: error.message
        });
    } finally {
        connection.release();
    }
};


exports.updateEmployee = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const { name, email, department, designation } = req.body;

        // Check if employee exists
        const [existingEmployee] = await connection.query(
            'SELECT user_id FROM employees WHERE id = ?',
            [id]
        );

        if (existingEmployee.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const userId = existingEmployee[0].user_id;

        
        if (email) {
            const [existingEmail] = await connection.query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );

            if (existingEmail.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        await connection.beginTransaction();

        
        if (email) {
            await connection.query(
                'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
                [name, email, userId]
            );
        } else {
            await connection.query(
                'UPDATE users SET full_name = ? WHERE id = ?',
                [name, userId]
            );
        }

       
        await connection.query(
            'UPDATE employees SET name = ?, email = ?, department = ?, designation = ? WHERE id = ?',
            [name, email, department, designation, id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Employee updated successfully'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Update employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update employee',
            error: error.message
        });
    } finally {
        connection.release();
    }
};


exports.deleteEmployee = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;

       
        const [employee] = await connection.query(
            'SELECT user_id FROM employees WHERE id = ?',
            [id]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        await connection.beginTransaction();

       
        await connection.query('DELETE FROM users WHERE id = ?', [employee[0].user_id]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete employee',
            error: error.message
        });
    } finally {
        connection.release();
    }
};
