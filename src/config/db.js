const { Pool } = require('pg');
require('dotenv').config();

// Permite usar DATABASE_URL (Render/Heroku) o variables individuales locales
const connectionOptions = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // SSL requerido para Render
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'false',
    };

let pool;
try {
    pool = new Pool(connectionOptions);
    console.log('🔧 Pool de conexión creado exitosamente');
} catch (error) {
    console.error('❌ Error al crear el pool de conexión:', error.message);
    process.exit(1);
}

pool.on('connect', () => {
    console.log('📦 Conectado exitosamente a PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error en la conexión a PostgreSQL:', err.message);
});

// Método para obtener un cliente para transacciones
pool.getClient = async () => {
    const client = await pool.connect();
    return client;
};

// Probar la conexión inmediatamente al cargar el módulo
pool.query('SELECT NOW()')
    .then(result => {
        console.log('📦 Conexión a PostgreSQL verificada - Hora DB:', result.rows[0].now);
    })
    .catch(err => {
        console.error('❌ Error al verificar conexión:', err.message);
    });

module.exports = pool;
