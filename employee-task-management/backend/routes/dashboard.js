const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/admin', authenticate, isAdmin, dashboardController.getAdminDashboard);

router.get('/employee', authenticate, dashboardController.getEmployeeDashboard);

module.exports = router;
