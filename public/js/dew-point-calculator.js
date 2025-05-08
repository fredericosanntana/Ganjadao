/**
 * Dew Point Calculator - Secagem e Cura
 * 
 * Este script implementa a calculadora de ponto de orvalho para cultivadores de cannabis,
 * permitindo determinar as condições ideais para secagem e cura, evitando mofo e degradação,
 * enquanto preserva terpenos e canabinoides.
 */

// Constantes para faixas ideais por fase
const DEW_POINT_RANGES = {
  secagemInicial: { 
    temp: { min: 15, optimal: 18, max: 21 },
    humidity: { min: 45, optimal: 55, max: 60 }
  },
  secagemMedia: { 
    temp: { min: 15, optimal: 18, max: 21 },
    humidity: { min: 50, optimal: 60, max: 65 }
  },
  cura: { 
    temp: { min: 15, optimal: 18, max: 21 },
    humidity: { min: 58, optimal: 62, max: 65 }
  }
};

// Fatores de ajuste para densidade do material
const DENSITY_FACTORS = {
  solto: 1.2,    // Secagem mais rápida
  medio: 1.0,    // Referência
  denso: 0.8     // Secagem mais lenta
};

// Fatores de ajuste para circulação de ar
const AIRFLOW_FACTORS = {
  baixa: 0.8,    // Secagem mais lenta
  media: 1.0,    // Referência
  alta: 1.2      // Secagem mais rápida
};

/**
 * Calcula o ponto de orvalho
 * @param {number} temperature - Temperatura em °C
 * @param {number} relativeHumidity - Umidade relativa (%)
 * @returns {number} Ponto de orvalho em °C
 */
function calculateDewPoint(temperature, relativeHumidity) {
  // Fórmula de Magnus-Tetens
  const alpha = Math.log(relativeHumidity / 100) + (17.62 * temperature) / (243.12 + temperature);
  return 243.12 * alpha / (17.62 - alpha);
}

/**
 * Calcula o risco de mofo baseado na diferença entre temperatura ambiente e ponto de orvalho
 * @param {number} temperature - Temperatura ambiente em °C
 * @param {number} dewPoint - Ponto de orvalho em °C
 * @returns {string} Nível de risco ('baixo', 'medio', 'alto')
 */
function calculateMoldRisk(temperature, dewPoint) {
  const difference = temperature - dewPoint;
  
  if (difference < 2) return 'alto';
  if (difference < 4) return 'medio';
  return 'baixo';
}

/**
 * Estima a taxa de secagem baseada nas condições
 * @param {number} temperature - Temperatura em °C
 * @param {number} relativeHumidity - Umidade relativa (%)
 * @param {string} density - Densidade do material ('solto', 'medio', 'denso')
 * @param {string} airflow - Circulação de ar ('baixa', 'media', 'alta')
 * @returns {object} Objeto com taxa de secagem e tempo estimado
 */
function estimateDryingRate(temperature, relativeHumidity, density, airflow) {
  // Fator base de secagem (dias para secagem completa em condições de referência)
  const baseDryingTime = 10; // 10 dias em condições de referência (18°C, 60% UR, densidade média, fluxo médio)
  
  // Ajustes baseados na temperatura (cada grau acima de 18°C acelera a secagem em ~5%)
  const tempFactor = 1 + (temperature - 18) * 0.05;
  
  // Ajustes baseados na umidade (cada 5% abaixo de 60% acelera a secagem em ~10%)
  const humidityFactor = 1 + (60 - relativeHumidity) * 0.02;
  
  // Fatores de densidade e circulação de ar
  const densityFactor = DENSITY_FACTORS[density];
  const airflowFactor = AIRFLOW_FACTORS[airflow];
  
  // Calcular taxa de secagem combinada
  const combinedFactor = tempFactor * humidityFactor * densityFactor * airflowFactor;
  
  // Tempo estimado de secagem (em dias)
  const estimatedDryingTime = baseDryingTime / combinedFactor;
  
  // Taxa de secagem diária (% de umidade perdida por dia)
  const dailyDryingRate = 100 / estimatedDryingTime;
  
  return {
    dailyRate: dailyDryingRate,
    estimatedDays: estimatedDryingTime
  };
}

/**
 * Gera recomendações baseadas nas condições e fase
 * @param {number} temperature - Temperatura em °C
 * @param {number} relativeHumidity - Umidade relativa (%)
 * @param {number} dewPoint - Ponto de orvalho em °C
 * @param {string} moldRisk - Nível de risco de mofo
 * @param {object} dryingRate - Objeto com taxa de secagem e tempo estimado
 * @param {string} phase - Fase (secagemInicial, secagemMedia, cura)
 * @param {string} density - Densidade do material
 * @param {string} airflow - Circulação de ar
 * @returns {object} Objeto com recomendações
 */
