const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, isAdmin } = require('../middleware/auth');


router.use(authenticate, isAdmin);

router.get('/completed-tasks', reportController.getCompletedTasksReport);
router.get('/pending-tasks', reportController.getPendingTasksReport);
router.get('/employee-wise', reportController.getEmployeeWiseReport);
router.get('/export/excel', reportController.exportToExcel);
router.get('/export/csv', reportController.exportToCSV);

module.exports = router;
