CREATE DATABASE IF NOT EXISTS task_management;
USE task_management;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Employee') NOT NULL DEFAULT 'Employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);


CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_department (department),
    INDEX idx_email (email)
);


CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    assigned_to INT NOT NULL,
    created_by INT NOT NULL,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_due_date (due_date),
    INDEX idx_priority (priority),
    CONSTRAINT chk_dates CHECK (due_date >= start_date)
);

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    task_id INT,
    type ENUM('task_assigned', 'task_due_soon', 'task_completed') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);


INSERT INTO users (full_name, email, password, role) 
VALUES ('Admin User', 'admin@taskmanagement.com', '$2a$10$xQXVnJ3vR5LmHc8YWq4YUuKp7pXh6ZW6K4mVJwK5xFz8yLZ9YmJXy', 'Admin');


INSERT INTO employees (user_id, name, email, department, designation)
VALUES (1, 'Admin User', 'admin@taskmanagement.com', 'IT', 'System Administrator');


CREATE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM employees) AS total_employees,
    (SELECT COUNT(*) FROM tasks) AS total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'Completed') AS completed_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status IN ('Pending', 'In Progress')) AS pending_tasks;


CREATE VIEW employee_task_stats AS
SELECT 
    assigned_to AS user_id,
    COUNT(*) AS my_tasks,
    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN status IN ('Pending', 'In Progress') THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN due_date < CURDATE() AND status != 'Completed' THEN 1 ELSE 0 END) AS overdue
FROM tasks
GROUP BY assigned_to;
