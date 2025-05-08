// Controlador para o módulo jurídico
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const datajudService = require('../services/datajudService');

// Gerador de Habeas Corpus
exports.getHabeasCorpusForm = (req, res) => {
  res.render('juridico/habeas-corpus-form', { 
    title: 'Gerador de Habeas Corpus Preventivo',
    fundamentos: [
      { id: 'resp2121548', nome: 'REsp 2.121.548' },
      { id: 're635659', nome: 'RE 635659' },
      { id: 'adpf187', nome: 'ADPF 187' }
    ]
  });
};

exports.generateHabeasCorpus = async (req, res) => {
  try {
    // Obter dados do formulário
    const habeasCorpusData = {
      nome: req.body.nome,
      cpf: req.body.cpf,
      endereco: req.body.endereco,
      email: req.body.email,
      telefone: req.body.telefone,
      quantidadePlantas: req.body.quantidadePlantas,
      finalidadeUso: req.body.finalidadeUso,
      fundamentosJuridicos: Array.isArray(req.body.fundamentosJuridicos) 
        ? req.body.fundamentosJuridicos 
        : [req.body.fundamentosJuridicos],
      motivacao: req.body.motivacao
    };
    
    // Importar gerador de PDF
    const pdfGenerator = require('../utils/pdfGenerator');
    
    // Gerar PDF
    const pdfResult = await pdfGenerator.generateHabeasCorpusPDF(habeasCorpusData);
    
    // Salvar no banco de dados (se estiver conectado)
    // Implementação futura
    
    // Renderizar página de sucesso
    res.render('juridico/habeas-corpus-success', { 
      title: 'Habeas Corpus Gerado',
      message: 'Seu Habeas Corpus foi gerado com sucesso!',
      pdfPath: pdfResult.publicPath,
      fileName: pdfResult.fileName
    });
  } catch (error) {
    console.error('Erro ao gerar Habeas Corpus:', error);
    res.render('juridico/habeas-corpus-form', { 
      title: 'Gerador de Habeas Corpus Preventivo',
      fundamentos: [
        { id: 'resp2121548', nome: 'REsp 2.121.548' },
        { id: 're635659', nome: 'RE 635659' },
        { id: 'adpf187', nome: 'ADPF 187' }
      ],
      error: 'Ocorreu um erro ao gerar o Habeas Corpus. Por favor, tente novamente.'
    });
  }
};

// Central de Documentos
exports.getDocumentos = (req, res) => {
  // Importar utilitário de templates de documentos
  const documentTemplates = require('../utils/documentTemplates');
  
  // Obter lista de templates disponíveis
  const templates = documentTemplates.getAvailableTemplates();
  
  res.render('juridico/documentos', { 
    title: 'Central de Documentos',
    documentos: templates
  });
};

exports.getDocumentoTemplate = (req, res) => {
  const tipo = req.params.tipo;
  
  // Importar utilitário de templates de documentos
  const documentTemplates = require('../utils/documentTemplates');
  
  // Obter informações do template
  const templateInfo = documentTemplates.getTemplateInfo(tipo);
  
  if (!templateInfo) {
    return res.status(404).render('404', { 
      title: 'Documento não encontrado',
      message: 'O modelo de documento solicitado não foi encontrado.'
    });
  }
  
  res.render('juridico/documento-template', { 
    title: `Modelo de ${templateInfo.nome}`,
    template: templateInfo
  });
};

exports.generateDocumento = async (req, res) => {
  try {
    const tipo = req.params.tipo;
    
    // Importar utilitário de templates de documentos
    const documentTemplates = require('../utils/documentTemplates');
    
    // Verificar se o template existe
    const templateInfo = documentTemplates.getTemplateInfo(tipo);
    if (!templateInfo) {
      return res.status(404).render('404', { 
        title: 'Documento não encontrado',
        message: 'O modelo de documento solicitado não foi encontrado.'
      });
    }
    
    // Gerar PDF do documento
    const pdfResult = await documentTemplates.generateDocumentPDF(tipo, req.body);
    
    // Renderizar página de sucesso
    res.render('juridico/documento-success', { 
      title: 'Documento Gerado',
      message: `Seu ${templateInfo.nome} foi gerado com sucesso!`,
      pdfPath: pdfResult.publicPath,
      fileName: pdfResult.fileName,
      documentoNome: templateInfo.nome
    });
  } catch (error) {
    console.error('Erro ao gerar documento:', error);
    res.status(500).render('juridico/documentos', { 
      title: 'Central de Documentos',
      documentos: require('../utils/documentTemplates').getAvailableTemplates(),
      error: 'Ocorreu um erro ao gerar o documento. Por favor, tente novamente.'
    });
  }
};

