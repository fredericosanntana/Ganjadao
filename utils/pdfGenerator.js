// Implementação da geração de PDF do Habeas Corpus
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Função para gerar o PDF do Habeas Corpus
exports.generateHabeasCorpusPDF = async (habeasCorpusData) => {
  return new Promise((resolve, reject) => {
    try {
      // Criar diretório para armazenar os PDFs se não existir
      const pdfDir = path.join(__dirname, '../public/docs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Definir nome do arquivo
      const timestamp = Date.now();
      const filename = `habeas_corpus_${timestamp}.pdf`;
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
      doc.fontSize(16).font('Helvetica-Bold').text('HABEAS CORPUS PREVENTIVO', { align: 'center' });
      doc.moveDown();
      
      // Adicionar informações do tribunal
      doc.fontSize(12).font('Helvetica-Bold').text('EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA CRIMINAL DA COMARCA DE [COMARCA]', { align: 'justify' });
      doc.moveDown(2);
      
      // Dados do paciente
      doc.fontSize(12).font('Helvetica').text(`PACIENTE: ${habeasCorpusData.nome}`, { align: 'justify' });
      doc.text(`CPF: ${habeasCorpusData.cpf}`, { align: 'justify' });
      doc.text(`ENDEREÇO: ${habeasCorpusData.endereco}`, { align: 'justify' });
      doc.moveDown(2);
      
      // Introdução
      doc.fontSize(12).font('Helvetica-Bold').text('I - DOS FATOS', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(
        `O(A) paciente é cultivador(a) de Cannabis para ${habeasCorpusData.finalidadeUso}, ` +
        `mantendo ${habeasCorpusData.quantidadePlantas} planta(s) em sua residência para uso estritamente pessoal, ` +
        `sem qualquer finalidade comercial ou de tráfico.`, 
        { align: 'justify' }
      );
      doc.moveDown();
      doc.text(
        `MOTIVAÇÃO: ${habeasCorpusData.motivacao}`,
        { align: 'justify' }
      );
      doc.moveDown(2);
      
      // Fundamentos jurídicos
      doc.fontSize(12).font('Helvetica-Bold').text('II - DO DIREITO', { align: 'left' });
      doc.moveDown();
      
      // Mapear IDs para textos completos
      const fundamentosTexto = {
        'resp2121548': 'Conforme decidido pelo Superior Tribunal de Justiça no REsp 2.121.548, o cultivo de cannabis para fins medicinais é permitido em casos específicos, sendo reconhecido como exercício do direito à saúde.',
        're635659': 'O Recurso Extraordinário 635.659 discute a inconstitucionalidade do art. 28 da Lei de Drogas, questionando a criminalização do porte de drogas para consumo pessoal, com base no direito à privacidade e autonomia individual.',
        'adpf187': 'A ADPF 187 garantiu o direito à liberdade de expressão na defesa da legalização das drogas, reconhecendo a legitimidade do debate público sobre o tema e a necessidade de políticas baseadas em evidências científicas.'
      };
      
      // Adicionar texto para cada fundamento selecionado
      habeasCorpusData.fundamentosJuridicos.forEach(fundamento => {
        if (fundamentosTexto[fundamento]) {
          doc.fontSize(12).font('Helvetica').text(fundamentosTexto[fundamento], { align: 'justify' });
          doc.moveDown();
        }
      });
      
      // Texto padrão sobre direito constitucional
      doc.text(
        'O cultivo para uso pessoal está amparado pelos princípios constitucionais da privacidade (art. 5º, X, CF), ' +
        'da dignidade da pessoa humana (art. 1º, III, CF) e da autodeterminação. ' +
        'Ademais, a criminalização do autocultivo para uso pessoal representa medida desproporcional, ' +
        'violando o princípio da proporcionalidade que deve nortear o Direito Penal.',
        { align: 'justify' }
      );
      doc.moveDown(2);
      
      // Pedido
      doc.fontSize(12).font('Helvetica-Bold').text('III - DO PEDIDO', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(
        'Diante do exposto, requer-se a concessão de HABEAS CORPUS PREVENTIVO, ' +
        'com expedição de salvo-conduto em favor do(a) paciente, para que não seja preso(a) ' +
        'em flagrante pelo cultivo de Cannabis para uso pessoal, nas condições acima descritas.',
        { align: 'justify' }
      );
      doc.moveDown(2);
      
      // Data e assinatura
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      doc.text(`[CIDADE], ${dataAtual}`, { align: 'center' });
      doc.moveDown(2);
      doc.text('_______________________________', { align: 'center' });
      doc.text(`${habeasCorpusData.nome}`, { align: 'center' });
      
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
