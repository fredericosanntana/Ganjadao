/**
 * VPD Calculator - Vapor Pressure Deficit
 * 
 * Este script implementa a calculadora VPD para cultivadores de cannabis,
 * permitindo determinar o déficit de pressão de vapor ideal para diferentes
 * estágios de crescimento.
 */

// Constantes para faixas ideais de VPD por estágio (em kPa)
const VPD_RANGES = {
  vegetativo: { min: 0.8, optimal: 1.0, max: 1.2 },
  floracaoInicial: { min: 1.0, optimal: 1.2, max: 1.4 },
  floracaoTardia: { min: 1.2, optimal: 1.4, max: 1.6 }
};

// Cores para zonas de VPD
const VPD_ZONE_COLORS = {
  tooLow: '#3498db',    // Azul - muito úmido
  low: '#2ecc71',       // Verde claro - baixo mas aceitável
  optimal: '#27ae60',   // Verde - ótimo
  high: '#f39c12',      // Laranja - alto mas aceitável
  tooHigh: '#e74c3c'    // Vermelho - muito seco
};

/**
 * Calcula a pressão de vapor saturado para uma dada temperatura
 * @param {number} temperature - Temperatura em °C
 * @returns {number} Pressão de vapor saturado em Pa
 */
function calculateVPsat(temperature) {
  return 610.78 * Math.exp(temperature / (temperature + 237.3) * 17.2694);
}

/**
 * Calcula a pressão de vapor atual
 * @param {number} temperature - Temperatura em °C
 * @param {number} relativeHumidity - Umidade relativa (%)
 * @returns {number} Pressão de vapor atual em Pa
 */
function calculateVP(temperature, relativeHumidity) {
  const vpSat = calculateVPsat(temperature);
  return vpSat * (relativeHumidity / 100);
}

/**
 * Estima a temperatura da folha se não for fornecida
 * @param {number} airTemperature - Temperatura do ar em °C
 * @returns {number} Temperatura estimada da folha em °C
 */
function estimateLeafTemperature(airTemperature) {
  // A temperatura da folha é geralmente 1-2°C menor que a do ar
  // devido à transpiração
  return airTemperature - 1.5;
}

/**
 * Calcula o VPD (Vapor Pressure Deficit)
 * @param {number} leafTemperature - Temperatura da folha em °C
 * @param {number} airTemperature - Temperatura do ar em °C
 * @param {number} relativeHumidity - Umidade relativa (%)
 * @returns {number} VPD em kPa
 */
function calculateVPD(leafTemperature, airTemperature, relativeHumidity) {
  const vpSatLeaf = calculateVPsat(leafTemperature);
  const vpAir = calculateVP(airTemperature, relativeHumidity);
  
  // Converte de Pa para kPa
  return (vpSatLeaf - vpAir) / 1000;
}

/**
 * Determina a zona de VPD com base no valor e estágio de crescimento
 * @param {number} vpd - Valor VPD em kPa
 * @param {string} stage - Estágio de crescimento
 * @returns {string} Zona de VPD (tooLow, low, optimal, high, tooHigh)
 */
function getVPDZone(vpd, stage) {
  const range = VPD_RANGES[stage];
  
  if (vpd < range.min * 0.7) return 'tooLow';
  if (vpd < range.min) return 'low';
  if (vpd <= range.max) return 'optimal';
  if (vpd <= range.max * 1.3) return 'high';
  return 'tooHigh';
}

/**
 * Gera recomendações baseadas no VPD atual e estágio de crescimento
 * @param {number} vpd - Valor VPD em kPa
 * @param {string} zone - Zona de VPD
 * @param {number} temperature - Temperatura atual em °C
 * @param {number} humidity - Umidade relativa atual (%)
 * @param {string} stage - Estágio de crescimento
 * @returns {object} Objeto com recomendações
 */
function generateRecommendations(vpd, zone, temperature, humidity, stage) {
  const range = VPD_RANGES[stage];
  const recommendations = {
    status: '',
    actions: []
  };
  
  switch (zone) {
    case 'tooLow':
      recommendations.status = 'VPD muito baixo - Ambiente muito úmido';
      recommendations.actions.push('Aumente a temperatura em 1-2°C');
      recommendations.actions.push('Reduza a umidade relativa em 5-10%');
      recommendations.actions.push('Melhore a circulação de ar');
      break;
    case 'low':
      recommendations.status = 'VPD baixo - Aceitável mas não ideal';
      recommendations.actions.push('Aumente levemente a temperatura');
      recommendations.actions.push('Reduza levemente a umidade');
      break;
    case 'optimal':
      recommendations.status = 'VPD ótimo - Condições ideais para este estágio';
      recommendations.actions.push('Mantenha as condições atuais');
      break;
    case 'high':
      recommendations.status = 'VPD alto - Aceitável mas não ideal';
      recommendations.actions.push('Reduza levemente a temperatura');
      recommendations.actions.push('Aumente levemente a umidade');
      break;
    case 'tooHigh':
      recommendations.status = 'VPD muito alto - Ambiente muito seco';
      recommendations.actions.push('Reduza a temperatura em 1-2°C');
      recommendations.actions.push('Aumente a umidade relativa em 5-10%');
      recommendations.actions.push('Considere usar umidificador');
      break;
  }
  
  return recommendations;
}

/**
 * Gera dados para o gráfico VPD
 * @param {string} stage - Estágio de crescimento
 * @returns {object} Dados para o gráfico
 */
function generateChartData(stage) {
  const range = VPD_RANGES[stage];
  const temperatures = [];
  const datasets = [];
  
  // Gerar temperaturas de 15 a 35°C
  for (let temp = 15; temp <= 35; temp++) {
    temperatures.push(temp);
  }
  
  // Gerar curvas de umidade de 20% a 90% em incrementos de 10%
  for (let humidity = 20; humidity <= 90; humidity += 10) {
    const data = temperatures.map(temp => {
      const leafTemp = estimateLeafTemperature(temp);
      return calculateVPD(leafTemp, temp, humidity);
    });
    
    datasets.push({
      label: `${humidity}% UR`,
      data: data,
      borderColor: `hsl(${200 - humidity * 1.5}, 70%, 50%)`,
      backgroundColor: 'transparent',
      borderWidth: 1
    });
  }
  
  // Adicionar linhas para faixas ideais
  const optimalMin = Array(temperatures.length).fill(range.min);
  const optimalMax = Array(temperatures.length).fill(range.max);
  
  datasets.push({
    label: 'Mínimo Ideal',
    data: optimalMin,
    borderColor: '#27ae60',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderDash: [5, 5]
  });
  
  datasets.push({
    label: 'Máximo Ideal',
    data: optimalMax,
    borderColor: '#27ae60',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderDash: [5, 5]
  });
  
  return {
    labels: temperatures,
    datasets: datasets
  };
}

// Exportar funções para uso no frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateVPD,
    estimateLeafTemperature,
    getVPDZone,
    generateRecommendations,
    generateChartData,
    VPD_RANGES,
    VPD_ZONE_COLORS
  };
}
