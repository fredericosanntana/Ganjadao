// ganjadao-clube/db/database.js
require('dotenv').config();
const { Pool } = require('pg');

// Usa a variável de ambiente DATABASE_URL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  const client = await pool.connect();
  try {
    // Criação de tabelas (executar uma vez no start)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email    TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        status  TEXT NOT NULL DEFAULT 'pending',
        start_date TIMESTAMP,
        end_date   TIMESTAMP,
        payment_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS initiatives (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_by INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT TRUE,
        voting_deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        initiative_id INTEGER REFERENCES initiatives(id),
        vote_credits INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, initiative_id)
      );
      CREATE TABLE IF NOT EXISTS user_vote_credits (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        total_credits INTEGER DEFAULT 100,
        credits_used  INTEGER DEFAULT 0,
        last_reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabelas garantidas no PostgreSQL');
  } catch (e) {
    console.error('Erro na inicialização do DB:', e);
  } finally {
    client.release();
  }
})();

module.exports = pool;