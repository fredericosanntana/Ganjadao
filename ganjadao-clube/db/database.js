// ganjadao-clube/db/database.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (...);
      -- demais tabelas conforme arquitetura
    `);
    console.log('Tabelas garantidas no PostgreSQL');
  } catch (e) {
    console.error('Erro na inicialização do DB:', e);
  } finally {
    client.release();
  }
})();

module.exports = pool;