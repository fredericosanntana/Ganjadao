// Utilitário para gerenciar templates de documentos
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Templates de documentos disponíveis
const documentTemplates = {
  termo: {
    nome: 'Termo de Responsabilidade',
    descricao: 'Documento que estabelece as responsabilidades do autocultivador.',
    campos: ['nome', 'cpf', 'endereco', 'quantidadePlantas', 'finalidadeUso']
  },
  declaracao: {
    nome: 'Declaração de Uso Pessoal',
    descricao: 'Documento que declara que o cultivo é destinado exclusivamente para uso pessoal.',
    campos: ['nome', 'cpf', 'endereco', 'quantidadePlantas', 'finalidadeUso']
  },
  plano: {
    nome: 'Plano de Cultivo',
    descricao: 'Documento que detalha o plano de cultivo, incluindo quantidade de plantas e finalidade.',
    campos: ['nome', 'cpf', 'endereco', 'quantidadePlantas', 'finalidadeUso', 'espacoCultivo', 'cicloVegetativo', 'cicloFlora']
  },
  anexos: {
    nome: 'Anexos Jurídicos e Técnicos',
    descricao: 'Documentos complementares para embasar o pedido de Habeas Corpus.',
    campos: ['nome', 'cpf', 'numeroProcesso']
  }
};

