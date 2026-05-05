require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/operadores',          require('./routes/operadores'));
app.use('/api/vehiculos',           require('./routes/vehiculos'));
app.use('/api/productos',           require('./routes/productos'));
app.use('/api/despachos', require('./routes/despachos'));
app.use('/api/despacho-productos',  require('./routes/despachoProductos'));
app.use('/api/alertas',             require('./routes/alertas'));
app.use('/api/guias-remision',      require('./routes/guiasRemision'));
app.use('/api/ordenes-auto', require('./routes/ordenesIA'));

app.get('/', (req, res) => {
  res.json({ mensaje: 'ERP Logística API funcionando ✓' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Error al iniciar:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});