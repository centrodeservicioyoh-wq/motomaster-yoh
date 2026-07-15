const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.post('/', customerController.create);
router.get('/', customerController.getAll);

module.exports = router;
