/**
 * Calculadora de Nutrientes
 * 
 * Este script implementa a calculadora de nutrientes para cultivadores de cannabis,
 * permitindo determinar as proporções ideais de macro e micronutrientes para
 * cada fase do cultivo.
 */

// Constantes para proporções NPK ideais por fase
const NPK_RATIOS = {
  mudas: { n: 3, p: 1, k: 1 },
  vegetativo: { n: 3, p: 1, k: 2 },
  preFloração: { n: 2, p: 2, k: 3 },
  floração: { n: 1, p: 3, k: 4 },
  flush: { n: 0, p: 0, k: 0 }
};

// Faixas de EC/PPM alvo por fase e substrato
const EC_TARGETS = {
  mudas: {
    solo: { min: 0.4, max: 0.8 },
    coco: { min: 0.6, max: 1.0 },
    hidroponia: { min: 0.8, max: 1.2 }
  },
  vegetativo: {
    solo: { min: 0.8, max: 1.6 },
    coco: { min: 1.2, max: 2.0 },
    hidroponia: { min: 1.5, max: 2.2 }
  },
  preFloração: {
    solo: { min: 1.2, max: 1.8 },
    coco: { min: 1.6, max: 2.2 },
    hidroponia: { min: 1.8, max: 2.4 }
  },
  floração: {
    solo: { min: 1.4, max: 2.0 },
    coco: { min: 1.8, max: 2.4 },
    hidroponia: { min: 2.0, max: 2.6 }
  },
  flush: {
    solo: { min: 0, max: 0.4 },
    coco: { min: 0, max: 0.4 },
    hidroponia: { min: 0, max: 0.4 }
  }
};

// Fatores de conversão entre diferentes unidades de EC/PPM
const EC_CONVERSION = {
  ecToPPM500: 500,  // EC × 500 = PPM (escala 500)
  ecToPPM700: 700,  // EC × 700 = PPM (escala 700)
  ppm500ToEC: 1/500, // PPM ÷ 500 = EC
  ppm700ToEC: 1/700  // PPM ÷ 700 = EC
};

// Nutrientes comuns e suas concentrações (% de N-P-K)
const COMMON_NUTRIENTS = {
  // Nutrientes base
  "Grow (Vegetativo)": { n: 3, p: 1, k: 3, form: "líquido", concentration: 1.0 },
  "Bloom (Floração)": { n: 1, p: 4, k: 5, form: "líquido", concentration: 1.0 },
  "Micro": { n: 5, p: 0, k: 1, form: "líquido", concentration: 1.0 },
  
  // Suplementos
  "CalMag": { ca: 4, mg: 2, form: "líquido", concentration: 1.0 },
  "Silício": { si: 2, form: "líquido", concentration: 0.5 },
  "Enzimas": { form: "líquido", concentration: 0.5 },
  
  // Potenciadores
  "PK Booster": { p: 10, k: 15, form: "líquido", concentration: 1.0 },
  "Estimulador de Raízes": { form: "líquido", concentration: 0.5 },
  "Potenciador de Floração": { form: "líquido", concentration: 0.5 }
};

// Ajustes para dureza da água
const WATER_HARDNESS_ADJUSTMENTS = {
  soft: { ca: -0.1, mg: -0.1, ec: -0.1 },
  medium: { ca: 0, mg: 0, ec: 0 },
  hard: { ca: 0.1, mg: 0.1, ec: 0.1 }
};

// Deficiências comuns e suas correções
const DEFICIENCY_CORRECTIONS = {
  nitrogen: {
    symptoms: "Folhas inferiores amarelando, crescimento lento",
    solutions: ["Aumentar dose de nutrientes vegetativos", "Adicionar fertilizante rico em N"]
  },
  phosphorus: {
    symptoms: "Folhas roxas/vermelhas, crescimento atrofiado",
    solutions: ["Aumentar dose de PK Booster", "Verificar pH (ideal: 6.0-6.5)"]
  },
  potassium: {
    symptoms: "Bordas das folhas amareladas/marrons, manchas",
    solutions: ["Aumentar dose de nutrientes de floração", "Adicionar PK Booster"]
  },
  calcium: {
    symptoms: "Pontos marrons nas folhas, deformação de folhas novas",
    solutions: ["Adicionar CalMag", "Verificar pH (ideal: 6.2-6.5)"]
  },
  magnesium: {
    symptoms: "Amarelamento entre as nervuras das folhas",
    solutions: ["Adicionar CalMag", "Aplicar sulfato de magnésio (sais Epsom)"]
  },
  iron: {
    symptoms: "Amarelamento entre nervuras de folhas novas",
    solutions: ["Adicionar micronutrientes", "Verificar pH (ideal: 5.5-6.5)"]
  },
  zinc: {
    symptoms: "Folhas retorcidas, internódios curtos",
    solutions: ["Adicionar micronutrientes", "Verificar pH (ideal: 5.5-6.5)"]
  }
};

/**
 * Converte entre diferentes unidades de EC/PPM
 * @param {number} value - Valor a ser convertido
 * @param {string} fromUnit - Unidade de origem ('ec', 'ppm500', 'ppm700')
 * @param {string} toUnit - Unidade de destino ('ec', 'ppm500', 'ppm700')
 * @returns {number} Valor convertido
 */
