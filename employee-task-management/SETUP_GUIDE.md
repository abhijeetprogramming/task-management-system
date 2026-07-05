# Quick Setup Guide

## Prerequisites
- Node.js v16+
- MySQL 8.0+
- npm or yarn

## Setup Instructions (5 Minutes)

### 1. Database Setup (2 minutes)

```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
source backend/database.sql

# Or directly:
mysql -u root -p < backend/database.sql
```

### 2. Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_PASSWORD=your_mysql_password

# Start backend
npm run dev
```

Backend runs on: http://localhost:5000

### 3. Frontend Setup (1 minute)

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs on: http://localhost:3000

## Default Login Credentials

**Admin Account:**
- Email: admin@taskmanagement.com
- Password: Admin@123

## Quick Test

1. Open http://localhost:3000
2. Login with admin credentials
3. You'll see the admin dashboard
4. Navigate to Employees, Tasks, Reports

## Docker Setup (Alternative)

```bash
# From project root
docker-compose up -d

# Access at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Troubleshooting

**Database connection fails:**
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists

**Port already in use:**
- Change PORT in backend/.env
- Change port in frontend/vite.config.js

**Module not found:**
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## Project Structure

```
employee-task-management/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite application
├── database.sql      # Database schema
├── docker-compose.yml
└── README.md
```

## API Testing

Backend health check:
```bash
curl http://localhost:5000/api/health
```

Login test:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskmanagement.com","password":"Admin@123"}'
```

## Development Commands

**Backend:**
```bash
npm run dev    # Development with auto-reload
npm start      # Production
npm test       # Run tests
```

**Frontend:**
```bash
npm run dev    # Development server
npm run build  # Production build
npm run preview # Preview build
```

## Features Implemented

✅ Authentication (Register/Login with JWT)
✅ Remember Me functionality
✅ Role-based dashboards (Admin/Employee)
✅ Employee Management (CRUD)
✅ Task Management (CRUD with file upload)
✅ Notifications system
✅ Reports (Excel/CSV export)
✅ Search, Sort, Pagination
✅ File upload (PDF/JPG/PNG, max 5MB)
✅ Email notifications (configurable)
✅ Unit tests
✅ Docker support

## Next Steps

1. Create more employee accounts
2. Assign tasks to employees
3. Test notifications
4. Generate and export reports
5. Customize as needed

## Support

For issues, check the README.md file or contact:
hemant.chaudhari@lendahandindia.org
