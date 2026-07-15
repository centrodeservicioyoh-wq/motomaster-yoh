const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const catalogRoutes = require('./routes/catalog.routes');
const saleRoutes = require('./routes/sale.routes');
const workOrderRoutes = require('./routes/workorder.routes');
const customerRoutes = require('./routes/customer.routes');
const motorcycleRoutes = require('./routes/motorcycle.routes');
const reportRoutes = require('./routes/report.routes');
const cashRegisterRoutes = require('./routes/cashRegister.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', catalogRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/motorcycles', motorcycleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/cash-register', cashRegisterRoutes);

app.get('/api', (req, res) => {

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'MOTOMASTER YOH - Sistema de Gestión',
    api: '/api',
    status: 'Online'
  });
});
  res.json({ message: 'API de MOTOMASTER YOH - Funcionando' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Base de datos: refaccionaria_taller`);
});

