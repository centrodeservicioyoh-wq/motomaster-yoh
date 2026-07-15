const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Resumen general del dashboard
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Ventas de hoy
    const todaySales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow }
      },
      include: { items: true }
    });

    const totalSalesToday = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const profitToday = todaySales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + parseFloat(item.profit), 0);
    }, 0);

    // Órdenes activas
    const activeOrders = await prisma.workOrder.count({
      where: {
        status: { in: ['RECEIVED', 'DIAGNOSING', 'REPAIRING', 'READY'] }
      }
    });

    // Total productos
    const totalProducts = await prisma.product.count();

    // Total clientes
    const totalCustomers = await prisma.customer.count();

    // Productos con stock bajo
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: { lte: prisma.product.fields.minStock }
      }
    });

    res.json({
      totalSalesToday,
      profitToday,
      activeOrders,
      totalProducts,
      totalCustomers,
      lowStockProducts
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

// Ventas por período
exports.getSalesByPeriod = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate = new Date(now);

    if (period === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Agrupar por día
    const salesByDay = {};
    sales.forEach(sale => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { date, total: 0, profit: 0, count: 0 };
      }
      salesByDay[date].total += parseFloat(sale.total);
      salesByDay[date].count += 1;
      sale.items.forEach(item => {
        salesByDay[date].profit += parseFloat(item.profit);
      });
    });

    const chartData = Object.values(salesByDay).map(day => ({
      date: day.date,
      ventas: parseFloat(day.total.toFixed(2)),
      ganancias: parseFloat(day.profit.toFixed(2)),
      transacciones: day.count
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Error getting sales by period:', error);
    res.status(500).json({ error: 'Error al obtener ventas por período' });
  }
};

// Productos más vendidos
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, subtotal: true, profit: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: parseInt(limit)
    });

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true, brand: true }
        });
        return {
          ...product,
          totalSold: item._sum.quantity,
          totalRevenue: parseFloat(item._sum.subtotal),
          totalProfit: parseFloat(item._sum.profit)
        };
      })
    );

    res.json(productsWithDetails);
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({ error: 'Error al obtener productos más vendidos' });
  }
};

// Rendimiento de mecánicos
exports.getMechanicPerformance = async (req, res) => {
  try {
    const mechanics = await prisma.user.findMany({
      where: { role: 'VENDEDOR' },
      select: { id: true, name: true }
    });

    const performance = await Promise.all(
      mechanics.map(async (mechanic) => {
        const workOrders = await prisma.workOrder.count({
          where: { mechanicId: mechanic.id, status: 'DELIVERED' }
        });

        const laborServices = await prisma.laborService.findMany({
          where: { mechanicId: mechanic.id }
        });

        const totalHours = laborServices.reduce((sum, ls) => sum + parseFloat(ls.hours), 0);
        const totalEarned = laborServices.reduce((sum, ls) => sum + parseFloat(ls.total), 0);
        const totalProfit = laborServices.reduce((sum, ls) => sum + parseFloat(ls.profit), 0);

        return {
          id: mechanic.id,
          name: mechanic.name,
          workOrdersCompleted: workOrders,
          totalHours: parseFloat(totalHours.toFixed(2)),
          totalEarned: parseFloat(totalEarned.toFixed(2)),
          totalProfit: parseFloat(totalProfit.toFixed(2))
        };
      })
    );

    res.json(performance);
  } catch (error) {
    console.error('Error getting mechanic performance:', error);
    res.status(500).json({ error: 'Error al obtener rendimiento de mecánicos' });
  }
};

// Valor del inventario
exports.getInventoryValue = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, brand: true }
    });

    const totalValue = products.reduce((sum, p) => {
      return sum + (parseFloat(p.costPrice) * p.stock);
    }, 0);

    const totalSaleValue = products.reduce((sum, p) => {
      return sum + (parseFloat(p.salePrice) * p.stock);
    }, 0);

    const potentialProfit = totalSaleValue - totalValue;

    // Productos por categoría
    const byCategory = {};
    products.forEach(p => {
      const catName = p.category?.name || 'Sin categoría';
      if (!byCategory[catName]) {
        byCategory[catName] = { name: catName, value: 0, count: 0 };
      }
      byCategory[catName].value += parseFloat(p.costPrice) * p.stock;
      byCategory[catName].count += 1;
    });

    const categoryData = Object.values(byCategory).map(cat => ({
      ...cat,
      value: parseFloat(cat.value.toFixed(2))
    }));

    // Alertas de stock bajo
    const lowStock = products.filter(p => p.stock <= p.minStock);

    res.json({
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalSaleValue: parseFloat(totalSaleValue.toFixed(2)),
      potentialProfit: parseFloat(potentialProfit.toFixed(2)),
      totalProducts: products.length,
      byCategory: categoryData,
      lowStockProducts: lowStock.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        stock: p.stock,
        minStock: p.minStock,
        image: p.image
      }))
    });
  } catch (error) {
    console.error('Error getting inventory value:', error);
    res.status(500).json({ error: 'Error al obtener valor del inventario' });
  }
};

// Resumen de órdenes de trabajo
exports.getWorkOrderSummary = async (req, res) => {
  try {
    const statusCount = await prisma.workOrder.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const statusData = statusCount.map(s => ({
      name: s.status,
      value: s._count.status
    }));

    // Órdenes por prioridad
    const priorityCount = await prisma.workOrder.groupBy({
      by: ['priority'],
      _count: { priority: true }
    });

    const priorityData = priorityCount.map(p => ({
      name: p.priority,
      value: p._count.priority
    }));

    // Ingresos por órdenes finalizadas
    const completedOrders = await prisma.workOrder.findMany({
      where: { status: 'DELIVERED' },
      include: {
        items: true,
        laborServices: true
      }
    });

    const totalRevenue = completedOrders.reduce((sum, order) => {
      const partsTotal = order.items.reduce((s, item) => s + parseFloat(item.subtotal), 0);
      const laborTotal = order.laborServices.reduce((s, ls) => s + parseFloat(ls.total), 0);
      return sum + partsTotal + laborTotal;
    }, 0);

    res.json({
      byStatus: statusData,
      byPriority: priorityData,
      totalCompleted: completedOrders.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2))
    });
  } catch (error) {
    console.error('Error getting work order summary:', error);
    res.status(500).json({ error: 'Error al obtener resumen de órdenes' });
  }
};
