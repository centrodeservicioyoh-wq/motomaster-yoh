const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.post('/categories', catalogController.createCategory);
router.get('/categories', catalogController.getCategories);

router.post('/brands', catalogController.createBrand);
router.get('/brands', catalogController.getBrands);

module.exports = router;
