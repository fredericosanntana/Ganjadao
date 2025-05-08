console.log(JSON.stringify(buscarJurisprudenciasComQuery, null, 2))
const axios = require('axios');

const API_CONFIG = {
  BASE_URL: 'https://api-publica.datajud.cnj.jus.br/api_publica_tjrj/_search',
  PUBLIC_KEY: 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='
};

// Buscar jurisprudências com query e endpoint
async function buscarJurisprudenciasComQuery(query) {
  try {
    const body = { query }; // Correto: query já deve vir como { bool: { must: [...] } };

    const hits = response.data.hits.hits || [];

    return {
      success: true,
      resultados: hits.map(hit => hit._source),
      totalResultados: response.data.hits.total.value,
      timing: response.data.took
    };
  } catch (error) {
    console.error('❌ Erro na consulta à API do DataJud:', error.response?.data || error.message);
    return {
      success: false,
      erro: error.message
    };
  }
}

// Verifica se a API responde
async function verificarConexao() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `APIKey ${API_CONFIG.PUBLIC_KEY}`
  };

  const corpoTeste = {
    size: 1,
    query: { match_all: {} }
  };

  try {
    const inicio = Date.now();
    const resposta = await axios.post(API_CONFIG.BASE_URL, corpoTeste, { headers });
    const fim = Date.now();

    return {
      conectado: true,
      timing: fim - inicio,
      usandoFallback: false
    };
  } catch (error) {
    console.error('❌ Erro ao verificar conexão com a API:', error.message);
    return {
      conectado: false,
      apiInfo: {
        status: null,
        statusText: error.message
      },
      usandoFallback: true,
      mensagem: 'Erro de conexão. Sistema operando com dados simulados.'
    };
  }
}

module.exports = {
  buscarJurisprudenciasComQuery,
  verificarConexao
};