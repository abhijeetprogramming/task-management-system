const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('Email configuration not found, skipping email notification');
            return false;
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`✓ Email sent to ${to}`);
        return true;

    } catch (error) {
        console.error('Send email error:', error.message);
        return false;
    }
};

const sendTaskAssignmentEmail = async (userEmail, userName, taskTitle) => {
    const subject = 'New Task Assigned';
    const html = `
        <h2>Task Assignment Notification</h2>
        <p>Hello ${userName},</p>
        <p>A new task has been assigned to you:</p>
        <p><strong>${taskTitle}</strong></p>
        <p>Please login to the Task Management System to view the details.</p>
        <br>
        <p>Best regards,<br>Task Management System</p>
    `;

    return await sendEmail(userEmail, subject, html);
};

const sendTaskDueReminderEmail = async (userEmail, userName, taskTitle, dueDate) => {
    const subject = 'Task Due Reminder';
    const html = `
        <h2>Task Due Reminder</h2>
        <p>Hello ${userName},</p>
        <p>This is a reminder that the following task is due soon:</p>
        <p><strong>${taskTitle}</strong></p>
        <p>Due Date: <strong>${dueDate}</strong></p>
        <p>Please login to the Task Management System to complete the task.</p>
        <br>
        <p>Best regards,<br>Task Management System</p>
    `;

    return await sendEmail(userEmail, subject, html);
};

const sendTaskCompletionEmail = async (userEmail, userName, taskTitle) => {
    const subject = 'Task Completed';
    const html = `
        <h2>Task Completion Notification</h2>
        <p>Hello ${userName},</p>
        <p>The following task has been marked as completed:</p>
        <p><strong>${taskTitle}</strong></p>
        <p>Please login to the Task Management System to review.</p>
        <br>
        <p>Best regards,<br>Task Management System</p>
    `;

    return await sendEmail(userEmail, subject, html);
};

module.exports = {
    sendEmail,
    sendTaskAssignmentEmail,
    sendTaskDueReminderEmail,
    sendTaskCompletionEmail
};
