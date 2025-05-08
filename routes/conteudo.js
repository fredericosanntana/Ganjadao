const express = require('express');
const router = express.Router();

// Rota para "Seu Cultivo Está Seguro? – Checklist jurídico"
router.get('/checklist-juridico', (req, res) => {
    res.render('conteudo/01_checklist_juridico', { title: 'Seu Cultivo Está Seguro? – Checklist Jurídico GanjaDAO', user: req.user });
});

// Rota para "Bastidores da GanjaDAO – Como nasce um HC que protege em rede"
router.get('/bastidores-ganjadao', (req, res) => {
    res.render('conteudo/02_bastidores_ganjadao', { title: 'Bastidores da GanjaDAO – Como Nasce um HC que Protege em Rede', user: req.user });
});

// Rota para "Caso Real: Como a Mariana Protegeu Seu Cultivo com a GanjaDAO"
router.get('/caso-mariana', (req, res) => {
    res.render('conteudo/03_caso_real_mariana', { title: 'Caso Real: Como a Mariana Protegeu Seu Cultivo com a GanjaDAO', user: req.user });
});

// Rota para "Convocação DAO: Vamos votar nossa próxima missão coletiva?"
router.get('/convocacao-dao', (req, res) => {
    res.render('conteudo/04_convocacao_dao', { title: 'Convocação DAO: Vamos Votar Nossa Próxima Missão Coletiva?', user: req.user });
});

// Rota para "Isso é mesmo válido na Justiça? – Mitos e verdades sobre o HC Digital"
router.get('/mitos-verdades-hc', (req, res) => {
    res.render('conteudo/05_mitos_verdades_hc_digital', { title: 'Isso é Mesmo Válido na Justiça? Mitos e Verdades sobre o HC Digital - GanjaDAO', user: req.user });
});

// Rota para "Cultivo Legal – Como descentralizar o direito à planta"
router.get('/cultivo-legal', (req, res) => {
    res.render('conteudo/06_cultivo_legal', { title: 'Cultivo Legal – Como Descentralizar o Direito à Planta - GanjaDAO', user: req.user });
});

// Rota para "Oferta DAO Ativa: Gere seu HC Digital com 50% de desconto (últimos dias!)"
router.get('/oferta-dao', (req, res) => {
    res.render('conteudo/07_oferta_dao_ativa', { title: 'Oferta DAO Ativa: Gere seu HC Digital com 50% de Desconto! - GanjaDAO', user: req.user });
});

// Rota para "Manual do Cultivador Autônomo: Do primeiro broto à primeira defesa jurídica"
router.get('/manual-cultivador', (req, res) => {
    res.render('conteudo/08_manual_cultivador_autonomo', { title: 'Manual do Cultivador Autônomo: Do Broto à Defesa Jurídica - GanjaDAO', user: req.user });
});

// Rota para "O Mapa da Proteção – Veja onde o autocultivo já está blindado por HCs"
router.get('/mapa-protecao', (req, res) => {
    res.render('conteudo/09_mapa_protecao', { title: 'O Mapa da Proteção – Onde o Autocultivo está Blindado por HCs - GanjaDAO', user: req.user });
});

// Rota para "Chamada para Embaixadores: Ajude a proteger quem planta, com você na linha de frente"
router.get('/chamada-embaixadores', (req, res) => {
    res.render('conteudo/10_chamada_embaixadores', { title: 'Chamada para Embaixadores GanjaDAO: Proteja Quem Planta!', user: req.user });
});
// Rota para "Chamada para Embaixadores: Ajude a proteger quem planta, com você na linha de frente"
router.get('/anvisa', (req, res) => {
    res.render('conteudo/11_anvisa', { title: 'Manifestação Anvisa', user: req.user });
});
module.exports = router;
