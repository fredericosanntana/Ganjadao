// Utilitário para gerenciar a base de jurisprudência
const fs = require('fs');
const path = require('path');

// Dados de exemplo para a base de jurisprudência
const jurisprudenciaData = [
  {
    id: 'hc-001',
    numeroProcesso: '0123456-78.2023.8.26.0000',
    tribunal: 'TJSP',
    estado: 'SP',
    desembargador: 'Maria Silva',
    dataDecisao: '2023-05-15',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis para uso medicinal. Paciente portador de doença que causa dores crônicas. Quantidade compatível com uso pessoal. Ausência de indícios de tráfico. Direito à saúde. Ordem concedida.',
    decisao: 'Concedida a ordem para determinar que as autoridades coatoras se abstenham de prender o paciente em razão do cultivo doméstico de Cannabis para uso medicinal, desde que respeitadas as condições estabelecidas.',
    quantidadePlantas: 6,
    tipoUso: 'medicinal',
    resultado: 'deferido'
  },
  {
    id: 'hc-002',
    numeroProcesso: '0234567-89.2023.8.19.0000',
    tribunal: 'TJRJ',
    estado: 'RJ',
    desembargador: 'João Oliveira',
    dataDecisao: '2023-06-22',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis para uso pessoal. Quantidade reduzida de plantas. Ausência de finalidade comercial. Princípio da insignificância. Ordem concedida.',
    decisao: 'Concedida a ordem para determinar que as autoridades coatoras se abstenham de prender o paciente em razão do cultivo doméstico de Cannabis para uso pessoal, limitado a 3 plantas.',
    quantidadePlantas: 3,
    tipoUso: 'uso pessoal',
    resultado: 'deferido'
  },
  {
    id: 'hc-003',
    numeroProcesso: '0345678-90.2023.8.05.0000',
    tribunal: 'TJBA',
    estado: 'BA',
    desembargador: 'Carlos Santos',
    dataDecisao: '2023-07-10',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis. Quantidade elevada de plantas. Indícios de destinação comercial. Ausência de comprovação de uso medicinal. Ordem denegada.',
    decisao: 'Denegada a ordem por não estarem presentes os requisitos legais para a concessão do salvo-conduto.',
    quantidadePlantas: 15,
    tipoUso: 'uso pessoal',
    resultado: 'indeferido'
  },
  {
    id: 'hc-004',
    numeroProcesso: '0456789-01.2023.8.12.0000',
    tribunal: 'TJMS',
    estado: 'MS',
    desembargador: 'Ana Pereira',
    dataDecisao: '2023-08-05',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis para uso terapêutico. Paciente com prescrição médica. Quantidade compatível com a necessidade terapêutica. Direito à saúde. Ordem parcialmente concedida.',
    decisao: 'Concedida parcialmente a ordem para determinar que as autoridades coatoras se abstenham de prender o paciente em razão do cultivo doméstico de Cannabis para uso terapêutico, limitado a 4 plantas, mediante apresentação de prescrição médica.',
    quantidadePlantas: 4,
    tipoUso: 'terapêutico',
    resultado: 'parcial'
  },
  {
    id: 'hc-005',
    numeroProcesso: '0567890-12.2023.8.21.0000',
    tribunal: 'TJRS',
    estado: 'RS',
    desembargador: 'Paulo Ferreira',
    dataDecisao: '2023-09-18',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis para uso medicinal. Paciente com doença neurodegenerativa. Prescrição médica. Direito à saúde. Ordem concedida.',
    decisao: 'Concedida a ordem para determinar que as autoridades coatoras se abstenham de prender o paciente em razão do cultivo doméstico de Cannabis para uso medicinal, desde que respeitadas as condições estabelecidas na prescrição médica.',
    quantidadePlantas: 8,
    tipoUso: 'medicinal',
    resultado: 'deferido'
  },
  {
    id: 'hc-006',
    numeroProcesso: '0678901-23.2023.8.06.0000',
    tribunal: 'TJCE',
    estado: 'CE',
    desembargador: 'Luiza Costa',
    dataDecisao: '2023-10-07',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis. Ausência de comprovação de finalidade medicinal ou terapêutica. Quantidade incompatível com uso pessoal. Ordem denegada.',
    decisao: 'Denegada a ordem por não estarem presentes os requisitos legais para a concessão do salvo-conduto.',
    quantidadePlantas: 12,
    tipoUso: 'uso pessoal',
    resultado: 'indeferido'
  },
  {
    id: 'hc-007',
    numeroProcesso: '0789012-34.2023.8.11.0000',
    tribunal: 'TJMT',
    estado: 'MT',
    desembargador: 'Roberto Lima',
    dataDecisao: '2023-11-15',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis para uso religioso. Liberdade religiosa. Quantidade reduzida. Ausência de finalidade comercial. Ordem concedida.',
    decisao: 'Concedida a ordem para determinar que as autoridades coatoras se abstenham de prender o paciente em razão do cultivo doméstico de Cannabis para uso religioso, limitado a 5 plantas.',
    quantidadePlantas: 5,
    tipoUso: 'religioso',
    resultado: 'deferido'
  },
  {
    id: 'hc-008',
    numeroProcesso: '0890123-45.2023.8.17.0000',
    tribunal: 'TJPE',
    estado: 'PE',
    desembargador: 'Fernanda Almeida',
    dataDecisao: '2023-12-03',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis para uso terapêutico. Paciente com transtorno de ansiedade. Prescrição médica. Quantidade compatível. Ordem concedida.',
    decisao: 'Concedida a ordem para determinar que as autoridades coatoras se abstenham de prender o paciente em razão do cultivo doméstico de Cannabis para uso terapêutico, limitado a 3 plantas.',
    quantidadePlantas: 3,
    tipoUso: 'terapêutico',
    resultado: 'deferido'
  },
  {
    id: 'hc-009',
    numeroProcesso: '0901234-56.2024.8.24.0000',
    tribunal: 'TJSC',
    estado: 'SC',
    desembargador: 'Ricardo Souza',
    dataDecisao: '2024-01-20',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis para uso medicinal. Paciente com epilepsia refratária. Prescrição médica. Direito à saúde. Ordem concedida.',
    decisao: 'Concedida a ordem para determinar que as autoridades coatoras se abstenham de prender o paciente em razão do cultivo doméstico de Cannabis para uso medicinal, desde que respeitadas as condições estabelecidas na prescrição médica.',
    quantidadePlantas: 6,
    tipoUso: 'medicinal',
    resultado: 'deferido'
  },
  {
    id: 'hc-010',
    numeroProcesso: '0012345-67.2024.8.13.0000',
    tribunal: 'TJMG',
    estado: 'MG',
    desembargador: 'Marcelo Rocha',
    dataDecisao: '2024-02-08',
    ementa: 'Habeas Corpus Preventivo. Cultivo doméstico de Cannabis. Quantidade elevada. Indícios de tráfico. Ausência de comprovação de uso medicinal. Ordem denegada.',
    decisao: 'Denegada a ordem por não estarem presentes os requisitos legais para a concessão do salvo-conduto.',
    quantidadePlantas: 20,
    tipoUso: 'uso pessoal',
    resultado: 'indeferido'
  }
];