function generateRecommendations(temperature, relativeHumidity, dewPoint, moldRisk, dryingRate, phase, density, airflow) {
  const range = DEW_POINT_RANGES[phase];
  const recommendations = {
    status: '',
    actions: []
  };
  
  // Verificar temperatura
  if (temperature < range.temp.min) {
    recommendations.actions.push(`Aumente a temperatura para pelo menos ${range.temp.min}°C`);
  } else if (temperature > range.temp.max) {
    recommendations.actions.push(`Reduza a temperatura para no máximo ${range.temp.max}°C`);
  }
  
  // Verificar umidade
  if (relativeHumidity < range.humidity.min) {
    recommendations.actions.push(`Aumente a umidade para pelo menos ${range.humidity.min}%`);
  } else if (relativeHumidity > range.humidity.max) {
    recommendations.actions.push(`Reduza a umidade para no máximo ${range.humidity.max}%`);
  }
  
  // Recomendações baseadas no risco de mofo
  switch (moldRisk) {
    case 'alto':
      recommendations.status = 'Risco alto de mofo - Condições perigosas';
      recommendations.actions.push('Aumente a temperatura ou reduza a umidade imediatamente');
      recommendations.actions.push('Melhore a circulação de ar');
      recommendations.actions.push('Inspecione o material regularmente para sinais de mofo');
      break;
    case 'medio':
      recommendations.status = 'Risco médio de mofo - Monitoramento necessário';
      recommendations.actions.push('Considere aumentar levemente a temperatura');
      recommendations.actions.push('Melhore a circulação de ar');
      break;
    case 'baixo':
      if (temperature >= range.temp.min && temperature <= range.temp.max &&
          relativeHumidity >= range.humidity.min && relativeHumidity <= range.humidity.max) {
        recommendations.status = 'Condições ideais para esta fase';
      } else {
        recommendations.status = 'Risco baixo de mofo, mas condições não ideais';
      }
      break;
  }
  
  // Recomendações baseadas na taxa de secagem
  if (phase === 'secagemInicial' || phase === 'secagemMedia') {
    if (dryingRate.dailyRate > 15) {
      recommendations.actions.push('Secagem muito rápida - Aumente a umidade ou reduza a temperatura');
    } else if (dryingRate.dailyRate < 5) {
      recommendations.actions.push('Secagem muito lenta - Reduza a umidade ou aumente a circulação de ar');
    }
  }
  
  // Recomendações específicas por fase
  switch (phase) {
    case 'secagemInicial':
      if (airflow === 'baixa') {
        recommendations.actions.push('Aumente a circulação de ar para evitar pontos úmidos');
      }
      break;
    case 'secagemMedia':
      if (density === 'denso' && airflow !== 'alta') {
        recommendations.actions.push('Para material denso, aumente a circulação de ar');
      }
      break;
    case 'cura':
      recommendations.actions.push('Abra os recipientes diariamente por 15-30 minutos para troca de ar');
      if (relativeHumidity < 58) {
        recommendations.actions.push('Considere usar pacotes de controle de umidade 62%');
      }
      break;
  }
  
  return recommendations;
}

/**
 * Gera um cronograma recomendado para o processo completo
 * @param {string} density - Densidade do material
 * @returns {object} Cronograma recomendado
 */
function generateSchedule(density) {
  // Ajustar tempos baseados na densidade
  let secagemInicialDias, secagemMediaDias, curaDias;
  
  switch (density) {
    case 'solto':
      secagemInicialDias = 3;
      secagemMediaDias = 4;
      curaDias = 14;
      break;
    case 'medio':
      secagemInicialDias = 4;
      secagemMediaDias = 6;
      curaDias = 21;
      break;
    case 'denso':
      secagemInicialDias = 5;
      secagemMediaDias = 8;
      curaDias = 30;
      break;
    default:
      secagemInicialDias = 4;
      secagemMediaDias = 6;
      curaDias = 21;
  }
  
  return {
    secagemInicial: {
      dias: secagemInicialDias,
      temperatura: `${DEW_POINT_RANGES.secagemInicial.temp.optimal}°C`,
      umidade: `${DEW_POINT_RANGES.secagemInicial.humidity.optimal}%`,
      descricao: 'Remoção inicial de umidade, manter boa circulação de ar'
    },
    secagemMedia: {
      dias: secagemMediaDias,
      temperatura: `${DEW_POINT_RANGES.secagemMedia.temp.optimal}°C`,
      umidade: `${DEW_POINT_RANGES.secagemMedia.humidity.optimal}%`,
      descricao: 'Secagem mais lenta, preservando terpenos'
    },
    cura: {
      dias: curaDias,
      temperatura: `${DEW_POINT_RANGES.cura.temp.optimal}°C`,
      umidade: `${DEW_POINT_RANGES.cura.humidity.optimal}%`,
      descricao: 'Armazenamento em recipientes herméticos, abertura diária'
    }
  };
}

