// Arquivo de configuração do banco de dados
const mongoose = require('mongoose');

// URL de conexão com o MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cannabis-app';

// Opções de conexão
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
};

// Função para conectar ao banco de dados
const connectDB = async () => {
  try {
    // Tentar conectar ao MongoDB
    await mongoose.connect(MONGODB_URI, options);
    console.log('Conexão com o banco de dados MongoDB estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados MongoDB:', error.message);
    console.log('Aplicação funcionará sem persistência de dados');
    return false;
  }
};

module.exports = { connectDB };
