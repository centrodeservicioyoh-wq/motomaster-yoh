#!/bin/bash

# Build del frontend
cd frontend
npm run build

# Copiar build al backend
cp -r dist ../backend/public

# Actualizar backend para servir estáticos
cd ../backend/src

cat > serve-frontend.js << 'INNEREOF'
// Servir frontend estático
app.use(express.static(path.join(__dirname, '../public')));

// Todas las rutas no-API van al frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
INNEREOF

# Insertar antes de app.listen
sed -i '' '/^app.get.*\/api/a\
\
// Servir frontend estático\
app.use(express.static(path.join(__dirname, '\''../public'\'')));\
\
// Todas las rutas no-API van al frontend\
app.get('\''*'\'', (req, res) => {\
  res.sendFile(path.join(__dirname, '\''../public/index.html'\''));\
});' index.js

echo "Frontend integrado al backend"
