const express = require('express');
const router = express.Router();

// Rota para a página inicial
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Apoio ao Autocultivo de Cannabis',
    description: 'Plataforma de apoio jurídico e educacional para autocultivadores'
  });
});

// Rota para a página inicial do módulo jurídico
router.get('/juridico', (req, res) => {
  res.render('juridico/index', { 
    title: 'Módulo Jurídico - Apoio ao Autocultivo de Cannabis'
  });
});

module.exports = router;
