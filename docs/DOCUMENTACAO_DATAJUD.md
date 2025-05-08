# Documentação da Integração com a API do DataJud

## Visão Geral

A integração com a API do DataJud permite que o módulo de jurisprudência do aplicativo Cannabis App acesse decisões judiciais diretamente da base de dados do Conselho Nacional de Justiça (CNJ), complementando a base de dados local existente.

Esta funcionalidade proporciona aos usuários acesso a um conjunto muito mais amplo de jurisprudências relacionadas ao autocultivo de cannabis, permitindo pesquisas mais abrangentes e atualizadas.

## Funcionalidades Implementadas

1. **Busca Combinada**: Capacidade de buscar jurisprudências tanto na base local quanto na API do DataJud simultaneamente.
2. **Filtros Específicos**: Manutenção dos filtros existentes (estado, quantidade de plantas, tipo de uso, resultado) com adaptação para a API do DataJud.
3. **Seleção de Fonte**: Interface que permite ao usuário escolher entre usar apenas a base local, apenas o DataJud, ou ambas as fontes.
4. **Termo de Busca Personalizado**: Campo adicional para especificar termos de busca quando o DataJud é selecionado.
5. **Paginação**: Suporte à navegação entre múltiplas páginas de resultados do DataJud.
6. **Identificação Visual**: Badges que identificam a origem de cada resultado (Local ou DataJud).
7. **Acesso ao Inteiro Teor**: Links diretos para o documento completo quando disponível no DataJud.

## Arquitetura da Integração

A integração foi implementada seguindo a arquitetura existente do aplicativo, com as seguintes adições e modificações:

### Serviço DataJud

O arquivo `services/datajudService.js` implementa a comunicação com a API do DataJud, oferecendo duas funções principais:

- `buscarJurisprudencias`: Busca jurisprudências com base em parâmetros como termo de busca, tribunal, etc.
- `buscarProcesso`: Obtém detalhes de um processo específico pelo número.

### Controlador Jurídico

O controlador `controllers/juridicoController.js` foi atualizado para:

1. Importar e utilizar o serviço DataJud
2. Modificar a função `filtrarJurisprudencia` para suportar busca combinada
3. Adaptar a função `getJurisprudenciaDetalhes` para exibir detalhes de processos do DataJud
4. Adicionar uma nova função `buscarDataJud` para busca direta no DataJud

### Interface do Usuário

A interface foi atualizada para incluir:

1. Opções de seleção de fonte de dados (Base Local e DataJud)
2. Campo de termo de busca específico para o DataJud
3. Exibição de informações sobre as fontes utilizadas nos resultados
4. Sistema de paginação para navegar entre múltiplas páginas de resultados
5. Badges visuais que identificam a origem de cada resultado

## Uso da API

A API do DataJud é acessada através de requisições HTTP autenticadas com uma chave de API. Os principais endpoints utilizados são:

- `/jurisprudencias`: Para buscar jurisprudências com base em parâmetros
- `/processo/{numeroProcesso}`: Para obter detalhes de um processo específico

Os resultados da API são adaptados para o formato utilizado pelo aplicativo, permitindo uma exibição consistente independentemente da fonte dos dados.

## Limitações e Considerações

1. **Filtros Adaptados**: Alguns filtros específicos do aplicativo (como quantidade de plantas) são aplicados localmente após a busca no DataJud, pois a API não suporta esses filtros diretamente.

2. **Extração de Informações**: Informações como tipo de uso e resultado são extraídas do texto da ementa através de expressões regulares, o que pode não ser 100% preciso em todos os casos.

3. **Paginação**: A paginação só é aplicada aos resultados do DataJud, enquanto os resultados locais são sempre exibidos integralmente.

4. **Desempenho**: Buscas combinadas podem levar mais tempo para retornar resultados, especialmente quando o DataJud retorna muitos itens.

## Manutenção e Expansão Futura

Para manutenção e expansão futura da integração com o DataJud, considere:

1. **Atualização da Chave de API**: A chave de API do DataJud pode expirar e precisar ser atualizada periodicamente.

2. **Expansão de Filtros**: Implementar mais filtros específicos à medida que a API do DataJud evolui.

3. **Cache de Resultados**: Implementar um sistema de cache para melhorar o desempenho em buscas frequentes.

4. **Análise Avançada**: Adicionar funcionalidades de análise de texto mais sofisticadas para extrair informações relevantes das ementas.