// Função para gerar PDF de um documento específico
exports.generateDocumentPDF = async (tipo, dadosDocumento) => {
  return new Promise((resolve, reject) => {
    try {
      // Verificar se o tipo de documento existe
      if (!documentTemplates[tipo]) {
        throw new Error(`Tipo de documento '${tipo}' não encontrado.`);
      }

      // Criar diretório para armazenar os PDFs se não existir
      const pdfDir = path.join(__dirname, '../public/docs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Definir nome do arquivo
      const timestamp = Date.now();
      const filename = `${tipo}_${timestamp}.pdf`;
      const filePath = path.join(pdfDir, filename);
      
      // Criar documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      // Pipe do PDF para arquivo
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Adicionar cabeçalho
      doc.fontSize(16).font('Helvetica-Bold').text(documentTemplates[tipo].nome.toUpperCase(), { align: 'center' });
      doc.moveDown();
      
      // Conteúdo específico para cada tipo de documento
      switch (tipo) {
        case 'termo':
          gerarTermoResponsabilidade(doc, dadosDocumento);
          break;
        case 'declaracao':
          gerarDeclaracaoUsoPessoal(doc, dadosDocumento);
          break;
        case 'plano':
          gerarPlanoCultivo(doc, dadosDocumento);
          break;
        case 'anexos':
          gerarAnexosJuridicos(doc, dadosDocumento);
          break;
      }
      
      // Finalizar PDF
      doc.end();
      
      // Resolver promessa quando o stream for fechado
      stream.on('finish', () => {
        resolve({
          filePath: filePath,
          fileName: filename,
          publicPath: `/docs/${filename}`
        });
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

// Função para obter a lista de templates disponíveis
exports.getAvailableTemplates = () => {
  return Object.keys(documentTemplates).map(key => ({
    id: key,
    nome: documentTemplates[key].nome,
    descricao: documentTemplates[key].descricao,
    campos: documentTemplates[key].campos
  }));
};

// Função para obter informações de um template específico
exports.getTemplateInfo = (tipo) => {
  if (!documentTemplates[tipo]) {
    return null;
  }
  
  return {
    id: tipo,
    nome: documentTemplates[tipo].nome,
    descricao: documentTemplates[tipo].descricao,
    campos: documentTemplates[tipo].campos
  };
};

// Funções auxiliares para gerar o conteúdo de cada tipo de documento

function gerarTermoResponsabilidade(doc, dados) {
  doc.fontSize(12).font('Helvetica-Bold').text('TERMO DE RESPONSABILIDADE PARA AUTOCULTIVO DE CANNABIS', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(12).font('Helvetica').text(
    `Eu, ${dados.nome}, portador(a) do CPF ${dados.cpf}, residente e domiciliado(a) em ${dados.endereco}, ` +
    `DECLARO para os devidos fins que cultivo ${dados.quantidadePlantas} planta(s) de Cannabis para ${dados.finalidadeUso}, ` +
    `assumindo total responsabilidade pelo cultivo, produção e uso do material vegetal.`,
    { align: 'justify' }
  );
  doc.moveDown();
  
  doc.text(
    'DECLARO ainda que:',
    { align: 'justify' }
  );
  doc.moveDown();
  
  doc.text(
    '1. O cultivo é realizado exclusivamente para uso pessoal, sem qualquer finalidade comercial;',
    { align: 'justify' }
  );
  doc.text(
    '2. Não realizo e não realizarei qualquer forma de comércio, doação ou distribuição do material vegetal cultivado;',
    { align: 'justify' }
  );
  doc.text(
    '3. Mantenho o cultivo em local seguro, inacessível a terceiros, especialmente crianças e adolescentes;',
    { align: 'justify' }
  );
  doc.text(
    '4. Estou ciente das responsabilidades legais e possíveis consequências jurídicas relacionadas ao cultivo;',
    { align: 'justify' }
  );
  doc.text(
    '5. Comprometo-me a utilizar o material vegetal de forma responsável e consciente.',
    { align: 'justify' }
  );
  doc.moveDown(2);
  
  // Data e assinatura
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.text(`${dados.endereco.split(',')[0]}, ${dataAtual}`, { align: 'center' });
  doc.moveDown(2);
  doc.text('_______________________________', { align: 'center' });
  doc.text(`${dados.nome}`, { align: 'center' });
  doc.text(`CPF: ${dados.cpf}`, { align: 'center' });
}

function gerarDeclaracaoUsoPessoal(doc, dados) {
  doc.fontSize(12).font('Helvetica-Bold').text('DECLARAÇÃO DE USO PESSOAL DE CANNABIS', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(12).font('Helvetica').text(
    `Eu, ${dados.nome}, portador(a) do CPF ${dados.cpf}, residente e domiciliado(a) em ${dados.endereco}, ` +
    `DECLARO para os devidos fins que cultivo ${dados.quantidadePlantas} planta(s) de Cannabis exclusivamente para uso pessoal, ` +
    `com finalidade ${dados.finalidadeUso}.`,
    { align: 'justify' }
  );
  doc.moveDown();
  
  doc.text(
    'DECLARO, sob as penas da lei, que:',
    { align: 'justify' }
  );
  doc.moveDown();
  
  doc.text(
    '1. O cultivo é destinado exclusivamente para consumo pessoal, sem qualquer finalidade de tráfico ou comércio;',
    { align: 'justify' }
  );
  doc.text(
    '2. A quantidade cultivada é compatível com o uso pessoal, conforme previsto no art. 28, §2º da Lei 11.343/2006;',
    { align: 'justify' }
  );
  doc.text(
    '3. O cultivo é realizado em ambiente privado, respeitando o direito constitucional à privacidade (art. 5º, X, CF);',
    { align: 'justify' }
  );
  doc.text(
    '4. Estou ciente de que o autocultivo para uso pessoal está amparado pelos princípios constitucionais da dignidade da pessoa humana, da privacidade e da autodeterminação.',
    { align: 'justify' }
  );
  doc.moveDown(2);
  
  // Data e assinatura
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.text(`${dados.endereco.split(',')[0]}, ${dataAtual}`, { align: 'center' });
  doc.moveDown(2);
  doc.text('_______________________________', { align: 'center' });
  doc.text(`${dados.nome}`, { align: 'center' });
  doc.text(`CPF: ${dados.cpf}`, { align: 'center' });
}

function gerarPlanoCultivo(doc, dados) {
  doc.fontSize(12).font('Helvetica-Bold').text('PLANO DE CULTIVO DE CANNABIS', { align: 'center' });
  doc.moveDown();
  
  // Dados pessoais
  doc.fontSize(12).font('Helvetica-Bold').text('1. DADOS PESSOAIS', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(`Nome: ${dados.nome}`, { align: 'left' });
  doc.text(`CPF: ${dados.cpf}`, { align: 'left' });
  doc.text(`Endereço: ${dados.endereco}`, { align: 'left' });
  doc.moveDown();
  
  // Informações do cultivo
  doc.fontSize(12).font('Helvetica-Bold').text('2. INFORMAÇÕES DO CULTIVO', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(`Quantidade de plantas: ${dados.quantidadePlantas}`, { align: 'left' });
  doc.text(`Finalidade de uso: ${dados.finalidadeUso}`, { align: 'left' });
  doc.text(`Espaço de cultivo: ${dados.espacoCultivo || 'Não informado'}`, { align: 'left' });
  doc.text(`Ciclo vegetativo: ${dados.cicloVegetativo || 'Não informado'}`, { align: 'left' });
  doc.text(`Ciclo de floração: ${dados.cicloFlora || 'Não informado'}`, { align: 'left' });
  doc.moveDown();
  
  // Justificativa
  doc.fontSize(12).font('Helvetica-Bold').text('3. JUSTIFICATIVA', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(
    `O presente plano de cultivo visa atender às necessidades pessoais relacionadas ao uso ${dados.finalidadeUso} de Cannabis. ` +
    `A quantidade de plantas (${dados.quantidadePlantas}) foi determinada considerando o ciclo de cultivo e a necessidade de uso contínuo.`,
    { align: 'justify' }
  );
  doc.moveDown();
  
  // Compromissos
  doc.fontSize(12).font('Helvetica-Bold').text('4. COMPROMISSOS', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(
    '- Manter o cultivo em local seguro e privado;\n' +
    '- Não comercializar ou distribuir o material vegetal;\n' +
    '- Utilizar técnicas de cultivo orgânico, sem uso de pesticidas nocivos;\n' +
    '- Manter registro das atividades de cultivo;\n' +
    '- Respeitar a legislação vigente e os princípios constitucionais.',
    { align: 'left' }
  );
  doc.moveDown(2);
  
  // Data e assinatura
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.text(`${dados.endereco.split(',')[0]}, ${dataAtual}`, { align: 'center' });
  doc.moveDown(2);
  doc.text('_______________________________', { align: 'center' });
  doc.text(`${dados.nome}`, { align: 'center' });
  doc.text(`CPF: ${dados.cpf}`, { align: 'center' });
}

function gerarAnexosJuridicos(doc, dados) {
  doc.fontSize(12).font('Helvetica-Bold').text('ANEXOS JURÍDICOS E TÉCNICOS', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(12).font('Helvetica').text(
    `REFERENTE AO PROCESSO: ${dados.numeroProcesso || 'A ser definido'}`,
    { align: 'center' }
  );
  doc.moveDown(2);
  
  // Fundamentos jurídicos
  doc.fontSize(12).font('Helvetica-Bold').text('1. FUNDAMENTOS JURÍDICOS', { align: 'left' });
  doc.moveDown(0.5);
  
  doc.fontSize(12).font('Helvetica').text(
    'REsp 2.121.548 - Superior Tribunal de Justiça',
    { align: 'left' }
  );
  doc.fontSize(10).text(
    'Decisão que reconheceu a possibilidade de cultivo de cannabis para fins medicinais, sendo reconhecido como exercício do direito à saúde.',
    { align: 'justify' }
  );
  doc.moveDown();
  
  doc.fontSize(12).font('Helvetica').text(
    'RE 635.659 - Supremo Tribunal Federal',
    { align: 'left' }
  );
  doc.fontSize(10).text(
    'Recurso que discute a inconstitucionalidade do art. 28 da Lei de Drogas, questionando a criminalização do porte de drogas para consumo pessoal, com base no direito à privacidade e autonomia individual.',
    { align: 'justify' }
  );
  doc.moveDown();
  
  doc.fontSize(12).font('Helvetica').text(
    'ADPF 187 - Supremo Tribunal Federal',
    { align: 'left' }
  );
  doc.fontSize(10).text(
    'Ação que garantiu o direito à liberdade de expressão na defesa da legalização das drogas, reconhecendo a legitimidade do debate público sobre o tema e a necessidade de políticas baseadas em evidências científicas.',
    { align: 'justify' }
  );
  doc.moveDown(2);
  
  // Princípios constitucionais
  doc.fontSize(12).font('Helvetica-Bold').text('2. PRINCÍPIOS CONSTITUCIONAIS APLICÁVEIS', { align: 'left' });
  doc.moveDown(0.5);
  
  doc.fontSize(12).font('Helvetica').text(
    '- Dignidade da pessoa humana (art. 1º, III, CF)\n' +
    '- Direito à privacidade (art. 5º, X, CF)\n' +
    '- Direito à saúde (art. 6º e art. 196, CF)\n' +
    '- Princípio da proporcionalidade\n' +
    '- Princípio da autodeterminação',
    { align: 'left' }
  );
  doc.moveDown(2);
  
  // Data e assinatura
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.text(`Data: ${dataAtual}`, { align: 'left' });
  doc.moveDown(2);
  doc.text('_______________________________', { align: 'center' });
  doc.text(`${dados.nome}`, { align: 'center' });
  doc.text(`CPF: ${dados.cpf}`, { align: 'center' });
}

// Exportar templates
exports.documentTemplates = documentTemplates;