// Função para obter todas as jurisprudências
exports.getAllJurisprudencias = () => {
  return jurisprudenciaData;
};

// Função para obter uma jurisprudência específica por ID
exports.getJurisprudenciaById = (id) => {
  return jurisprudenciaData.find(item => item.id === id);
};

// Função para filtrar jurisprudências
exports.filtrarJurisprudencias = (filtros) => {
  let resultados = [...jurisprudenciaData];
  
  // Filtrar por estado
  if (filtros.estado && filtros.estado !== '') {
    resultados = resultados.filter(item => item.estado === filtros.estado);
  }
  
  // Filtrar por quantidade de plantas
  if (filtros.quantidadePlantas && filtros.quantidadePlantas !== '') {
    switch (filtros.quantidadePlantas) {
      case '1-3':
        resultados = resultados.filter(item => item.quantidadePlantas >= 1 && item.quantidadePlantas <= 3);
        break;
      case '4-6':
        resultados = resultados.filter(item => item.quantidadePlantas >= 4 && item.quantidadePlantas <= 6);
        break;
      case '7-10':
        resultados = resultados.filter(item => item.quantidadePlantas >= 7 && item.quantidadePlantas <= 10);
        break;
      case '10+':
        resultados = resultados.filter(item => item.quantidadePlantas > 10);
        break;
    }
  }
  
  // Filtrar por tipo de uso
  if (filtros.tipoUso && filtros.tipoUso !== '') {
    resultados = resultados.filter(item => item.tipoUso === filtros.tipoUso);
  }
  
  // Filtrar por resultado
  if (filtros.resultado && filtros.resultado !== '') {
    resultados = resultados.filter(item => item.resultado === filtros.resultado);
  }
  
  return resultados;
};

// Função para obter estatísticas da jurisprudência
exports.getEstatisticas = () => {
  const total = jurisprudenciaData.length;
  const deferidos = jurisprudenciaData.filter(item => item.resultado === 'deferido').length;
  const indeferidos = jurisprudenciaData.filter(item => item.resultado === 'indeferido').length;
  const parciais = jurisprudenciaData.filter(item => item.resultado === 'parcial').length;
  
  const porEstado = {};
  jurisprudenciaData.forEach(item => {
    if (!porEstado[item.estado]) {
      porEstado[item.estado] = {
        total: 0,
        deferidos: 0,
        indeferidos: 0,
        parciais: 0
      };
    }
    
    porEstado[item.estado].total++;
    if (item.resultado === 'deferido') {
      porEstado[item.estado].deferidos++;
    } else if (item.resultado === 'indeferido') {
      porEstado[item.estado].indeferidos++;
    } else if (item.resultado === 'parcial') {
      porEstado[item.estado].parciais++;
    }
  });
  
  const porTipoUso = {};
  jurisprudenciaData.forEach(item => {
    if (!porTipoUso[item.tipoUso]) {
      porTipoUso[item.tipoUso] = {
        total: 0,
        deferidos: 0,
        indeferidos: 0,
        parciais: 0
      };
    }
    
    porTipoUso[item.tipoUso].total++;
    if (item.resultado === 'deferido') {
      porTipoUso[item.tipoUso].deferidos++;
    } else if (item.resultado === 'indeferido') {
      porTipoUso[item.tipoUso].indeferidos++;
    } else if (item.resultado === 'parcial') {
      porTipoUso[item.tipoUso].parciais++;
    }
  });
  
  return {
    total,
    deferidos,
    indeferidos,
    parciais,
    taxaSucesso: ((deferidos + parciais) / total * 100).toFixed(2),
    porEstado,
    porTipoUso
  };
};

// Exportar dados de exemplo
exports.jurisprudenciaData = jurisprudenciaData;
