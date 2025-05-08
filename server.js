const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS primeiro
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'views/partials') // Adicione partials como diretório de views
]);

// Restante dos middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'ganjadao-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hora
  }
}));

// Conexão com o banco de dados
connectDB().then(connected => {
  connected 
    ? console.log('✅ Banco de dados conectado')
    : console.log('⚠️ Aplicação funcionando sem persistência de dados');
});

// Rotas
app.use('/', require('./routes/index'));
app.use('/juridico', require('./routes/juridico'));
app.use('/calculadoras', require('./routes/calculadoras'));
app.use('/conteudo', require('./routes/conteudo'));

// Middleware de erro 404
app.use((req, res, next) => {
  res.status(404).render('404', { 
    title: 'Página não encontrada',
    layout: 'error' // Se quiser usar um layout diferente
  });
});

// Error handling global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: 'Erro interno',
    layout: 'error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor GanjaDAO rodando na porta ${PORT}`);
  console.log(`📂 Diretório de views: ${path.join(__dirname, 'views')}`);
});

module.exports = app;