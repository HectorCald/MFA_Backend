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

// Conexión a DB y ruta de prueba raíz (como en tu snippet)
const db = require('./src/config/db');
app.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.send(`Servidor funcionando ✅ - Hora DB: ${result.rows[0].now}`);
    } catch (err) {
        res.status(500).send(`Error DB: ${err.message}`);
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
