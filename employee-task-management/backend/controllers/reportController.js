const { pool } = require('../config/database');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');


exports.getCompletedTasksReport = async (req, res) => {
    try {
        const [tasks] = await pool.query(
            `SELECT 
                t.id, t.title, t.description, t.priority, t.start_date, t.due_date,
                t.created_at, t.updated_at,
                u1.full_name as assigned_to_name,
                u2.full_name as created_by_name
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            WHERE t.status = 'Completed'
            ORDER BY t.updated_at DESC`
        );

        res.json({
            success: true,
            data: tasks
        });

    } catch (error) {
        console.error('Completed tasks report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
};


exports.getPendingTasksReport = async (req, res) => {
    try {
        const [tasks] = await pool.query(
            `SELECT 
                t.id, t.title, t.description, t.priority, t.status,
                t.start_date, t.due_date, t.created_at,
                u1.full_name as assigned_to_name,
                u2.full_name as created_by_name,
                CASE 
                    WHEN t.due_date < CURDATE() THEN 'Overdue'
                    WHEN t.due_date = CURDATE() THEN 'Due Today'
                    ELSE 'Pending'
                END as task_status
            FROM tasks t
            LEFT JOIN users u1 ON t.assigned_to = u1.id
            LEFT JOIN users u2 ON t.created_by = u2.id
            WHERE t.status IN ('Pending', 'In Progress')
            ORDER BY t.due_date ASC`
        );

        res.json({
            success: true,
            data: tasks
        });

    } catch (error) {
        console.error('Pending tasks report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
};


exports.getEmployeeWiseReport = async (req, res) => {
    try {
        const [report] = await pool.query(
            `SELECT 
                u.id as employee_id,
                u.full_name as employee_name,
                e.department,
                e.designation,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) as pending_tasks,
                SUM(CASE WHEN t.due_date < CURDATE() AND t.status != 'Completed' THEN 1 ELSE 0 END) as overdue_tasks
            FROM users u
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.role = 'Employee'
            GROUP BY u.id, u.full_name, e.department, e.designation
            ORDER BY total_tasks DESC`
        );

        res.json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error('Employee-wise report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
};


exports.exportToExcel = async (req, res) => {
    try {
        const { type } = req.query;
        let data, filename, sheetName;

       
        if (type === 'completed') {
            const [tasks] = await pool.query(
                `SELECT 
                    t.id, t.title, t.priority, t.start_date, t.due_date, t.updated_at,
                    u1.full_name as assigned_to, u2.full_name as created_by
                FROM tasks t
                LEFT JOIN users u1 ON t.assigned_to = u1.id
                LEFT JOIN users u2 ON t.created_by = u2.id
                WHERE t.status = 'Completed'
                ORDER BY t.updated_at DESC`
            );
            data = tasks;
            filename = 'completed_tasks_report.xlsx';
            sheetName = 'Completed Tasks';
        } else if (type === 'pending') {
            const [tasks] = await pool.query(
                `SELECT 
                    t.id, t.title, t.priority, t.status, t.start_date, t.due_date,
                    u1.full_name as assigned_to, u2.full_name as created_by,
                    CASE 
                        WHEN t.due_date < CURDATE() THEN 'Overdue'
                        WHEN t.due_date = CURDATE() THEN 'Due Today'
                        ELSE 'Pending'
                    END as task_status
                FROM tasks t
                LEFT JOIN users u1 ON t.assigned_to = u1.id
                LEFT JOIN users u2 ON t.created_by = u2.id
                WHERE t.status IN ('Pending', 'In Progress')
                ORDER BY t.due_date ASC`
            );
            data = tasks;
            filename = 'pending_tasks_report.xlsx';
            sheetName = 'Pending Tasks';
        } else if (type === 'employee') {
            const [report] = await pool.query(
                `SELECT 
                    u.full_name as employee_name, e.department, e.designation,
                    COUNT(t.id) as total_tasks,
                    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN t.due_date < CURDATE() AND t.status != 'Completed' THEN 1 ELSE 0 END) as overdue
                FROM users u
                LEFT JOIN employees e ON u.id = e.user_id
                LEFT JOIN tasks t ON u.id = t.assigned_to
                WHERE u.role = 'Employee'
                GROUP BY u.id, u.full_name, e.department, e.designation`
            );
            data = report;
            filename = 'employee_wise_report.xlsx';
            sheetName = 'Employee Report';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid report type'
            });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        if (data.length > 0) {
            worksheet.columns = Object.keys(data[0]).map(key => ({
                header: key.replace(/_/g, ' ').toUpperCase(),
                key: key,
                width: 20
            }));

            data.forEach(row => worksheet.addRow(row));

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export to Excel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export report',
            error: error.message
        });
    }
};

exports.exportToCSV = async (req, res) => {
    try {
        const { type } = req.query;
        let data, filename;

      
        if (type === 'completed') {
            const [tasks] = await pool.query(
                `SELECT 
                    t.id, t.title, t.priority, t.start_date, t.due_date, t.updated_at,
                    u1.full_name as assigned_to, u2.full_name as created_by
                FROM tasks t
                LEFT JOIN users u1 ON t.assigned_to = u1.id
                LEFT JOIN users u2 ON t.created_by = u2.id
                WHERE t.status = 'Completed'`
            );
            data = tasks;
            filename = 'completed_tasks_report.csv';
        } else if (type === 'pending') {
            const [tasks] = await pool.query(
                `SELECT 
                    t.id, t.title, t.priority, t.status, t.start_date, t.due_date,
                    u1.full_name as assigned_to, u2.full_name as created_by
                FROM tasks t
                LEFT JOIN users u1 ON t.assigned_to = u1.id
                LEFT JOIN users u2 ON t.created_by = u2.id
                WHERE t.status IN ('Pending', 'In Progress')`
            );
            data = tasks;
            filename = 'pending_tasks_report.csv';
        } else if (type === 'employee') {
            const [report] = await pool.query(
                `SELECT 
                    u.full_name as employee_name, e.department, e.designation,
                    COUNT(t.id) as total_tasks,
                    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN t.status = 'Pending' OR t.status = 'In Progress' THEN 1 ELSE 0 END) as pending
                FROM users u
                LEFT JOIN employees e ON u.id = e.user_id
                LEFT JOIN tasks t ON u.id = t.assigned_to
                WHERE u.role = 'Employee'
                GROUP BY u.id`
            );
            data = report;
            filename = 'employee_wise_report.csv';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid report type'
            });
        }

        
        const parser = new Parser();
        const csv = parser.parse(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);

    } catch (error) {
        console.error('Export to CSV error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export report',
            error: error.message
        });
    }
};
