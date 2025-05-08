const express = require('express');
const router = express.Router();
const juridicoController = require('../controllers/juridicoController');

// Rotas para o Gerador de Habeas Corpus
router.get('/habeas-corpus', juridicoController.getHabeasCorpusForm);
router.post('/habeas-corpus', juridicoController.generateHabeasCorpus);

// Rotas para a Central de Documentos
router.get('/documentos', juridicoController.getDocumentos);
router.get('/documentos/:tipo', juridicoController.getDocumentoTemplate);
router.post('/documentos/:tipo/gerar', juridicoController.generateDocumento);
// Importar middleware de upload
const uploadHandler = require('../utils/uploadHandler');
router.post('/documentos/upload', uploadHandler.uploadMiddleware, juridicoController.uploadDocumento);
router.get('/documentos/qrcode', juridicoController.getQRCode);
router.get('/documentos/qrcode/:id', juridicoController.getQRCode);

// Rotas para a Base de Jurisprudência
router.get('/jurisprudencia', juridicoController.getJurisprudencia);
router.get('/jurisprudencia/filtro', juridicoController.filtrarJurisprudencia);
router.get('/jurisprudencia/:id', juridicoController.getJurisprudenciaDetalhes);

// Nova rota para busca direta no DataJud
router.get('/jurisprudencia/datajud/busca', juridicoController.buscarDataJud);

module.exports = router;