function convertECPPM(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;
  
  let ecValue;
  
  // Converter para EC primeiro
  switch (fromUnit) {
    case 'ec':
      ecValue = value;
      break;
    case 'ppm500':
      ecValue = value * EC_CONVERSION.ppm500ToEC;
      break;
    case 'ppm700':
      ecValue = value * EC_CONVERSION.ppm700ToEC;
      break;
    default:
      throw new Error('Unidade de origem inválida');
  }
  
  // Converter de EC para unidade de destino
  switch (toUnit) {
    case 'ec':
      return ecValue;
    case 'ppm500':
      return ecValue * EC_CONVERSION.ecToPPM500;
    case 'ppm700':
      return ecValue * EC_CONVERSION.ecToPPM700;
    default:
      throw new Error('Unidade de destino inválida');
  }
}

/**
 * Calcula a EC/PPM alvo com base na fase e substrato
 * @param {string} phase - Fase de crescimento
 * @param {string} substrate - Tipo de substrato
 * @param {string} unit - Unidade desejada ('ec', 'ppm500', 'ppm700')
 * @returns {object} Objeto com valores mínimo e máximo
 */
function calculateTargetEC(phase, substrate, unit = 'ec') {
  const targets = EC_TARGETS[phase][substrate];
  
  if (unit === 'ec') {
    return targets;
  }
  
  return {
    min: convertECPPM(targets.min, 'ec', unit),
    max: convertECPPM(targets.max, 'ec', unit)
  };
}

/**
 * Calcula a quantidade de nutrientes necessária
 * @param {string} phase - Fase de crescimento
 * @param {string} substrate - Tipo de substrato
 * @param {number} waterVolume - Volume de água em litros
 * @param {number} waterEC - EC da água base
 * @param {string} waterHardness - Dureza da água ('soft', 'medium', 'hard')
 * @param {object} selectedNutrients - Objeto com nutrientes selecionados
 * @returns {object} Objeto com dosagens e EC resultante
 */
function calculateNutrients(phase, substrate, waterVolume, waterEC, waterHardness, selectedNutrients) {
  // Obter EC alvo
  const targetEC = calculateTargetEC(phase, substrate);
  const targetECValue = (targetEC.min + targetEC.max) / 2;
  
  // Ajustar para dureza da água
  const hardnessAdjustment = WATER_HARDNESS_ADJUSTMENTS[waterHardness].ec;
  const adjustedTargetEC = targetECValue + hardnessAdjustment;
  
  // EC disponível para nutrientes (subtrair EC da água base)
  const availableEC = Math.max(0, adjustedTargetEC - waterEC);
  
  // Se estamos em fase de flush, retornar valores mínimos
  if (phase === 'flush') {
    return {
      dosages: {},
      resultEC: waterEC,
      targetEC: targetECValue
    };
  }
  
  // Calcular proporção NPK ideal para a fase
  const npkRatio = NPK_RATIOS[phase];
  
  // Calcular dosagens
  const dosages = {};
  let totalContribution = 0;
  
  // Distribuir a EC disponível entre os nutrientes selecionados
  for (const [nutrient, selected] of Object.entries(selectedNutrients)) {
    if (selected && COMMON_NUTRIENTS[nutrient]) {
      // Atribuir uma contribuição relativa baseada no NPK e fase
      let contribution = 0;
      
      if (COMMON_NUTRIENTS[nutrient].n && phase === 'vegetativo') {
        contribution += 3;
      }
      if (COMMON_NUTRIENTS[nutrient].p && (phase === 'preFloração' || phase === 'floração')) {
        contribution += 3;
      }
      if (COMMON_NUTRIENTS[nutrient].k && (phase === 'preFloração' || phase === 'floração')) {
        contribution += 3;
      }
      
      // Nutrientes sem NPK específico recebem contribuição padrão
      if (contribution === 0) {
        contribution = 1;
      }
      
      totalContribution += contribution;
      dosages[nutrient] = { contribution };
    }
  }
  
  // Calcular ml por litro para cada nutriente
  for (const nutrient in dosages) {
    const relativeContribution = dosages[nutrient].contribution / totalContribution;
    const ecContribution = availableEC * relativeContribution;
    
    // Converter EC para ml/L (aproximação simplificada)
    // Assumindo que 1ml/L de nutriente contribui aproximadamente 0.2 EC
    const mlPerLiter = ecContribution / 0.2 / COMMON_NUTRIENTS[nutrient].concentration;
    
    dosages[nutrient].mlPerLiter = mlPerLiter;
    dosages[nutrient].mlTotal = mlPerLiter * waterVolume;
  }
  
  return {
    dosages,
    resultEC: waterEC + availableEC,
    targetEC: targetECValue
  };
}

/**
 * Gera um cronograma semanal de alimentação
 * @param {string} phase - Fase de crescimento
 * @param {object} dosages - Objeto com dosagens calculadas
 * @returns {object} Cronograma semanal
 */
