const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workorder.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.post('/', workOrderController.create);
router.get('/', workOrderController.getAll);
router.get('/active', workOrderController.getActive);
router.get('/:id', workOrderController.getById);
router.put('/:id/status', workOrderController.updateStatus);
router.post('/:id/parts', workOrderController.addParts);
router.post('/:id/labor', workOrderController.addLabor);
router.put('/:id/finalize', workOrderController.finalize);

module.exports = router;
