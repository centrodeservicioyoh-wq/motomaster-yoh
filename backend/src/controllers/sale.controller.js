const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear una venta
exports.create = async (req, res) => {
  try {
    const { customerId, items, paymentMethod, tax = 0 } = req.body;
    const userId = req.user.id;

    // Calcular totales
    let subtotal = 0;
    let totalProfit = 0;

    // Verificar stock y calcular totales
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` 
        });
      }

      const itemSubtotal = product.salePrice * item.quantity;
      const itemProfit = (product.salePrice - product.costPrice) * item.quantity;
      
      subtotal += itemSubtotal;
      totalProfit += itemProfit;
    }

    const total = subtotal + tax;

    // Crear la venta
    const sale = await prisma.$transaction(async (tx) => {
      // Crear venta
      const newSale = await tx.sale.create({
        data: {
          customerId,
          userId,
          subtotal,
          tax,
          total,
          paymentMethod,
          status: 'COMPLETED'
        }
      });

      // Crear items de venta y actualizar stock
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.salePrice,
            costPrice: product.costPrice,
            subtotal: product.salePrice * item.quantity,
            profit: (product.salePrice - product.costPrice) * item.quantity
          }
        });

        // Actualizar stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });
      }

      return newSale;
    });

    // Obtener venta completa con items
    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        user: true
      }
    });

    res.status(201).json({ 
      message: 'Venta realizada exitosamente',
      sale: completeSale 
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error al procesar la venta' });
  }
};

// Obtener todas las ventas
exports.getAll = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

// Obtener venta por ID
exports.getById = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        user: true
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
};

// Obtener ventas del día
exports.getTodaySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: today
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalProfit = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + parseFloat(item.profit), 0);
    }, 0);

    res.json({
      sales,
      summary: {
        totalSales,
        totalProfit,
        count: sales.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas del día' });
  }
};
