# Documentação das Calculadoras Técnicas para Cultivo de Cannabis

## Visão Geral

Este documento descreve a implementação das cinco calculadoras técnicas integradas ao aplicativo Cannabis App. Estas calculadoras foram desenvolvidas para auxiliar cultivadores de cannabis a otimizar suas práticas de cultivo através de cálculos precisos para diferentes aspectos do processo.

## Estrutura do Projeto

As calculadoras foram implementadas seguindo a arquitetura MVC (Model-View-Controller) do aplicativo existente:

- **Views**: `/cannabis-app/views/calculadoras/`
- **Controllers**: Lógica implementada em JavaScript no lado do cliente
- **Rotas**: `/cannabis-app/routes/calculadoras.js`
- **Scripts**: `/cannabis-app/public/js/`

## Calculadoras Implementadas

### 1. Calculadora VPD (Vapor Pressure Deficit)

**Arquivo principal**: `/public/js/vpd-calculator.js`  
**View**: `/views/calculadoras/vpd.ejs`

**Funcionalidades**:
- Cálculo do déficit de pressão de vapor com base na temperatura ambiente, umidade relativa e temperatura da folha
- Visualização gráfica das zonas ideais de VPD para diferentes estágios de crescimento
- Recomendações automáticas baseadas nos valores calculados
- Opção de cálculo automático da temperatura da folha

**Fórmulas utilizadas**:
- Pressão de vapor saturado (SVP): 610.7 * 10^(7.5 * T / (237.3 + T))
- Pressão de vapor atual (AVP): SVP * (UR / 100)
- VPD: SVP - AVP

### 2. Calculadora DLI (Daily Light Integral)

**Arquivo principal**: `/public/js/dli-calculator.js`  
**View**: `/views/calculadoras/dli.ejs`

**Funcionalidades**:
- Conversão entre diferentes tipos de luz (HPS, LED, CMH, Fluorescente, Sol)
- Cálculo do DLI com base na intensidade da luz, horas de exposição e distância
- Recomendações específicas por estágio de crescimento
- Estimativa de consumo energético

**Fórmulas utilizadas**:
- Conversão lux para PPFD: lux * fator_conversão (específico para cada tipo de luz)
- DLI: PPFD * horas_luz * 0.0036
- Ajuste de distância: PPFD * (distância_referência / distância_atual)²

### 3. Calculadora de Nutrientes

**Arquivo principal**: `/public/js/nutrientes-calculator.js`  
**View**: `/views/calculadoras/nutrientes.ejs`

**Funcionalidades**:
- Cálculo de proporções NPK ideais para cada fase de crescimento
- Ajustes baseados no tipo de substrato e dureza da água
- Identificador de deficiências nutricionais baseado em sintomas
- Cronograma semanal de alimentação

**Algoritmos principais**:
- Matriz de proporções de nutrientes por fase de crescimento
- Sistema de identificação de deficiências baseado em sintomas visuais
- Cálculo de EC/PPM alvo com base no substrato e fase

### 4. Calculadora de Ponto de Orvalho (Dew Point)

**Arquivo principal**: `/public/js/dew-point-calculator.js`  
**View**: `/views/calculadoras/dew-point.ejs`

**Funcionalidades**:
- Cálculo do ponto de orvalho para determinar risco de mofo
- Cronograma recomendado para secagem e cura
- Ajustes baseados na densidade do material e circulação de ar
- Visualização gráfica da curva de secagem

**Fórmulas utilizadas**:
- Ponto de orvalho: 243.12 * LN(UR/100 * e^((17.62 * T)/(243.12 + T))) / (17.62 - LN(UR/100 * e^((17.62 * T)/(243.12 + T))))
- Risco de mofo: baseado na diferença entre temperatura ambiente e ponto de orvalho

### 5. Calculadora EC Flush

**Arquivo principal**: `/public/js/ec-flush-calculator.js`  
**View**: `/views/calculadoras/ec-flush.ejs`

**Funcionalidades**:
- Cálculo do volume de água necessário para flush
- Determinação do número ideal de flushes
- Cronograma de redução gradual de EC
- Recomendações específicas por tipo de substrato

**Algoritmos principais**:
- Cálculo de volume: baseado no volume do vaso e tipo de substrato
- Número de flushes: baseado nos dias restantes até a colheita
- Redução de EC: modelo de diluição exponencial

## Integração com o Aplicativo Existente

As calculadoras foram integradas ao aplicativo existente através de:

1. Adição de rotas em `/routes/calculadoras.js`
2. Inclusão do link "Calculadoras" no menu principal
3. Criação de uma página índice que lista todas as calculadoras disponíveis
4. Atualização do arquivo `server.js` para incluir as novas rotas

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript, EJS
- **Visualização de dados**: Chart.js
- **Backend**: Node.js, Express
- **Cálculos matemáticos**: JavaScript nativo

## Considerações para Manutenção Futura

- As calculadoras funcionam de forma independente, facilitando atualizações individuais
- Os parâmetros de referência (como valores ideais de VPD, DLI, etc.) estão definidos como constantes no início de cada arquivo JavaScript, facilitando ajustes futuros
- A interface foi desenvolvida com design responsivo para funcionar em dispositivos móveis e desktop
- Todas as calculadoras incluem informações educativas sobre os parâmetros calculados

## Possíveis Melhorias Futuras

- Integração com sensores para leitura automática de parâmetros ambientais
- Armazenamento de histórico de cálculos em banco de dados
- Exportação de resultados em formato PDF ou CSV
- Integração com sistemas de automação de cultivo
