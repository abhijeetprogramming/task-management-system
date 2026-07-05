# System Architecture

## Overview
This is a full-stack Task Management System with role-based access control (Admin/Employee).

## Architecture Diagram

```
┌─────────────────┐
│   React Frontend│
│   (Vite + React)│
│   Redux Toolkit │
└────────┬────────┘
         │ HTTP/REST
         │ (Axios)
┌────────▼────────┐
│  Node.js Backend│
│  Express.js API │
│  JWT Auth       │
└────────┬────────┘
         │ MySQL2
         │
┌────────▼────────┐
│  MySQL Database │
│  (Relational DB)│
└─────────────────┘
```

## Technology Stack

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **ExcelJS** - Excel export
- **Node-cron** - Task scheduling

### Database
- **MySQL 8.0** - Relational database

## Database Schema

### users
- Authentication and user roles

### employees
- Extended employee information

### tasks
- Task details with assignments

### notifications
- User notifications

## API Architecture

### Authentication Layer
- JWT token-based authentication
- Role-based access control middleware

### Business Logic Layer
- Controllers handle business logic
- Services handle database operations

### Data Layer
- MySQL database with proper indexes
- Foreign key constraints for data integrity

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Role-based authorization
- SQL injection prevention
- File upload validation
- CORS configuration

## Deployment
- Docker containerization
- Docker Compose for orchestration
- Nginx for frontend serving
- Separate containers for DB, Backend, Frontend
