const express = require('express');
const router = express.Router();
const cashRegisterController = require('../controllers/cashRegister.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.post('/open', cashRegisterController.open);
router.post('/close', cashRegisterController.close);
router.get('/current', cashRegisterController.getCurrent);
router.get('/history', cashRegisterController.getHistory);
router.get('/:id', cashRegisterController.getSummary);

module.exports = router;
