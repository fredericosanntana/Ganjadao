const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'ganjadao.db');
console.log("⤷ process.cwd():", process.cwd());
console.log("⤷ __dirname:", __dirname);
console.log("⤷ Usando dbPath:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        db.serialize(() => {
            // Tabela de Usuários
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_admin BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) console.error("Erro ao criar tabela 'users':", err.message);
            });

            // Tabela de Assinaturas
            db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending', -- pending, active, cancelled, expired
                start_date DATETIME,
                end_date DATETIME,
                payment_id TEXT, -- Para simulação ou futura integração
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) console.error("Erro ao criar tabela 'subscriptions':", err.message);
            });

            // Tabela de Iniciativas (para votação)
            db.run(`CREATE TABLE IF NOT EXISTS initiatives (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                created_by INTEGER, -- user_id do admin que criou
                is_active BOOLEAN DEFAULT 1, -- Se está aberta para votação
                voting_deadline DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )`, (err) => {
                if (err) console.error("Erro ao criar tabela 'initiatives':", err.message);
            });

            // Tabela de Votos (Votação Quadrática)
            // Cada usuário pode dar múltiplos "votos" (créditos) para uma iniciativa.
            // O custo de cada voto adicional aumenta quadraticamente.
            // Ex: 1º voto custa 1 crédito, 2º voto custa 4 créditos, 3º voto custa 9 créditos para a MESMA iniciativa.
            // Ou, mais simples para começar: usuário tem X créditos de voto por período, e aloca N votos para uma iniciativa, onde N é o número de "vozes".
            // A soma dos quadrados das "vozes" de um usuário em todas as iniciativas não pode exceder seus créditos totais.
            // Vamos simplificar: cada voto tem um peso. O usuário distribui X créditos de voto.
            // Para votação quadrática, o custo de 'n' votos é n^2 créditos.
            // Um usuário pode votar em múltiplas iniciativas.
            db.run(`CREATE TABLE IF NOT EXISTS votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                initiative_id INTEGER NOT NULL,
                vote_credits INTEGER NOT NULL, -- Quantos créditos o usuário alocou para esta iniciativa (equivale a sqrt(custo))
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, initiative_id), -- Usuário só pode ter uma entrada de voto por iniciativa
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (initiative_id) REFERENCES initiatives(id)
            )`, (err) => {
                if (err) console.error("Erro ao criar tabela 'votes':", err.message);
            });

            // Tabela para armazenar o total de créditos de voto de um usuário por ciclo de votação (se aplicável)
            db.run(`CREATE TABLE IF NOT EXISTS user_vote_credits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                total_credits INTEGER NOT NULL DEFAULT 100, -- Ex: 100 créditos por ciclo
                credits_used INTEGER NOT NULL DEFAULT 0,
                last_reset_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`, (err) => {
                if (err) console.error("Erro ao criar tabela 'user_vote_credits':", err.message);
            });
        });
    }
});

module.exports = db;