exports.uploadDocumento = (req, res) => {
  // O middleware de upload já foi aplicado na rota
  // Verificar se o arquivo foi enviado
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nenhum arquivo foi enviado.' 
    });
  }
  
  // Importar utilitário de upload
  const uploadHandler = require('../utils/uploadHandler');
  
  // Obter informações do arquivo
  const fileInfo = uploadHandler.getFileInfo(req.file);
  
  // Em uma implementação completa, aqui seria feito o armazenamento no banco de dados
  
  // Retornar sucesso com informações do arquivo
  res.json({ 
    success: true, 
    message: 'Documento enviado com sucesso',
    file: fileInfo
  });
};

exports.getQRCode = async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    
    if (!id) {
      return res.status(400).render('juridico/qrcode', { 
        title: 'QR Code',
        error: 'É necessário fornecer um ID de processo ou documento.'
      });
    }
    
    // Importar biblioteca QRCode e módulos necessários
    const QRCode = require('qrcode');
    const fs = require('fs');
    const path = require('path');
    
    // Criar diretório para armazenar os QR Codes se não existir
    const qrDir = path.join(__dirname, '../public/qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    
    // Definir nome do arquivo
    const timestamp = Date.now();
    const filename = `qrcode_${id}_${timestamp}.png`;
    const filePath = path.join(qrDir, filename);
    
    // Gerar QR Code
    const qrData = `PROCESSO: ${id}\nData de geração: ${new Date().toLocaleDateString('pt-BR')}`;
    await QRCode.toFile(filePath, qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      scale: 8
    });
    
    // Renderizar página com QR Code
    res.render('juridico/qrcode', { 
      title: 'QR Code',
      id: id,
      qrCodePath: `/qrcodes/${filename}`
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).render('juridico/qrcode', { 
      title: 'QR Code',
      error: 'Ocorreu um erro ao gerar o QR Code. Por favor, tente novamente.'
    });
  }
};

// Base de Jurisprudência
exports.getJurisprudencia = (req, res) => {
  // Importar utilitário de jurisprudência
  const jurisprudenciaData = require('../utils/jurisprudenciaData');
  
  // Obter estatísticas
  const estatisticas = jurisprudenciaData.getEstatisticas();
  
  res.render('juridico/jurisprudencia', { 
    title: 'Base de Jurisprudência Interativa',
    estados: [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ],
    estatisticas: estatisticas,
    fonteDataJud: true // Indica que a fonte DataJud está disponível
  });
};

