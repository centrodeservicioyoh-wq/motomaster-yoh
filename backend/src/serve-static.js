const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'API de MOTOMASTER YOH - Funcionando' });
});

// Todas las demás rutas van al frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📦 Frontend servido desde public/`);
});
