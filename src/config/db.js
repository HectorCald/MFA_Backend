const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('📦 Conectado a PostgreSQL');
});

// Método para obtener un cliente para transacciones
pool.getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = pool;
