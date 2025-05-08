const axios = require('axios');
const API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const BASE_URL = 'https://api-publica.datajud.cnj.jus.br';

/**
 * Busca jurisprudências na API do DataJud
 * @param {Object} params - Parâmetros de busca
 * @param {string} params.termoBusca - Termo para busca
 * @param {number} params.pagina - Número da página (começa em 1)
 * @param {number} params.tamanhoPagina - Quantidade de resultados por página
 * @param {string} params.tribunal - Filtro por tribunal (opcional)
 * @param {string} params.relator - Filtro por relator (opcional)
 * @param {string} params.dataInicial - Data inicial no formato YYYY-MM-DD (opcional)
 * @param {string} params.dataFinal - Data final no formato YYYY-MM-DD (opcional)
 * @returns {Promise<Array>} - Lista de jurisprudências encontradas
 */
async function buscarJurisprudencias(params = {}) {
  try {
    // Validação e sanitização dos parâmetros
    const defaultParams = {
      termoBusca: 'cannabis',
      pagina: 1,
      tamanhoPagina: 10
    };

    // Garantir que termoBusca nunca seja vazio
    if (!params.termoBusca || params.termoBusca.trim() === '') {
      params.termoBusca = defaultParams.termoBusca;
    }

    // Garantir que pagina e tamanhoPagina sejam números válidos
    params.pagina = parseInt(params.pagina) || defaultParams.pagina;
    params.tamanhoPagina = parseInt(params.tamanhoPagina) || defaultParams.tamanhoPagina;

    // Limitar tamanhoPagina para evitar sobrecarga
    if (params.tamanhoPagina > 50) {
      params.tamanhoPagina = 50;
    }

    // Remover parâmetros vazios ou undefined
    const queryParams = {};
    for (const [key, value] of Object.entries({ ...defaultParams, ...params })) {
      if (value !== undefined && value !== null && value !== '') {
        queryParams[key] = value;
      }
    }

    console.log('Parâmetros de busca para DataJud:', JSON.stringify(queryParams));

    // Tentar diferentes formatos de autorização se necessário
    let headers = { Authorization: `APIKey ${API_KEY}` };
    
    const response = await axios.get(`${BASE_URL}/jurisprudencias`, {
      headers: headers,
      params: queryParams,
      timeout: 10000 // Timeout de 10 segundos
    });

    if (response.data && response.data.resultados) {
      console.log(`DataJud: Encontrados ${response.data.resultados.length} resultados`);
      return {
        resultados: response.data.resultados.map(item => ({
          tribunal: item.tribunal,
          orgaoJulgador: item.orgaoJulgador,
          numeroProcesso: item.numeroProcesso,
          relator: item.relator,
          dataJulgamento: item.dataJulgamento,
          ementa: item.ementa,
          palavrasChave: item.palavrasChave || [],
          urlInteiroTeor: item.urlInteiroTeor || '#',
          assunto: item.assunto || '',
          tipoDecisao: item.tipoDecisao || ''
        })),
        totalResultados: response.data.totalResultados || 0,
        totalPaginas: response.data.totalPaginas || 1
      };
    }

    console.log('DataJud: Resposta sem resultados:', response.data);
    return { resultados: [], totalResultados: 0, totalPaginas: 0 };
  } catch (error) {
    // Tratamento de erro detalhado
    let mensagemErro = error.message;
    let detalhesErro = {};

    if (error.response) {
      // O servidor respondeu com um status de erro
      detalhesErro = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
      
      if (error.response.status === 400) {
        mensagemErro = 'Requisição inválida. Verifique os parâmetros de busca.';
        
        // Tentar extrair mais informações do erro
        if (error.response.data && typeof error.response.data === 'object') {
          if (error.response.data.message) {
            mensagemErro += ` Mensagem: ${error.response.data.message}`;
          }
          if (error.response.data.error) {
            mensagemErro += ` Erro: ${error.response.data.error}`;
          }
        }
      } else if (error.response.status === 401 || error.response.status === 403) {
        mensagemErro = 'Erro de autenticação. A chave de API pode estar inválida ou expirada.';
      } else if (error.response.status === 404) {
        mensagemErro = 'Endpoint não encontrado. A URL da API pode ter mudado.';
      } else if (error.response.status >= 500) {
        mensagemErro = 'Erro no servidor do DataJud. Tente novamente mais tarde.';
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      mensagemErro = 'Sem resposta do servidor DataJud. Verifique sua conexão com a internet.';
      detalhesErro = { request: 'Requisição enviada, sem resposta' };
    }

    console.error('Erro ao buscar jurisprudências no DataJud:', mensagemErro);
    console.error('Detalhes do erro:', JSON.stringify(detalhesErro));
    
    // Implementar fallback para busca alternativa
    try {
      console.log('Tentando busca alternativa com parâmetros simplificados...');
      const fallbackParams = {
        termoBusca: 'cannabis',
        pagina: 1,
        tamanhoPagina: 5
      };
      
      const fallbackResponse = await axios.get(`${BASE_URL}/jurisprudencias`, {
        headers: headers,
        params: fallbackParams,
        timeout: 10000
      });
      
      if (fallbackResponse.data && fallbackResponse.data.resultados) {
        console.log(`DataJud (fallback): Encontrados ${fallbackResponse.data.resultados.length} resultados`);
        return {
          resultados: fallbackResponse.data.resultados.map(item => ({
            tribunal: item.tribunal,
            orgaoJulgador: item.orgaoJulgador,
            numeroProcesso: item.numeroProcesso,
            relator: item.relator,
            dataJulgamento: item.dataJulgamento,
            ementa: item.ementa,
            palavrasChave: item.palavrasChave || [],
            urlInteiroTeor: item.urlInteiroTeor || '#',
            assunto: item.assunto || '',
            tipoDecisao: item.tipoDecisao || ''
          })),
          totalResultados: fallbackResponse.data.totalResultados || 0,
          totalPaginas: fallbackResponse.data.totalPaginas || 1,
          usouFallback: true
        };
      }
    } catch (fallbackError) {
      console.error('Falha na busca alternativa:', fallbackError.message);
    }
    
    return { 
      resultados: [], 
      totalResultados: 0, 
      totalPaginas: 0, 
      erro: mensagemErro,
      detalhesErro: detalhesErro
    };
  }
}

/**
 * Busca detalhes de um processo específico
 * @param {string} numeroProcesso - Número do processo
 * @returns {Promise<Object>} - Detalhes do processo
 */
async function buscarProcesso(numeroProcesso) {
  try {
    if (!numeroProcesso || numeroProcesso.trim() === '') {
      throw new Error('Número de processo não fornecido');
    }
    
    // Sanitizar o número do processo (remover caracteres especiais)
    const numeroProcessoSanitizado = numeroProcesso.replace(/[^\d.-]/g, '');
    
    console.log(`Buscando detalhes do processo: ${numeroProcessoSanitizado}`);
    
    const response = await axios.get(`${BASE_URL}/processo/${numeroProcessoSanitizado}`, {
      headers: { Authorization: `APIKey ${API_KEY}` },
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    let mensagemErro = `Erro ao buscar processo ${numeroProcesso}: ${error.message}`;
    let detalhesErro = {};
    
    if (error.response) {
      detalhesErro = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
      
      if (error.response.status === 404) {
        mensagemErro = `Processo ${numeroProcesso} não encontrado na base do DataJud.`;
      }
    }
    
    console.error(mensagemErro);
    console.error('Detalhes do erro:', JSON.stringify(detalhesErro));
    return null;
  }
}

/**
 * Verifica se a API do DataJud está acessível e a chave de API é válida
 * @returns {Promise<boolean>} - true se a API estiver acessível e a chave for válida
 */
async function verificarConexao() {
  try {
    // Fazer uma requisição simples para verificar a conexão
    const response = await axios.get(`${BASE_URL}/jurisprudencias`, {
      headers: { Authorization: `APIKey ${API_KEY}` },
      params: {
        termoBusca: 'teste',
        pagina: 1,
        tamanhoPagina: 1
      },
      timeout: 5000
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao verificar conexão com DataJud:', error.message);
    return false;
  }
}

module.exports = {
  buscarJurisprudencias,
  buscarProcesso,
  verificarConexao
};
