/**
 * EC Flush Calculator
 * 
 * Este script implementa a calculadora EC Flush para cultivadores de cannabis,
 * permitindo determinar quando e como realizar o flush (lavagem) do substrato
 * para remover excesso de sais e nutrientes antes da colheita.
 */

// Fatores de substrato para volume de água necessário
const SUBSTRATE_FACTORS = {
  solo: 3,      // 3x o volume do vaso
  coco: 5,      // 5x o volume do vaso
  hidroponia: 2 // 2x o volume do sistema
};

// Eficiência de remoção de sais por flush
const SALT_REMOVAL_EFFICIENCY = {
  solo: 0.5,    // 50% de remoção por flush completo
  coco: 0.7,    // 70% de remoção por flush completo
  hidroponia: 0.9 // 90% de remoção por flush completo
};

// EC alvo para flush final
const TARGET_FLUSH_EC = 0.2; // mS/cm

/**
 * Calcula o volume de água necessário para um flush completo
 * @param {number} potSize - Volume do vaso/sistema em litros
 * @param {string} substrate - Tipo de substrato ('solo', 'coco', 'hidroponia')
 * @returns {number} Volume de água em litros
 */
function calculateWaterVolume(potSize, substrate) {
  return potSize * SUBSTRATE_FACTORS[substrate];
}

/**
 * Calcula o número recomendado de flushes
 * @param {number} currentEC - EC atual do substrato ou runoff
 * @param {number} targetEC - EC alvo após o flush
 * @param {string} substrate - Tipo de substrato
 * @returns {number} Número recomendado de flushes
 */
function calculateNumberOfFlushes(currentEC, targetEC, substrate) {
  // Se a EC atual já é menor ou igual à alvo, não precisa de flush
  if (currentEC <= targetEC) return 0;
  
  // Calcular quantos flushes são necessários para reduzir a EC atual para a alvo
  const efficiency = SALT_REMOVAL_EFFICIENCY[substrate];
  const ecReduction = currentEC - targetEC;
  
  // Cada flush reduz a EC em (EC atual * eficiência)
  let remainingEC = currentEC;
  let flushCount = 0;
  
  while (remainingEC > targetEC && flushCount < 10) { // Limite de 10 flushes para evitar loop infinito
    remainingEC = remainingEC * (1 - efficiency);
    flushCount++;
  }
  
  return flushCount;
}

/**
 * Gera um cronograma de redução gradual de EC
 * @param {number} currentEC - EC atual do substrato ou runoff
 * @param {number} targetEC - EC alvo após o flush
 * @param {number} daysRemaining - Dias restantes até a colheita
 * @param {number} flushCount - Número de flushes recomendado
 * @returns {array} Cronograma de redução de EC
 */
function generateECReductionSchedule(currentEC, targetEC, daysRemaining, flushCount) {
  // Se não precisa de flush ou não há dias suficientes
  if (flushCount === 0 || daysRemaining <= 0) {
    return [];
  }
  
  const schedule = [];
  
  // Determinar intervalo entre flushes
  const interval = Math.max(1, Math.floor(daysRemaining / (flushCount + 1)));
  
  // EC inicial
  let currentDay = 0;
  let remainingEC = currentEC;
  
  schedule.push({
    day: currentDay,
    ec: remainingEC.toFixed(2),
    action: "Medição inicial"
  });
  
  // Calcular redução por flush
  const ecStep = (currentEC - targetEC) / flushCount;
  
  // Gerar cronograma
  for (let i = 0; i < flushCount; i++) {
    currentDay += interval;
    remainingEC -= ecStep;
    
    if (currentDay <= daysRemaining) {
      schedule.push({
        day: currentDay,
        ec: remainingEC.toFixed(2),
        action: `Flush #${i + 1}`
      });
    }
  }
  
  // Adicionar dia da colheita
  if (currentDay < daysRemaining) {
    schedule.push({
      day: daysRemaining,
      ec: targetEC.toFixed(2),
      action: "Colheita"
    });
  }
  
  return schedule;
}

/**
 * Gera instruções específicas para o tipo de substrato
 * @param {string} substrate - Tipo de substrato
 * @param {number} waterVolume - Volume de água por flush
 * @param {number} flushCount - Número de flushes recomendado
 * @returns {array} Lista de instruções
 */
