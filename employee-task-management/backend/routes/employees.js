const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { employeeValidation, validate } = require('../middleware/validation');


router.use(authenticate, isAdmin);

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeValidation, validate, employeeController.createEmployee);
router.put('/:id', employeeValidation, validate, employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