exports.filtrarJurisprudencia = async (req, res) => {
  try {
    // Importar utilitário de jurisprudência
    const jurisprudenciaData = require('../utils/jurisprudenciaData');
    
    // Obter filtros da query
    const filtros = {
      estado: req.query.estado || '',
      quantidadePlantas: req.query.quantidadePlantas || '',
      tipoUso: req.query.tipoUso || '',
      resultado: req.query.resultado || ''
    };
    
    // Verificar se a busca deve incluir o DataJud
    const usarDataJud = req.query.fonteDataJud === 'true';
    
    // Filtrar jurisprudências locais
    const resultadosLocais = jurisprudenciaData.filtrarJurisprudencias(filtros);
    
    let resultadosDataJud = [];
    let resultadosCombinados = [...resultadosLocais];
    
    // Se a busca deve incluir o DataJud
    if (usarDataJud) {
      try {
        // Construir termo de busca para o DataJud
        let termoBusca = 'cannabis';
        
        // Adicionar termos específicos baseados nos filtros
        if (filtros.tipoUso) {
          termoBusca += ` ${filtros.tipoUso}`;
        }
        
        if (filtros.quantidadePlantas) {
          // Extrair números do filtro de quantidade de plantas
          const qtdMatch = filtros.quantidadePlantas.match(/\d+/g);
          if (qtdMatch && qtdMatch.length > 0) {
            termoBusca += ` ${qtdMatch.join(' ')} plantas`;
          }
        }
        
        // Parâmetros para a busca no DataJud
        const datajudParams = {
          termoBusca: termoBusca,
          pagina: 1,
          tamanhoPagina: 10
        };
        
        // Adicionar filtro de tribunal se estado estiver definido
        if (filtros.estado) {
          datajudParams.tribunal = `TJ${filtros.estado}`;
        }
        
        // Buscar no DataJud
        const datajudResultados = await datajudService.buscarJurisprudencias(datajudParams);
        
        if (datajudResultados && datajudResultados.resultados) {
          // Converter resultados do DataJud para o formato do aplicativo
          resultadosDataJud = datajudResultados.resultados.map((item, index) => {
            // Tentar extrair informações relevantes do texto da ementa
            const quantidadePlantasMatch = item.ementa.match(/(\d+)\s*plantas?/i);
            const tipoUsoMatch = item.ementa.match(/(medicinal|terapêutico|uso pessoal|religioso)/i);
            const resultadoMatch = item.ementa.match(/(concedido|deferido|negado|indeferido|parcial)/i);
            
            let resultado = 'não informado';
            if (resultadoMatch) {
              const matchLower = resultadoMatch[1].toLowerCase();
              if (matchLower.includes('concedido') || matchLower.includes('deferido')) {
                resultado = 'deferido';
              } else if (matchLower.includes('negado') || matchLower.includes('indeferido')) {
                resultado = 'indeferido';
              } else if (matchLower.includes('parcial')) {
                resultado = 'parcial';
              }
            }
            
            // Extrair estado do tribunal
            const estadoMatch = item.tribunal ? item.tribunal.match(/TJ([A-Z]{2})/) : null;
            
            return {
              id: `datajud-${index}`,
              numeroProcesso: item.numeroProcesso || 'Não informado',
              tribunal: item.tribunal || 'Não informado',
              estado: estadoMatch ? estadoMatch[1] : 'Não informado',
              desembargador: item.relator || 'Não informado',
              dataDecisao: item.dataJulgamento || new Date().toISOString().split('T')[0],
              ementa: item.ementa || 'Não informado',
              decisao: item.ementa || 'Não informado', // Usar ementa como decisão se não houver texto específico
              quantidadePlantas: quantidadePlantasMatch ? parseInt(quantidadePlantasMatch[1]) : 0,
              tipoUso: tipoUsoMatch ? tipoUsoMatch[1].toLowerCase() : 'não informado',
              resultado: resultado,
              fonte: 'DataJud',
              urlInteiroTeor: item.urlInteiroTeor || '#'
            };
          });
          
          // Filtrar resultados do DataJud de acordo com os filtros específicos
          // que não puderam ser aplicados diretamente na API
          if (filtros.resultado && filtros.resultado !== '') {
            resultadosDataJud = resultadosDataJud.filter(item => item.resultado === filtros.resultado);
          }
          
          // Combinar resultados
          resultadosCombinados = [...resultadosLocais, ...resultadosDataJud];
        }
      } catch (datajudError) {
        console.error('Erro ao buscar no DataJud:', datajudError);
        // Continuar com apenas os resultados locais em caso de erro
      }
    }
    
    // Retornar resultados combinados
    res.json({ 
      success: true, 
      results: resultadosCombinados,
      count: resultadosCombinados.length,
      fontes: {
        local: resultadosLocais.length,
        datajud: resultadosDataJud.length
      }
    });
  } catch (error) {
    console.error('Erro ao filtrar jurisprudência:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ocorreu um erro ao filtrar a jurisprudência.' 
    });
  }
};