function generateSubstrateInstructions(substrate, waterVolume, flushCount) {
  const instructions = [];
  
  switch (substrate) {
    case 'solo':
      instructions.push(`Regue lentamente com ${waterVolume}L de água, permitindo que drene completamente`);
      instructions.push("Aguarde até que o substrato esteja levemente seco antes do próximo flush (geralmente 1-2 dias)");
      instructions.push("Monitore a EC do runoff após cada flush para acompanhar o progresso");
      if (flushCount > 2) {
        instructions.push("Considere usar enzimas para ajudar a quebrar sais acumulados");
      }
      break;
      
    case 'coco':
      instructions.push(`Regue abundantemente com ${waterVolume}L de água, garantindo pelo menos 20% de runoff`);
      instructions.push("O coco pode ser regado mais frequentemente que o solo, permitindo flushes diários se necessário");
      instructions.push("Monitore a EC do runoff após cada flush para acompanhar o progresso");
      instructions.push("Considere adicionar CalMag em baixa dosagem (0.5 ml/L) na água de flush para evitar deficiências");
      break;
      
    case 'hidroponia':
      instructions.push(`Drene completamente o reservatório e substitua por ${waterVolume}L de água fresca`);
      instructions.push("Mantenha o sistema funcionando por pelo menos 6 horas antes de drenar novamente");
      instructions.push("Limpe filtros e bombas entre os flushes para remover acúmulos de sais");
      instructions.push("Monitore a EC da solução a cada 12 horas durante o processo de flush");
      break;
      
    default:
      instructions.push(`Use ${waterVolume}L de água por flush`);
      instructions.push("Monitore a EC regularmente para acompanhar o progresso");
  }
  
  return instructions;
}

/**
 * Gera recomendações baseadas nos parâmetros de flush
 * @param {number} currentEC - EC atual do substrato ou runoff
 * @param {number} waterEC - EC da água de entrada
 * @param {number} daysRemaining - Dias restantes até a colheita
 * @param {number} flushCount - Número de flushes recomendado
 * @returns {object} Objeto com recomendações
 */
function generateFlushRecommendations(currentEC, waterEC, daysRemaining, flushCount) {
  const recommendations = {
    status: '',
    actions: []
  };
  
  // Verificar se a água de entrada tem EC muito alta
  if (waterEC > 0.3) {
    recommendations.actions.push(`Sua água tem EC ${waterEC} mS/cm, considere usar água filtrada ou osmose reversa para flush mais eficiente`);
  }
  
  // Verificar se há dias suficientes para o flush
  if (daysRemaining < flushCount * 2) {
    recommendations.status = 'Tempo limitado para flush completo';
    recommendations.actions.push(`Você tem apenas ${daysRemaining} dias, mas idealmente seriam necessários ${flushCount * 2} dias para ${flushCount} flushes`);
    recommendations.actions.push("Considere realizar flushes mais frequentes ou adiar a colheita");
  } else if (flushCount === 0) {
    recommendations.status = 'Flush não necessário';
    recommendations.actions.push(`A EC atual (${currentEC} mS/cm) já está próxima ou abaixo do alvo`);
    recommendations.actions.push("Continue regando apenas com água até a colheita");
  } else {
    recommendations.status = 'Cronograma de flush recomendado';
    recommendations.actions.push(`Realize ${flushCount} flushes nos próximos ${daysRemaining} dias`);
    recommendations.actions.push("Monitore a EC do runoff após cada flush para ajustar o cronograma se necessário");
  }
  
  // Recomendações gerais
  recommendations.actions.push("Mantenha a temperatura e umidade adequadas durante o flush para evitar estresse");
  
  return recommendations;
}

/**
 * Gera dados para o gráfico de redução de EC
 * @param {array} schedule - Cronograma de redução de EC
 * @returns {object} Dados para o gráfico
 */
function generateECReductionChartData(schedule) {
  const labels = [];
  const ecData = [];
  const flushPoints = [];
  
  schedule.forEach(item => {
    labels.push(`Dia ${item.day}`);
    ecData.push(parseFloat(item.ec));
    
    // Marcar pontos de flush
    if (item.action.includes('Flush')) {
      flushPoints.push({
        x: `Dia ${item.day}`,
        y: parseFloat(item.ec),
        r: 6
      });
    }
  });
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'EC (mS/cm)',
        data: ecData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Flushes',
        data: flushPoints,
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        type: 'bubble'
      }
    ]
  };
}

/**
 * Gera dados para o gráfico de eficiência de flush
 * @param {string} substrate - Tipo de substrato
 * @param {number} currentEC - EC atual
 * @param {number} targetEC - EC alvo
 * @returns {object} Dados para o gráfico
 */
function generateFlushEfficiencyChartData(substrate, currentEC, targetEC) {
  const efficiency = SALT_REMOVAL_EFFICIENCY[substrate];
  const labels = [];
  const ecData = [];
  
  let remainingEC = currentEC;
  
  // Gerar dados para até 10 flushes
  for (let i = 0; i <= 10; i++) {
    labels.push(`Flush ${i}`);
    ecData.push(remainingEC);
    remainingEC = remainingEC * (1 - efficiency);
  }
  
  // Adicionar linha para EC alvo
  const targetLine = Array(labels.length).fill(targetEC);
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'EC Projetada (mS/cm)',
        data: ecData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'EC Alvo',
        data: targetLine,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  };
}

// Exportar funções para uso no frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateWaterVolume,
    calculateNumberOfFlushes,
    generateECReductionSchedule,
    generateSubstrateInstructions,
    generateFlushRecommendations,
    generateECReductionChartData,
    generateFlushEfficiencyChartData,
    SUBSTRATE_FACTORS,
    SALT_REMOVAL_EFFICIENCY,
    TARGET_FLUSH_EC
  };
}
