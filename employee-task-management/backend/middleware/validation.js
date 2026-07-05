const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

const registerValidation = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirm_password')
        .notEmpty().withMessage('Please confirm your password')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['Admin', 'Employee']).withMessage('Role must be either Admin or Employee')
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const employeeValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('department')
        .optional()
        .trim(),
    body('designation')
        .optional()
        .trim()
];

const taskValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description')
        .optional()
        .trim(),
    body('priority')
        .notEmpty().withMessage('Priority is required')
        .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
    body('status')
        .optional()
        .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
    body('start_date')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Invalid start date format'),
    body('due_date')
        .notEmpty().withMessage('Due date is required')
        .isISO8601().withMessage('Invalid due date format')
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.body.start_date)) {
                throw new Error('Due date cannot be earlier than start date');
            }
            return true;
        }),
    body('assigned_to')
        .notEmpty().withMessage('Assigned employee is required')
        .isInt().withMessage('Invalid employee ID')
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    employeeValidation,
    taskValidation
};
