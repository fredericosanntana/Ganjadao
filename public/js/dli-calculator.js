/**
 * DLI Calculator - Daily Light Integral
 * 
 * Este script implementa a calculadora DLI para cultivadores de cannabis,
 * permitindo determinar a quantidade total de luz fotossinteticamente ativa (PAR)
 * recebida pelas plantas durante um período de 24 horas.
 */

// Constantes para faixas ideais de DLI por estágio (em mol/m²/dia)
const DLI_RANGES = {
  mudas: { min: 12, optimal: 16, max: 20 },
  vegetativo: { min: 20, optimal: 30, max: 40 },
  floracao: { min: 30, optimal: 40, max: 50 }
};

// Fatores de conversão para diferentes tipos de luz
const LIGHT_CONVERSION_FACTORS = {
  // Fatores para converter lux para μmol/m²/s
  hps: 0.0155,      // HPS (High Pressure Sodium)
  led: 0.0143,      // LED branco/full spectrum
  cmh: 0.0159,      // CMH/LEC (Ceramic Metal Halide)
  fluorescente: 0.0135, // Fluorescente T5/T8
  sol: 0.0185       // Luz solar
};

// Eficiência energética aproximada (μmol/J)
const ENERGY_EFFICIENCY = {
  hps: 1.5,         // HPS (High Pressure Sodium)
  led: 2.5,         // LED moderno
  cmh: 1.8,         // CMH/LEC (Ceramic Metal Halide)
  fluorescente: 1.2, // Fluorescente T5/T8
  sol: 0            // Luz solar (não aplicável)
};

/**
 * Converte lux para PPFD (μmol/m²/s) com base no tipo de luz
 * @param {number} lux - Intensidade da luz em lux
 * @param {string} lightType - Tipo de luz (hps, led, cmh, fluorescente, sol)
 * @returns {number} PPFD em μmol/m²/s
 */
function luxToPPFD(lux, lightType) {
  return lux * LIGHT_CONVERSION_FACTORS[lightType];
}

/**
 * Ajusta o PPFD com base na distância da fonte de luz (lei do quadrado inverso)
 * @param {number} ppfd - PPFD na distância de referência (μmol/m²/s)
 * @param {number} referenceDistance - Distância de referência em cm (geralmente 30-60cm)
 * @param {number} actualDistance - Distância atual em cm
 * @returns {number} PPFD ajustado em μmol/m²/s
 */
function adjustPPFDForDistance(ppfd, referenceDistance, actualDistance) {
  // Lei do quadrado inverso: intensidade ∝ 1/distância²
  return ppfd * Math.pow(referenceDistance / actualDistance, 2);
}

/**
 * Calcula o DLI (Daily Light Integral)
 * @param {number} ppfd - Intensidade da luz em μmol/m²/s
 * @param {number} hoursOfLight - Horas de luz por dia
 * @returns {number} DLI em mol/m²/dia
 */
function calculateDLI(ppfd, hoursOfLight) {
  const secondsOfLight = hoursOfLight * 3600;
  return (ppfd * secondsOfLight) / 1000000; // Converter para mol/m²/dia
}

/**
 * Estima o consumo de energia para luzes artificiais
 * @param {number} ppfd - Intensidade da luz em μmol/m²/s
 * @param {number} area - Área de cultivo em m²
 * @param {string} lightType - Tipo de luz (hps, led, cmh, fluorescente)
 * @param {number} hoursOfLight - Horas de luz por dia
 * @returns {number} Consumo estimado em kWh por dia
 */
function estimateEnergyConsumption(ppfd, area, lightType, hoursOfLight) {
  if (lightType === 'sol') return 0; // Luz solar não consome energia
  
  // Cálculo: PPFD (μmol/m²/s) * área (m²) / eficiência (μmol/J) = Watts
  const watts = (ppfd * area) / ENERGY_EFFICIENCY[lightType];
  
  // Converter para kWh por dia
  return (watts * hoursOfLight) / 1000;
}

/**
 * Determina a zona de DLI com base no valor e estágio de crescimento
 * @param {number} dli - Valor DLI em mol/m²/dia
 * @param {string} stage - Estágio de crescimento
 * @returns {string} Zona de DLI (tooLow, low, optimal, high, tooHigh)
 */
function getDLIZone(dli, stage) {
  const range = DLI_RANGES[stage];
  
  if (dli < range.min * 0.7) return 'tooLow';
  if (dli < range.min) return 'low';
  if (dli <= range.max) return 'optimal';
  if (dli <= range.max * 1.3) return 'high';
  return 'tooHigh';
}

/**
 * Gera recomendações baseadas no DLI atual e estágio de crescimento
 * @param {number} dli - Valor DLI em mol/m²/dia
 * @param {string} zone - Zona de DLI
 * @param {number} ppfd - PPFD atual em μmol/m²/s
 * @param {number} hoursOfLight - Horas de luz por dia
 * @param {string} stage - Estágio de crescimento
 * @param {string} lightType - Tipo de luz
 * @returns {object} Objeto com recomendações
 */
