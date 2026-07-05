const { pool } = require('../config/database');

const createNotification = async (userId, taskId, type, message) => {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, task_id, type, message) VALUES (?, ?, ?, ?)',
            [userId, taskId, type, message]
        );
        return true;
    } catch (error) {
        console.error('Create notification error:', error);
        return false;
    }
};


const checkDueTasks = async () => {
    try {
     
        const [dueTasks] = await pool.query(
            `SELECT t.id, t.title, t.assigned_to, t.due_date
            FROM tasks t
            WHERE t.status != 'Completed'
            AND t.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 1 DAY)
            AND NOT EXISTS (
                SELECT 1 FROM notifications n
                WHERE n.task_id = t.id 
                AND n.type = 'task_due_soon'
                AND n.created_at >= CURDATE()
            )`
        );

        for (const task of dueTasks) {
            await createNotification(
                task.assigned_to,
                task.id,
                'task_due_soon',
                `Task "${task.title}" is due soon (${task.due_date})`
            );
        }

        console.log(`✓ Checked due tasks: ${dueTasks.length} notifications created`);
        return dueTasks.length;

    } catch (error) {
        console.error('Check due tasks error:', error);
        return 0;
    }
};

module.exports = {
    createNotification,
    checkDueTasks
};
