// Servir frontend estático
app.use(express.static(path.join(__dirname, '../public')));

// Todas las rutas no-API van al frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