/**
 * Gera dados para o gráfico de risco de mofo
 * @param {number} currentTemp - Temperatura atual em °C
 * @param {number} currentHumidity - Umidade relativa atual (%)
 * @returns {object} Dados para o gráfico
 */
function generateMoldRiskData(currentTemp, currentHumidity) {
  const temperatures = [];
  const humidities = [];
  const dewPoints = [];
  const riskZones = [];
  
  // Gerar temperaturas de 10 a 30°C
  for (let temp = 10; temp <= 30; temp++) {
    temperatures.push(temp);
  }
  
  // Gerar umidades de 30% a 90%
  for (let humidity = 30; humidity <= 90; humidity += 10) {
    humidities.push(humidity);
  }
  
  // Calcular pontos de orvalho para cada combinação
  for (let i = 0; i < humidities.length; i++) {
    const dewPointsForHumidity = [];
    
    for (let j = 0; j < temperatures.length; j++) {
      dewPointsForHumidity.push(calculateDewPoint(temperatures[j], humidities[i]));
    }
    
    dewPoints.push({
      label: `${humidities[i]}% UR`,
      data: dewPointsForHumidity,
      borderColor: `hsl(${220 - i * 20}, 70%, 50%)`,
      backgroundColor: 'transparent',
      borderWidth: 1
    });
  }
  
  // Adicionar zonas de risco
  const highRiskZone = [];
  const mediumRiskZone = [];
  
  for (let j = 0; j < temperatures.length; j++) {
    highRiskZone.push(temperatures[j] - 2);
    mediumRiskZone.push(temperatures[j] - 4);
  }
  
  riskZones.push({
    label: 'Limite de Risco Alto',
    data: highRiskZone,
    borderColor: 'rgba(255, 99, 132, 1)',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderDash: [5, 5]
  });
  
  riskZones.push({
    label: 'Limite de Risco Médio',
    data: mediumRiskZone,
    borderColor: 'rgba(255, 159, 64, 1)',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderDash: [5, 5]
  });
  
  // Adicionar ponto atual
  const currentDewPoint = calculateDewPoint(currentTemp, currentHumidity);
  const currentPoint = {
    label: 'Condição Atual',
    data: Array(temperatures.length).fill(null),
    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
    pointBorderColor: '#fff',
    pointRadius: 6,
    pointHoverRadius: 8,
    type: 'scatter'
  };
  
  // Encontrar o índice mais próximo da temperatura atual
  const tempIndex = temperatures.findIndex(t => t >= currentTemp);
  if (tempIndex !== -1) {
    currentPoint.data[tempIndex] = currentDewPoint;
  }
  
  return {
    labels: temperatures,
    datasets: [...dewPoints, ...riskZones, currentPoint]
  };
}

/**
 * Gera dados para o gráfico de cronograma
 * @param {object} schedule - Cronograma gerado
 * @returns {object} Dados para o gráfico
 */
function generateScheduleChartData(schedule) {
  const labels = ['Secagem Inicial', 'Secagem Média', 'Cura'];
  const dias = [
    schedule.secagemInicial.dias,
    schedule.secagemMedia.dias,
    schedule.cura.dias
  ];
  const temperaturas = [
    parseInt(schedule.secagemInicial.temperatura),
    parseInt(schedule.secagemMedia.temperatura),
    parseInt(schedule.cura.temperatura)
  ];
  const umidades = [
    parseInt(schedule.secagemInicial.umidade),
    parseInt(schedule.secagemMedia.umidade),
    parseInt(schedule.cura.umidade)
  ];
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Dias',
        data: dias,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Temperatura (°C)',
        data: temperaturas,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Umidade (%)',
        data: umidades,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };
}

// Exportar funções para uso no frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateDewPoint,
    calculateMoldRisk,
    estimateDryingRate,
    generateRecommendations,
    generateSchedule,
    generateMoldRiskData,
    generateScheduleChartData,
    DEW_POINT_RANGES,
    DENSITY_FACTORS,
    AIRFLOW_FACTORS
  };
  let chartInstance = null;

  function initChart() {
    const ctx = document.getElementById('mold-risk-chart').getContext('2d'); // ou 'ecChart'
  
    const chartData = generateChartData(); // sua função já existente
  
    if (chartInstance) {
      chartInstance.destroy();
    }
  
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Curvas calculadas automaticamente'
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Eixo X' }
          },
          y: {
            title: { display: true, text: 'Eixo Y' }
          }
        }
      }
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    initChart();
  });
  }
