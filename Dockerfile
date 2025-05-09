<<<<<<< HEAD
# Dockerfile (at project root)
FROM node:18-alpine

# Instala dependências para build de módulos nativos
RUN apk add --no-cache python3 make g++

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos de definição de dependências
COPY package.json package-lock.json ./

# Instala dependências de produção e força rebuild de nativos (sqlite3 etc.)
RUN npm ci --production --build-from-source && npm cache clean --force

# Copia todo o código (sem trazer node_modules do host)
COPY . .

# Expondo a porta do aplicativo
EXPOSE 3000

# Ponto de entrada
CMD ["node", "server.js"]
=======
FROM node:18-alpine

# Dependências de sistema
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Dependências de Node (package.json + lock)
COPY package*.json ./
RUN npm ci --production && npm cache clean --force

# Copia o código
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
>>>>>>> a62c95b (Switch to PostgreSQL and configure Portainer stack)
