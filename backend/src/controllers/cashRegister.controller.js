const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.open = async (req, res) => {
  try {
    const userId = req.user.id;
    const { openingBalance } = req.body;

    const existingOpen = await prisma.cashRegister.findFirst({
      where: { userId, status: 'OPEN' }
    });

    if (existingOpen) {
      return res.status(400).json({ error: 'Ya hay una caja abierta' });
    }

    const cashRegister = await prisma.cashRegister.create({
      data: {
        userId,
        openingBalance: parseFloat(openingBalance) || 0,
        status: 'OPEN',
        openingTime: new Date()
      }
    });

    res.status(201).json({ message: 'Caja abierta exitosamente', cashRegister });
  } catch (error) {
    console.error('Error al abrir caja:', error);
    res.status(500).json({ error: 'Error al abrir la caja' });
  }
};

exports.close = async (req, res) => {
  try {
    const userId = req.user.id;
    const { closingBalance, notes } = req.body;

    const cashRegister = await prisma.cashRegister.findFirst({
      where: { userId, status: 'OPEN' }
    });

    if (!cashRegister) {
      return res.status(404).json({ error: 'No hay una caja abierta' });
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: cashRegister.openingTime },
        status: 'COMPLETED'
      },
      include: { items: true }
    });

    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const cashSales = sales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + parseFloat(s.total), 0);
    const cardSales = sales.filter(s => s.paymentMethod === 'CARD').reduce((sum, s) => sum + parseFloat(s.total), 0);
    const creditSales = sales.filter(s => s.paymentMethod === 'CREDIT').reduce((sum, s) => sum + parseFloat(s.total), 0);

    const totalProfit = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + parseFloat(item.profit), 0);
    }, 0);

    const workOrders = await prisma.workOrder.findMany({
      where: {
        createdAt: { gte: cashRegister.openingTime },
        status: 'DELIVERED'
      },
      include: { items: true, laborServices: true }
    });

    const partsTotal = workOrders.reduce((sum, wo) => {
      return sum + wo.items.reduce((s, item) => s + parseFloat(item.subtotal), 0);
    }, 0);

    const laborTotal = workOrders.reduce((sum, wo) => {
      return sum + wo.laborServices.reduce((s, ls) => s + parseFloat(ls.total), 0);
    }, 0);

    const laborProfit = workOrders.reduce((sum, wo) => {
      return sum + wo.laborServices.reduce((s, ls) => s + parseFloat(ls.profit), 0);
    }, 0);

    const updated = await prisma.cashRegister.update({
      where: { id: cashRegister.id },
      data: {
        closingBalance: closingBalance ? parseFloat(closingBalance) : null,
        totalSalesRefacciones: cashSales,
        totalCostRefacciones: cashSales - totalProfit,
        profitRefacciones: totalProfit,
        totalLabor: laborTotal,
        profitLabor: laborProfit,
        totalProfit: totalProfit + laborProfit,
        cashReceived: cashSales,
        cardReceived: cardSales,
        creditSales: creditSales,
        status: 'CLOSED',
        closingTime: new Date(),
        notes
      },
      include: { user: true }
    });

    res.json({
      message: 'Caja cerrada exitosamente',
      cashRegister: updated,
      summary: {
        totalSales,
        cashSales,
        cardSales,
        creditSales,
        totalWorkOrders: partsTotal + laborTotal,
        partsTotal,
        laborTotal,
        totalProfit: totalProfit + laborProfit,
        difference: closingBalance ? parseFloat(closingBalance) - (cashRegister.openingBalance + cashSales) : null
      }
    });
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({ error: 'Error al cerrar la caja' });
  }
};

exports.getCurrent = async (req, res) => {
  try {
    const userId = req.user.id;

    const cashRegister = await prisma.cashRegister.findFirst({
      where: { userId, status: 'OPEN' },
      include: { user: true }
    });

    if (!cashRegister) {
      return res.json({ isOpen: false });
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: cashRegister.openingTime },
        status: 'COMPLETED'
      },
      include: { items: true }
    });

    const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const cashSales = sales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + parseFloat(s.total), 0);
    const cardSales = sales.filter(s => s.paymentMethod === 'CARD').reduce((sum, s) => sum + parseFloat(s.total), 0);

    res.json({
      isOpen: true,
      cashRegister,
      currentSales: { total: totalSales, cash: cashSales, card: cardSales }
    });
  } catch (error) {
    console.error('Error al obtener caja actual:', error);
    res.status(500).json({ error: 'Error al obtener la caja' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { status: 'CLOSED' };

    if (startDate || endDate) {
      where.closingTime = {};
      if (startDate) where.closingTime.gte = new Date(startDate);
      if (endDate) where.closingTime.lte = new Date(endDate);
    }

    const cashRegisters = await prisma.cashRegister.findMany({
      where,
      include: { user: true },
      orderBy: { closingTime: 'desc' },
      take: 50
    });

    res.json(cashRegisters);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const cashRegister = await prisma.cashRegister.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!cashRegister) {
      return res.status(404).json({ error: 'Caja no encontrada' });
    }

    res.json(cashRegister);
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ error: 'Error al obtener el resumen' });
  }
};
