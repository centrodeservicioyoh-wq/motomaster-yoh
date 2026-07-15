const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Obtener todos los productos
exports.getAll = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        brand: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// Obtener un producto por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

// Crear producto con imagen
exports.create = async (req, res) => {
  try {
    const { code, name, description, categoryId, brandId, costPrice, salePrice, stock, minStock, location } = req.body;
    
    // Verificar si el código ya existe
    const existingProduct = await prisma.product.findUnique({
      where: { code }
    });

    if (existingProduct) {
      return res.status(400).json({ error: 'El código de producto ya existe' });
    }

    const image = req.file ? `/uploads/products/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: {
        code,
        name,
        description,
        categoryId,
        brandId,
        costPrice: parseFloat(costPrice),
        salePrice: parseFloat(salePrice),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
        location,
        image
      },
      include: {
        category: true,
        brand: true
      }
    });

    res.status(201).json({ message: 'Producto creado exitosamente', product });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// Actualizar producto
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, categoryId, brandId, costPrice, salePrice, stock, minStock, location } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Si se subió una nueva imagen, eliminar la anterior
    let image = existingProduct.image;
    if (req.file) {
      if (existingProduct.image) {
        const oldImagePath = path.join(__dirname, '../../', existingProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = `/uploads/products/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        code,
        name,
        description,
        categoryId,
        brandId,
        costPrice: parseFloat(costPrice),
        salePrice: parseFloat(salePrice),
        stock: parseInt(stock),
        minStock: parseInt(minStock),
        location,
        image
      },
      include: {
        category: true,
        brand: true
      }
    });

    res.json({ message: 'Producto actualizado exitosamente', product });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// Eliminar producto
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Eliminar imagen si existe
    if (product.image) {
      const imagePath = path.join(__dirname, '../../', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

// Obtener categorías
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Obtener marcas
exports.getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
};
