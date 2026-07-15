const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener categorías y marcas (públicas dentro del sistema)
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);

// CRUD de productos
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', upload.single('image'), productController.create);
router.put('/:id', upload.single('image'), productController.update);
router.delete('/:id', productController.delete);

module.exports = router;
