const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear orden de trabajo
exports.create = async (req, res) => {
  try {
    const {
      motorcycleId,
      customerId,
      mechanicId,
      problemDescription,
      estimatedCost,
      priority = 'MEDIUM'
    } = req.body;

    // Buscar mecánico por ID o por nombre
    let finalMechanicId = null;
    if (mechanicId) {
      // Si es un UUID válido, usarlo directamente
      if (mechanicId.length === 36) {
        finalMechanicId = mechanicId;
      } else {
        // Buscar por nombre
        const mechanic = await prisma.user.findFirst({
          where: {
            name: { contains: mechanicId, mode: 'insensitive' }
          }
        });
        if (mechanic) {
          finalMechanicId = mechanic.id;
        } else {
          // Si no existe, crear un usuario mecánico
          const newMechanic = await prisma.user.create({
            data: {
              name: mechanicId,
              email: `mecanico.${Date.now()}@motomaster.com`,
              passwordHash: 'temporal',
              role: 'VENDEDOR'
            }
          });
          finalMechanicId = newMechanic.id;
        }
      }
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        motorcycleId,
        customerId,
        mechanicId: finalMechanicId,
        problemDescription,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        priority,
        status: 'RECEIVED'
      },
      include: {
        motorcycle: true,
        customer: true,
        mechanic: true
      }
    });

    res.status(201).json({ message: 'Orden de trabajo creada', workOrder });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: error.message || 'Error al crear la orden de trabajo' });
  }
};

// Obtener todas las órdenes
exports.getAll = async (req, res) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        motorcycle: true,
        customer: true,
        mechanic: true,
        items: { include: { product: true } },
        laborServices: { include: { mechanic: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(workOrders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// Obtener orden por ID
exports.getById = async (req, res) => {
  try {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: req.params.id },
      include: {
        motorcycle: true,
        customer: true,
        mechanic: true,
        items: { include: { product: true } },
        laborServices: { include: { mechanic: true } }
      }
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
};

// Actualizar estado
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const workOrder = await prisma.workOrder.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        motorcycle: true,
        customer: true,
        mechanic: true
      }
    });
    res.json({ message: 'Estado actualizado', workOrder });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
};

// Agregar refacciones
exports.addParts = async (req, res) => {
  try {
    const { items } = req.body;
    const workOrderId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const createdItems = [];
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }

        const workOrderItem = await tx.workOrderItem.create({
          data: {
            workOrderId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            subtotal: parseFloat(item.unitPrice) * item.quantity
          },
          include: { product: true }
        });
        createdItems.push(workOrderItem);

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });
      }
      return createdItems;
    });

    res.json({ message: 'Refacciones agregadas', items: result });
  } catch (error) {
    console.error('Error al agregar refacciones:', error);
    res.status(500).json({ error: error.message || 'Error al agregar refacciones' });
  }
};

// Agregar mano de obra
exports.addLabor = async (req, res) => {
  try {
    const { mechanicId, description, hours, ratePerHour, cost } = req.body;
    const workOrderId = req.params.id;

    const laborService = await prisma.laborService.create({
      data: {
        workOrderId,
        mechanicId,
        description,
        hours: parseFloat(hours),
        ratePerHour: parseFloat(ratePerHour),
        total: parseFloat(hours) * parseFloat(ratePerHour),
        cost: cost ? parseFloat(cost) : 0,
        profit: (parseFloat(hours) * parseFloat(ratePerHour)) - (cost ? parseFloat(cost) : 0)
      },
      include: { mechanic: true }
    });

    res.status(201).json({ message: 'Servicio agregado', laborService });
  } catch (error) {
    console.error('Error al agregar servicio:', error);
    res.status(500).json({ error: 'Error al agregar el servicio' });
  }
};

// Finalizar orden
exports.finalize = async (req, res) => {
  try {
    const { diagnosis, finalCost } = req.body;
    const workOrder = await prisma.workOrder.update({
      where: { id: req.params.id },
      data: {
        diagnosis,
        finalCost: finalCost ? parseFloat(finalCost) : null,
        status: 'READY',
        deliveredAt: new Date()
      },
      include: {
        motorcycle: true,
        customer: true,
        mechanic: true,
        items: { include: { product: true } },
        laborServices: true
      }
    });

    const partsTotal = workOrder.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const laborTotal = workOrder.laborServices.reduce((sum, labor) => sum + parseFloat(labor.total), 0);
    const total = partsTotal + laborTotal;

    res.json({
      message: 'Orden finalizada',
      workOrder,
      summary: { partsTotal, laborTotal, total }
    });
  } catch (error) {
    console.error('Error al finalizar orden:', error);
    res.status(500).json({ error: 'Error al finalizar la orden' });
  }
};

// Órdenes activas
exports.getActive = async (req, res) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      where: {
        status: { in: ['RECEIVED', 'DIAGNOSING', 'REPAIRING', 'READY'] }
      },
      include: {
        motorcycle: true,
        customer: true,
        mechanic: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes activas' });
  }
};
