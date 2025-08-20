const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

const apiRoutes = require('./src/routes');
app.use('/api', apiRoutes);

// Middleware de manejo de errores (debe ir después de las rutas)
const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
const db = require('./src/config/db');

db.query('SELECT NOW()')
  .then(res => console.log('Hora actual en PostgreSQL:', res.rows[0]))
  .catch(err => console.error('Error al conectar a PostgreSQL', err));
