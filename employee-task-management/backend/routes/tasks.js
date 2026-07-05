const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { taskValidation, validate } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');


router.use(authenticate);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', upload.single('file'), handleUploadError, taskValidation, validate, taskController.createTask);
router.put('/:id', upload.single('file'), handleUploadError, taskValidation, validate, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
