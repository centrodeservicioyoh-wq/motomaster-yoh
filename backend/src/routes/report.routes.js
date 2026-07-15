const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/dashboard', reportController.getDashboardSummary);
router.get('/sales', reportController.getSalesByPeriod);
router.get('/top-products', reportController.getTopProducts);
router.get('/mechanics', reportController.getMechanicPerformance);
router.get('/inventory', reportController.getInventoryValue);
router.get('/work-orders', reportController.getWorkOrderSummary);

module.exports = router;