function generateRecommendations(dli, zone, ppfd, hoursOfLight, stage, lightType) {
  const range = DLI_RANGES[stage];
  const recommendations = {
    status: '',
    actions: []
  };
  
  switch (zone) {
    case 'tooLow':
      recommendations.status = 'DLI muito baixo - Crescimento lento e estiolamento';
      if (lightType !== 'sol') {
        recommendations.actions.push('Aumente a intensidade da luz em 30-50%');
        recommendations.actions.push('Aproxime as luzes das plantas (se seguro)');
      }
      recommendations.actions.push('Aumente o fotoperíodo em 2-4 horas');
      recommendations.actions.push('Considere adicionar luzes suplementares');
      break;
    case 'low':
      recommendations.status = 'DLI baixo - Aceitável mas não ideal';
      if (lightType !== 'sol') {
        recommendations.actions.push('Aumente a intensidade da luz em 10-20%');
      }
      recommendations.actions.push('Aumente o fotoperíodo em 1-2 horas');
      break;
    case 'optimal':
      recommendations.status = 'DLI ótimo - Condições ideais para este estágio';
      recommendations.actions.push('Mantenha as condições atuais');
      break;
    case 'high':
      recommendations.status = 'DLI alto - Aceitável mas risco de estresse luminoso';
      if (lightType !== 'sol') {
        recommendations.actions.push('Reduza a intensidade da luz em 10-20%');
        recommendations.actions.push('Aumente a distância das luzes');
      }
      recommendations.actions.push('Considere reduzir o fotoperíodo em 1-2 horas');
      break;
    case 'tooHigh':
      recommendations.status = 'DLI muito alto - Risco de fotoinibição e queima';
      if (lightType !== 'sol') {
        recommendations.actions.push('Reduza a intensidade da luz em 30-50%');
        recommendations.actions.push('Aumente significativamente a distância das luzes');
      } else {
        recommendations.actions.push('Utilize telas de sombreamento');
      }
      recommendations.actions.push('Reduza o fotoperíodo');
      recommendations.actions.push('Aumente o CO₂ se possível (ajuda a processar mais luz)');
      break;
  }
  
  return recommendations;
}

/**
 * Gera dados para o gráfico de curva de luz diária
 * @param {number} ppfd - PPFD em μmol/m²/s
 * @param {number} hoursOfLight - Horas de luz por dia
 * @returns {object} Dados para o gráfico
 */
function generateLightCurveData(ppfd, hoursOfLight) {
  const data = [];
  const labels = [];
  
  // Gerar dados para 24 horas
  for (let hour = 0; hour < 24; hour++) {
    labels.push(`${hour}:00`);
    
    // Determinar se é hora de luz ou escuridão
    // Assumindo que a luz começa às 6:00
    const lightStart = 6;
    const lightEnd = lightStart + hoursOfLight;
    
    if (hour >= lightStart && hour < lightEnd) {
      data.push(ppfd);
    } else {
      data.push(0);
    }
  }
  
  return {
    labels: labels,
    datasets: [{
      label: 'PPFD (μmol/m²/s)',
      data: data,
      backgroundColor: 'rgba(255, 193, 7, 0.2)',
      borderColor: 'rgba(255, 193, 7, 1)',
      borderWidth: 1,
      fill: true
    }]
  };
}

/**
 * Gera dados para o gráfico comparativo de DLI por estágio
 * @param {number} currentDLI - DLI atual calculado
 * @returns {object} Dados para o gráfico
 */
function generateDLIComparisonData(currentDLI) {
  return {
    labels: ['Mudas', 'Vegetativo', 'Floração'],
    datasets: [
      {
        label: 'Mínimo',
        data: [DLI_RANGES.mudas.min, DLI_RANGES.vegetativo.min, DLI_RANGES.floracao.min],
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1
      },
      {
        label: 'Ótimo',
        data: [DLI_RANGES.mudas.optimal, DLI_RANGES.vegetativo.optimal, DLI_RANGES.floracao.optimal],
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1
      },
      {
        label: 'Máximo',
        data: [DLI_RANGES.mudas.max, DLI_RANGES.vegetativo.max, DLI_RANGES.floracao.max],
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1
      },
      {
        label: 'Atual',
        data: [currentDLI, currentDLI, currentDLI],
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 2,
        type: 'line'
      }
    ]
  };
}

// Exportar funções para uso no frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    luxToPPFD,
    adjustPPFDForDistance,
    calculateDLI,
    estimateEnergyConsumption,
    getDLIZone,
    generateRecommendations,
    generateLightCurveData,
    generateDLIComparisonData,
    DLI_RANGES,
    LIGHT_CONVERSION_FACTORS,
    ENERGY_EFFICIENCY
  };
}
