const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.post('/', saleController.create);
router.get('/', saleController.getAll);
router.get('/today', saleController.getTodaySales);
router.get('/:id', saleController.getById);

module.exports = router;
