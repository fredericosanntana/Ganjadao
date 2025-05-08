# Documentação do Aplicativo de Apoio ao Autocultivo de Cannabis

## Visão Geral

Este aplicativo web foi desenvolvido para fornecer apoio jurídico e educacional para autocultivadores de cannabis. O foco principal é o Módulo Jurídico, que oferece ferramentas para proteção legal e acesso a informações jurídicas relevantes.

## Estrutura do Projeto

```
cannabis-app/
├── config/             # Configurações da aplicação
├── controllers/        # Controladores para lógica de negócios
├── models/             # Modelos de dados
├── public/             # Arquivos estáticos (CSS, JS, imagens)
│   ├── css/            # Folhas de estilo
│   ├── js/             # Scripts JavaScript
│   ├── images/         # Imagens
│   ├── docs/           # Documentos gerados
│   ├── uploads/        # Uploads de usuários
│   └── qrcodes/        # QR Codes gerados
├── routes/             # Rotas da aplicação
├── utils/              # Utilitários e helpers
├── views/              # Templates EJS
│   ├── components/     # Componentes reutilizáveis
│   ├── juridico/       # Views do módulo jurídico
│   └── partials/       # Partes reutilizáveis (header, footer)
├── tests/              # Testes da aplicação
├── index.js            # Ponto de entrada da aplicação
└── server.js           # Configuração do servidor
```

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript, EJS (templates)
- **Bibliotecas**: 
  - PDFKit (geração de PDF)
  - QRCode (geração de QR Codes)
  - Multer (upload de arquivos)
  - Mongoose (modelagem de dados)
  - Express-session (gerenciamento de sessões)
  - Body-parser (parsing de requisições)
  - CORS (Cross-Origin Resource Sharing)

## Módulo Jurídico

O Módulo Jurídico é o foco principal desta aplicação e consiste em três funcionalidades principais:

### 1. Gerador de Habeas Corpus Preventivo

Permite aos usuários gerar um Habeas Corpus Preventivo personalizado com base em informações fornecidas através de um formulário guiado.

**Funcionalidades:**
- Formulário guiado com validações
- Integração de fundamentos jurídicos
- Campos personalizáveis
- Geração de PDF personalizado

**Arquivos principais:**
- `views/juridico/habeas-corpus-form.ejs`: Formulário de entrada
- `views/juridico/habeas-corpus-success.ejs`: Página de sucesso
- `controllers/juridicoController.js`: Lógica de controle
- `utils/pdfGenerator.js`: Geração de PDF

### 2. Central de Documentos

Fornece acesso a modelos de documentos importantes, sistema de upload seguro e geração de QR Codes para processos.

**Funcionalidades:**
- Modelos de documentos (Termo de Responsabilidade, Declaração de Uso Pessoal, Plano de Cultivo, Anexos Jurídicos)
- Sistema de upload seguro para documentos pessoais
- Geração de QR Code para processos

**Arquivos principais:**
- `views/juridico/documentos.ejs`: Página principal da central
- `views/juridico/documento-template.ejs`: Template para documentos
- `views/juridico/documento-success.ejs`: Página de sucesso
- `views/juridico/qrcode.ejs`: Página de QR Code
- `utils/documentTemplates.js`: Templates de documentos
- `utils/uploadHandler.js`: Gerenciamento de uploads

### 3. Base de Jurisprudência Interativa

Permite consultar decisões judiciais relacionadas ao autocultivo de cannabis por estado, quantidade de plantas, tipo de uso e resultado.

**Funcionalidades:**
- Banco de dados com decisões judiciais de diferentes estados
- Sistema de filtros por estado, quantidade de plantas, tipo de uso e resultado
- Visualização detalhada de casos reais (anonimizados)
- Estatísticas de deferimento por estado e tipo de uso

**Arquivos principais:**
- `views/juridico/jurisprudencia.ejs`: Página principal da jurisprudência
- `views/juridico/jurisprudencia-detalhes.ejs`: Detalhes de jurisprudência
- `utils/jurisprudenciaData.js`: Dados de jurisprudência
- `public/js/jurisprudencia.js`: Lógica de filtro e exibição

## Integração dos Componentes

A integração dos componentes do módulo jurídico foi implementada para garantir uma navegação fluida entre as funcionalidades:

- **Página inicial unificada**: Apresenta cards de navegação para as três funcionalidades principais, estatísticas de jurisprudência e fluxo de trabalho recomendado.
- **Navegação melhorada**: Inclui breadcrumbs e componente de "Funcionalidades Relacionadas" em cada página.
- **Consistência visual**: Estilos CSS específicos para integração, aparência padronizada e interface responsiva.

**Arquivos principais:**
- `views/juridico/index.ejs`: Página inicial do módulo jurídico
- `views/components/breadcrumbs.ejs`: Componente de breadcrumbs
- `views/components/related-nav.ejs`: Componente de navegação relacionada
- `public/css/integration.css`: Estilos CSS para integração

## Como Executar a Aplicação

1. Certifique-se de ter o Node.js instalado (versão 14 ou superior)
2. Clone o repositório
3. Instale as dependências:
   ```
   npm install
   ```
4. Inicie o servidor:
   ```
   npm start
   ```
5. Acesse a aplicação em `http://localhost:3000`

## Testes

Os testes da aplicação estão localizados no diretório `tests/` e podem ser executados com o comando:

```
node tests/testes-modulo-juridico.js
```

Os testes verificam:
- Navegação entre páginas
- Funcionamento do gerador de Habeas Corpus
- Funcionalidades da central de documentos
- Filtros da base de jurisprudência
- Responsividade em diferentes tamanhos de tela

## Considerações de Segurança

- Os documentos gerados são armazenados localmente no diretório `public/docs/`
- Os uploads de usuários são armazenados no diretório `public/uploads/`
- Os QR Codes gerados são armazenados no diretório `public/qrcodes/`
- Em um ambiente de produção, recomenda-se implementar autenticação de usuários e criptografia de dados sensíveis

## Próximos Passos e Melhorias Futuras

- Implementação de autenticação de usuários
- Integração com banco de dados para persistência de dados
- Implementação dos módulos adicionais (Cultivo, Medicinal, Comunidade, Educacional)
- Melhorias na interface de usuário e experiência do usuário
- Implementação de notificações e alertas
- Integração com APIs externas para informações jurídicas atualizadas

# Atualização do README do Projeto

## Integração com a API do DataJud

Foi adicionada uma nova funcionalidade ao módulo jurídico que permite a busca de jurisprudências na API do DataJud do Conselho Nacional de Justiça (CNJ). Esta integração complementa a base de dados local existente, proporcionando aos usuários acesso a um conjunto muito mais amplo de decisões judiciais relacionadas ao autocultivo de cannabis.

### Principais recursos adicionados:

- Busca combinada em múltiplas fontes (base local e DataJud)
- Seleção de fonte de dados na interface do usuário
- Campo de termo de busca específico para o DataJud
- Paginação para navegação entre resultados do DataJud
- Identificação visual da origem de cada resultado
- Acesso direto ao inteiro teor dos documentos quando disponível

Para mais detalhes sobre a implementação, consulte a [documentação completa da integração com o DataJud](./DOCUMENTACAO_DATAJUD.md).
