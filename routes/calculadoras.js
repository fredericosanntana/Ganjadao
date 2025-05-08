const express = require('express');
const router = express.Router();

// Rota para a página principal de calculadoras
router.get('/', (req, res) => {
  res.render('calculadoras/index');
});

// Rotas para cada calculadora individual
router.get('/vpd', (req, res) => {
  res.render('calculadoras/vpd');
});

router.get('/dli', (req, res) => {
  res.render('calculadoras/dli');
});

router.get('/nutrientes', (req, res) => {
  res.render('calculadoras/nutrientes');
});

router.get('/dew-point', (req, res) => {
  res.render('calculadoras/dew-point');
});

router.get('/ec-flush', (req, res) => {
  res.render('calculadoras/ec-flush');
});

module.exports = router;
