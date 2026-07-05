const { pool } = require('../config/database');

exports.getAdminDashboard = async (req, res) => {
    try {
        const [stats] = await pool.query('SELECT * FROM admin_dashboard_stats');

        res.json({
            success: true,
            data: stats[0] || {
                total_employees: 0,
                total_tasks: 0,
                completed_tasks: 0,
                pending_tasks: 0
            }
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

exports.getEmployeeDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) AS my_tasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status IN ('Pending', 'In Progress') THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN due_date < CURDATE() AND status != 'Completed' THEN 1 ELSE 0 END) AS overdue
            FROM tasks 
            WHERE assigned_to = ?`,
            [userId]
        );

        res.json({
            success: true,
            data: stats[0] || {
                my_tasks: 0,
                completed: 0,
                pending: 0,
                overdue: 0
            }
        });

    } catch (error) {
        console.error('Employee dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};
