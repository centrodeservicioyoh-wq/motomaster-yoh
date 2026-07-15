const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const create = async (req, res) => {
  try {
    const { customerId, brand, model, year, color, plate, vin, description } = req.body;
    const motorcycle = await prisma.motorcycle.create({
      data: {
        customerId,
        brand,
        model,
        year: year ? parseInt(year) : null,
        color,
        plate,
        vin,
        description
      }
    });
    res.status(201).json(motorcycle);
  } catch (error) {
    console.error('Error creating motorcycle:', error);
    res.status(500).json({ error: 'Error al crear motocicleta' });
  }
};

const getAll = async (req, res) => {
  try {
    const motorcycles = await prisma.motorcycle.findMany({
      include: { customer: true },
      orderBy: { brand: 'asc' }
    });
    res.json(motorcycles);
  } catch (error) {
    console.error('Error getting motorcycles:', error);
    res.status(500).json({ error: 'Error al obtener motocicletas' });
  }
};

module.exports = { create, getAll };
