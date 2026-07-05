# Employee Task Management System

A full-stack web application for managing employee tasks with role-based access control, built with React, Redux Toolkit, Node.js, Express, and MySQL.

## Features

### Core Features
- **Authentication**
  - User registration and login with JWT-based authentication
  - Remember Me functionality
  - Role-based access control (Admin/Employee)
  - Password validation (min 8 chars, uppercase, lowercase, number)

- **Dashboard**
  - Admin: View total employees, total tasks, completed tasks, pending tasks
  - Employee: View my tasks, completed, pending, and overdue tasks

- **Employee Management** (Admin Only)
  - Add, edit, delete employees
  - Search, sort, and paginate employee list
  - Manage employee details (Name, Email, Department, Designation)

- **Task Management**
  - Create, update, delete, and view tasks
  - Task fields: Title, Description, Priority, Status, Start Date, Due Date, Assigned Employee
  - File upload support (PDF, JPG, PNG up to 5MB)
  - Business rules:
    - Due date must not be earlier than start date
    - Completed tasks cannot be edited
    - Employees see only their tasks; admins see all tasks

- **Notifications**
  - Task assignment notifications
  - Due date reminders (tasks due within 24 hours)
  - Task completion notifications
  - Automated notification checking via cron job

- **Reports & Export**
  - Completed tasks report
  - Pending tasks report
  - Employee-wise task report
  - Export to Excel and CSV formats

### Bonus Features
- Remember Me functionality
- File upload (PDF/JPG/PNG, max 5MB)
- Email notifications (configurable)
- Unit testing setup
- Docker support

##  Technology Stack

### Frontend
- React 18
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- React Toastify for notifications
- Vite for build tooling

### Backend
- Node.js & Express.js
- MySQL database
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- ExcelJS for Excel export
- Node-cron for scheduled tasks
- Jest & Supertest for testing

## 📁 Project Structure

```
employee-task-management/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── employeeController.js
│   │   ├── taskController.js
│   │   ├── reportController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── employees.js
│   │   ├── tasks.js
│   │   ├── reports.js
│   │   └── notifications.js
│   ├── utils/
│   │   ├── notifications.js
│   │   └── email.js
│   ├── __tests__/
│   │   └── auth.test.js
│   ├── database.sql
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

##  Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Configure environment variables in .env:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_management
DB_PORT=3306
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
JWT_REMEMBER_EXPIRE=30d
```

5. **Create and setup database:**
```bash
# Login to MySQL
mysql -u root -p

# Run the database.sql script
source database.sql

# Or import directly
mysql -u root -p < database.sql
```

6. **Start the backend server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The frontend application will run on `http://localhost:3000`

### Docker Setup (Optional)

1. **Build and run with Docker Compose:**
```bash
docker-compose up -d
```

2. **Stop containers:**
```bash
docker-compose down
```

##  Default Admin Credentials

After running the database.sql script, use these credentials to login:

- **Email:** admin@taskmanagement.com
- **Password:** Admin@123

##  API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Dashboard
- `GET /api/dashboard/admin` - Get admin dashboard statistics
- `GET /api/dashboard/employee` - Get employee dashboard statistics

### Employees (Admin only)
- `GET /api/employees` - Get all employees (with pagination, search, sort)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Tasks
- `GET /api/tasks` - Get all tasks (role-based filtering)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task (with file upload)
- `PUT /api/tasks/:id` - Update task (with file upload)
- `DELETE /api/tasks/:id` - Delete task

### Reports (Admin only)
- `GET /api/reports/completed-tasks` - Get completed tasks report
- `GET /api/reports/pending-tasks` - Get pending tasks report
- `GET /api/reports/employee-wise` - Get employee-wise report
- `GET /api/reports/export/excel?type=completed|pending|employee` - Export to Excel
- `GET /api/reports/export/csv?type=completed|pending|employee` - Export to CSV

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

##  Running Tests

```bash
cd backend
npm test
```

For coverage report:
```bash
npm test -- --coverage
```

##  Database Schema

### Users Table
- id, full_name, email, password, role, created_at, updated_at

### Employees Table
- id, user_id, name, email, department, designation, created_at, updated_at

### Tasks Table
- id, title, description, priority, status, start_date, due_date, assigned_to, created_by, file_path, created_at, updated_at

### Notifications Table
- id, user_id, task_id, type, message, is_read, created_at

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Role-based access control
- SQL injection prevention
- File upload validation
- CORS configuration

##  Business Rules

1. **Email Validation:** Must be unique across the system
2. **Password Policy:** Minimum 8 characters with at least one uppercase, one lowercase, and one number
3. **Date Validation:** Due date cannot be earlier than start date
4. **Task Editing:** Completed tasks cannot be edited
5. **Data Access:** 
   - Employees can only view their own tasks
   - Admins can view and manage all data
6. **File Upload:** Only PDF, JPG, and PNG files up to 5MB

##  Frontend Features

- Responsive design with Tailwind CSS
- Form validation
- Toast notifications
- Loading states
- Error handling
- Protected routes
- State management with Redux Toolkit

##  Email Configuration (Optional)

To enable email notifications, configure these variables in .env:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@taskmanagement.com
```

##  Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in .env
- Ensure database exists and tables are created

### Port Already in Use
- Change PORT in .env file
- Kill the process using the port

### File Upload Issues
- Ensure uploads directory exists
- Check file permissions
- Verify MAX_FILE_SIZE in .env

## License

This project is created as an assignment submission for Lend A Hand India.

## Author

**Candidate Assignment Submission**
- Assignment Duration: 48 Hours
- GitHub Repository: [Add your repository link here]

##  Support

For any queries regarding the assignment, contact:
- **Email:** hemant.chaudhari@lendahandindia.org

---

**Note:** This is a complete full-stack application demonstrating proficiency in React, Node.js, Express, MySQL, Redux Toolkit, JWT authentication, file handling, reporting, and more. All core features and most bonus features have been implemented.
