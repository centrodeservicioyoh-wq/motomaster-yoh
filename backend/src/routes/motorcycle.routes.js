const express = require('express');
const router = express.Router();
const motorcycleController = require('../controllers/motorcycle.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.post('/', motorcycleController.create);
router.get('/', motorcycleController.getAll);

module.exports = router;
