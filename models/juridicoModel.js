// Modelo para o módulo jurídico
const mongoose = require('mongoose');

// Modelo para Habeas Corpus
const habeasCorpusSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cpf: { type: String, required: true },
  endereco: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: String, required: true },
  quantidadePlantas: { type: Number, required: true },
  finalidadeUso: { type: String, required: true },
  fundamentosJuridicos: [{ type: String }],
  motivacao: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
  pdfPath: { type: String },
  status: { type: String, default: 'Pendente' }
});

// Modelo para Documentos
const documentoSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  usuario: { type: String },
  dataCriacao: { type: Date, default: Date.now },
  arquivoPath: { type: String },
  qrCodePath: { type: String }
});

// Modelo para Jurisprudência
const jurisprudenciaSchema = new mongoose.Schema({
  numeroProcesso: { type: String, required: true },
  tribunal: { type: String, required: true },
  estado: { type: String, required: true },
  desembargador: { type: String },
  dataDecisao: { type: Date },
  ementa: { type: String, required: true },
  decisao: { type: String, required: true },
  quantidadePlantas: { type: Number },
  tipoUso: { type: String },
  resultado: { type: String, required: true }
});

const HabeasCorpus = mongoose.model('HabeasCorpus', habeasCorpusSchema);
const Documento = mongoose.model('Documento', documentoSchema);
const Jurisprudencia = mongoose.model('Jurisprudencia', jurisprudenciaSchema);

module.exports = {
  HabeasCorpus,
  Documento,
  Jurisprudencia
};
