const { pool } = require('../config/database');
const { createNotification } = require('../utils/notifications');
const fs = require('fs');
const path = require('path');


exports.getAllTasks = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status = '', 
            priority = '',
            search = '',
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const allowedSortFields = ['id', 'title', 'priority', 'status', 'start_date', 'due_date', 'created_at'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const conditions = [];
        const params = [];

        if (req.user.role === 'Employee') {
            conditions.push('t.assigned_to = ?');
            params.push(req.user.id);
        }

        if (status) {
            conditions.push('t.status = ?');
            params.push(status);
        }

        if (priority) {
            conditions.push('t.priority = ?');
            params.push(priority);
        }

        if (search) {
            conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // Get total count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM tasks t ${whereClause}`,
            params
        );

        const total = countResult[0].total;

        
        const [tasks] = await pool.query(
            `SELECT 
                t.id, t.title, t.description, t.priority, t.status, 
                t.start_date, t.due_date, t.assigned_to, t.created_by, t.file_path,
                t.created_at, t.updated_at,
                u1.full_name as assigned_to_name,
                u2.full_name as created_by_name
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            ${whereClause}
            ORDER BY t.${sortField} ${order}
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const [tasks] = await pool.query(
            `SELECT 
                t.id, t.title, t.description, t.priority, t.status, 
                t.start_date, t.due_date, t.assigned_to, t.created_by, t.file_path,
                t.created_at, t.updated_at,
                u1.full_name as assigned_to_name,
                u2.full_name as created_by_name
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            WHERE t.id = ?`,
            [id]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const task = tasks[0];

      
        if (req.user.role === 'Employee' && task.assigned_to !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: task
        });

    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task',
            error: error.message
        });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, priority, status = 'Pending', start_date, due_date, assigned_to } = req.body;
        const file_path = req.file ? req.file.path : null;
        const created_by = req.user.id;

        const [result] = await pool.query(
            `INSERT INTO tasks (title, description, priority, status, start_date, due_date, assigned_to, created_by, file_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, priority, status, start_date, due_date, assigned_to, created_by, file_path]
        );

        const taskId = result.insertId;

        
        await createNotification(
            assigned_to,
            taskId,
            'task_assigned',
            `New task assigned to you: ${title}`
        );

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: {
                id: taskId,
                title,
                description,
                priority,
                status,
                start_date,
                due_date,
                assigned_to,
                created_by,
                file_path
            }
        });

    } catch (error) {
        
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message
        });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, status, start_date, due_date, assigned_to } = req.body;

        const [currentTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);

        if (currentTask.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const task = currentTask[0];

        if (task.status === 'Completed') {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Completed tasks cannot be edited'
            });
        }

        
        if (req.user.role === 'Employee' && task.assigned_to !== req.user.id) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const file_path = req.file ? req.file.path : task.file_path;

      
        if (req.file && task.file_path && fs.existsSync(task.file_path)) {
            fs.unlinkSync(task.file_path);
        }

        await pool.query(
            `UPDATE tasks 
            SET title = ?, description = ?, priority = ?, status = ?, 
                start_date = ?, due_date = ?, assigned_to = ?, file_path = ?
            WHERE id = ?`,
            [title, description, priority, status, start_date, due_date, assigned_to, file_path, id]
        );

       
        if (status === 'Completed' && task.status !== 'Completed') {
            await createNotification(
                task.created_by,
                id,
                'task_completed',
                `Task completed: ${title}`
            );
        }

    
        if (assigned_to !== task.assigned_to) {
            await createNotification(
                assigned_to,
                id,
                'task_assigned',
                `Task reassigned to you: ${title}`
            );
        }

        res.json({
            success: true,
            message: 'Task updated successfully'
        });

    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const [task] = await pool.query('SELECT file_path FROM tasks WHERE id = ?', [id]);

        if (task.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

       
        if (task[0].file_path && fs.existsSync(task[0].file_path)) {
            fs.unlinkSync(task[0].file_path);
        }

        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error.message
        });
    }
};
