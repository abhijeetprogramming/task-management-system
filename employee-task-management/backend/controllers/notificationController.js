const { pool } = require('../config/database');


exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, is_read } = req.query;
        const offset = (page - 1) * limit;

        const conditions = ['user_id = ?'];
        const params = [req.user.id];

        if (is_read !== undefined) {
            conditions.push('is_read = ?');
            params.push(is_read === 'true' ? 1 : 0);
        }

        const whereClause = 'WHERE ' + conditions.join(' AND ');

        
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
            params
        );

        const total = countResult[0].total;

       
        const [notifications] = await pool.query(
            `SELECT id, task_id, type, message, is_read, created_at 
            FROM notifications 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};


exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification',
            error: error.message
        });
    }
};


exports.markAllAsRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });

    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notifications',
            error: error.message
        });
    }
};


exports.getUnreadCount = async (req, res) => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [req.user.id]
        );

        res.json({
            success: true,
            data: { unread_count: result[0].unread_count }
        });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error.message
        });
    }
};