function generateFeedingSchedule(phase, dosages) {
  const schedule = {
    week1: {},
    week2: {},
    week3: {},
    week4: {}
  };
  
  // Fatores de ajuste por semana (% da dose completa)
  let weeklyFactors;
  
  switch (phase) {
    case 'mudas':
      weeklyFactors = { week1: 0.5, week2: 0.7, week3: 0.9, week4: 1.0 };
      break;
    case 'vegetativo':
      weeklyFactors = { week1: 0.7, week2: 0.8, week3: 0.9, week4: 1.0 };
      break;
    case 'preFloração':
      weeklyFactors = { week1: 0.8, week2: 0.9, week3: 1.0, week4: 1.0 };
      break;
    case 'floração':
      weeklyFactors = { week1: 0.9, week2: 1.0, week3: 1.0, week4: 0.9 };
      break;
    case 'flush':
      weeklyFactors = { week1: 0, week2: 0, week3: 0, week4: 0 };
      break;
    default:
      weeklyFactors = { week1: 1.0, week2: 1.0, week3: 1.0, week4: 1.0 };
  }
  
  // Gerar cronograma
  for (const week in weeklyFactors) {
    const factor = weeklyFactors[week];
    
    for (const nutrient in dosages) {
      schedule[week][nutrient] = {
        mlPerLiter: dosages[nutrient].mlPerLiter * factor,
        mlTotal: dosages[nutrient].mlTotal * factor
      };
    }
  }
  
  return schedule;
}

/**
 * Verifica incompatibilidades entre nutrientes
 * @param {object} selectedNutrients - Objeto com nutrientes selecionados
 * @returns {array} Lista de incompatibilidades encontradas
 */
function checkIncompatibilities(selectedNutrients) {
  const incompatibilities = [];
  
  // Exemplos de incompatibilidades comuns
  if (selectedNutrients["CalMag"] && selectedNutrients["Silício"]) {
    incompatibilities.push("CalMag e Silício podem precipitar quando misturados diretamente. Adicione com intervalo de tempo.");
  }
  
  if (selectedNutrients["Enzimas"] && selectedNutrients["PK Booster"]) {
    incompatibilities.push("Enzimas podem ser degradadas por altas concentrações de fósforo. Use em dias alternados.");
  }
  
  return incompatibilities;
}

/**
 * Identifica possíveis deficiências com base nos sintomas
 * @param {array} symptoms - Lista de sintomas observados
 * @returns {array} Lista de possíveis deficiências e soluções
 */
function identifyDeficiencies(symptoms) {
  const possibleDeficiencies = [];
  
  for (const [nutrient, info] of Object.entries(DEFICIENCY_CORRECTIONS)) {
    if (symptoms.some(symptom => info.symptoms.toLowerCase().includes(symptom.toLowerCase()))) {
      possibleDeficiencies.push({
        nutrient,
        symptoms: info.symptoms,
        solutions: info.solutions
      });
    }
  }
  
  return possibleDeficiencies;
}

/**
 * Gera dados para visualização de níveis de nutrientes
 * @param {object} dosages - Objeto com dosagens calculadas
 * @param {string} phase - Fase de crescimento
 * @returns {object} Dados para visualização
 */
function generateNutrientLevelsData(dosages, phase) {
  const npkRatio = NPK_RATIOS[phase];
  const data = {
    labels: ['Nitrogênio (N)', 'Fósforo (P)', 'Potássio (K)', 'Cálcio (Ca)', 'Magnésio (Mg)', 'Micronutrientes'],
    datasets: [{
      label: 'Nível Atual',
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }, {
      label: 'Nível Ideal',
      data: [npkRatio.n, npkRatio.p, npkRatio.k, 2, 1, 1],
      backgroundColor: 'rgba(255, 206, 86, 0.5)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1
    }]
  };
  
  // Calcular níveis atuais com base nas dosagens
  for (const nutrient in dosages) {
    const info = COMMON_NUTRIENTS[nutrient];
    if (info.n) data.datasets[0].data[0] += dosages[nutrient].mlPerLiter * info.n / 10;
    if (info.p) data.datasets[0].data[1] += dosages[nutrient].mlPerLiter * info.p / 10;
    if (info.k) data.datasets[0].data[2] += dosages[nutrient].mlPerLiter * info.k / 10;
    if (info.ca) data.datasets[0].data[3] += dosages[nutrient].mlPerLiter * info.ca / 10;
    if (info.mg) data.datasets[0].data[4] += dosages[nutrient].mlPerLiter * info.mg / 10;
    
    // Micronutrientes (simplificação)
    if (nutrient === "Micro") {
      data.datasets[0].data[5] += dosages[nutrient].mlPerLiter / 5;
    }
  }
  
  return data;
}

// Exportar funções para uso no frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertECPPM,
    calculateTargetEC,
    calculateNutrients,
    generateFeedingSchedule,
    checkIncompatibilities,
    identifyDeficiencies,
    generateNutrientLevelsData,
    NPK_RATIOS,
    EC_TARGETS,
    COMMON_NUTRIENTS,
    DEFICIENCY_CORRECTIONS
  };
}