exports.getJurisprudenciaDetalhes = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Verificar se é um ID do DataJud
    if (id.startsWith('datajud-')) {
      // Obter o número do processo da sessão ou de um parâmetro adicional
      const numeroProcesso = req.query.processo;
      
      if (!numeroProcesso) {
        return res.status(404).render('404', { 
          title: 'Jurisprudência não encontrada',
          message: 'Informações insuficientes para localizar a jurisprudência no DataJud.'
        });
      }
      
      try {
        // Buscar detalhes do processo no DataJud
        const detalhesProcesso = await datajudService.buscarProcesso(numeroProcesso);
        
        if (!detalhesProcesso) {
          return res.status(404).render('404', { 
            title: 'Jurisprudência não encontrada',
            message: 'Não foi possível obter os detalhes do processo no DataJud.'
          });
        }
        
        // Renderizar página de detalhes com dados do DataJud
        res.render('juridico/jurisprudencia-detalhes', { 
          title: 'Detalhes da Jurisprudência',
          jurisprudencia: {
            id: id,
            numeroProcesso: detalhesProcesso.numeroProcesso || numeroProcesso,
            tribunal: detalhesProcesso.tribunal || 'Não informado',
            estado: detalhesProcesso.tribunal ? detalhesProcesso.tribunal.replace('TJ', '') : 'Não informado',
            desembargador: detalhesProcesso.relator || 'Não informado',
            dataDecisao: detalhesProcesso.dataJulgamento || 'Não informado',
            ementa: detalhesProcesso.ementa || 'Não informado',
            decisao: detalhesProcesso.decisao || detalhesProcesso.ementa || 'Não informado',
            fonte: 'DataJud',
            urlInteiroTeor: detalhesProcesso.urlInteiroTeor || '#'
          }
        });
      } catch (datajudError) {
        console.error('Erro ao buscar detalhes no DataJud:', datajudError);
        return res.status(500).render('juridico/jurisprudencia', { 
          title: 'Base de Jurisprudência Interativa',
          estados: [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
            'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
            'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
          ],
          error: 'Ocorreu um erro ao obter os detalhes da jurisprudência no DataJud.'
        });
      }
    } else {
      // Importar utilitário de jurisprudência para dados locais
      const jurisprudenciaData = require('../utils/jurisprudenciaData');
      
      // Obter jurisprudência específica dos dados locais
      const jurisprudencia = jurisprudenciaData.getJurisprudenciaById(id);
      
      if (!jurisprudencia) {
        return res.status(404).render('404', { 
          title: 'Jurisprudência não encontrada',
          message: 'A jurisprudência solicitada não foi encontrada.'
        });
      }
      
      // Adicionar fonte aos dados
      jurisprudencia.fonte = 'Local';
      
      res.render('juridico/jurisprudencia-detalhes', { 
        title: 'Detalhes da Jurisprudência',
        jurisprudencia: jurisprudencia
      });
    }
  } catch (error) {
    console.error('Erro ao obter detalhes da jurisprudência:', error);
    res.status(500).render('juridico/jurisprudencia', { 
      title: 'Base de Jurisprudência Interativa',
      estados: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ],
      error: 'Ocorreu um erro ao obter os detalhes da jurisprudência.'
    });
  }
};

// Nova rota para busca direta no DataJud
exports.buscarDataJud = async (req, res) => {
  try {
    const termoBusca = req.query.termo || 'cannabis';
    const tribunal = req.query.tribunal || '';
    const pagina = parseInt(req.query.pagina) || 1;
    
    // Parâmetros para a busca no DataJud
    const datajudParams = {
      termoBusca: termoBusca,
      pagina: pagina,
      tamanhoPagina: 10
    };
    
    // Adicionar filtro de tribunal se estiver definido
    if (tribunal) {
      datajudParams.tribunal = tribunal;
    }
    
    // Buscar no DataJud
    const datajudResultados = await datajudService.buscarJurisprudencias(datajudParams);
    
    // Retornar resultados
    res.json({
      success: true,
      results: datajudResultados.resultados,
      totalResultados: datajudResultados.totalResultados,
      totalPaginas: datajudResultados.totalPaginas,
      paginaAtual: pagina
    });
  } catch (error) {
    console.error('Erro ao buscar no DataJud:', error);
    res.status(500).json({
      success: false,
      message: 'Ocorreu um erro ao buscar jurisprudências no DataJud.'
    });
  }
};
