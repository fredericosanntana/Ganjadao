// server.js (site antigo)
const express    = require('express');
const session    = require('express-session');
const bodyParser = require('body-parser');
const path       = require('path');
const cors       = require('cors');
const { connectDB } = require('./config/database');

// Cria a aplicação principal
const mainApp = express();
const PORT    = process.env.PORT || 3000;

// Configuração do EJS no mainApp
mainApp.set('view engine', 'ejs');
mainApp.set('views', [path.join(__dirname, 'views')]);

// Middlewares do mainApp
mainApp.use(cors());
mainApp.use(bodyParser.urlencoded({ extended: true }));
mainApp.use(bodyParser.json());
mainApp.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
mainApp.use(session({
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
  console.log(
    connected
      ? '✅ Banco de dados conectado'
      : '⚠️ Aplicação funcionando sem persistência de dados'
  );
});

// Importa o sub-app do GanjaDAO Clube
const clubeApp = require(path.join(__dirname, 'ganjadao-clube', 'app'));

// Rotas do site antigo
mainApp.use('/', require('./routes/index'));
mainApp.use('/juridico', require('./routes/juridico'));
mainApp.use('/calculadoras', require('./routes/calculadoras'));
mainApp.use('/conteudo', require('./routes/conteudo'));

// Monta o sub-app do Clube em /clube
mainApp.use('/clube', clubeApp);

// Middleware de erro 404 no mainApp
mainApp.use((req, res) => {
  res.status(404).render('404', {
    title: 'Página não encontrada',
    layout: 'error'
  });
});

// Tratamento de erros global no mainApp
mainApp.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: 'Erro interno',
    layout: 'error'
  });
});

// Inicia o mainApp
mainApp.listen(PORT, () => {
  console.log(`🚀 Servidor principal rodando na porta ${PORT}`);
  console.log(`📂 Diretório de views: ${path.join(__dirname, 'views')}`);
});

module.exports = mainApp;
