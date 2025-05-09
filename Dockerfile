# Use uma imagem oficial Node Alpine
FROM node:18-alpine

# Instale ferramentas de build para recompilar sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copia só package.json e package-lock.json
COPY package*.json ./

# Instala dependências e força recompilar nativos
RUN npm install --production --build-from-source \
  && npm cache clean --force

# Copia o restante do código
COPY . .

EXPOSE 3000

# Comando de inicialização
CMD ["node", "server.js"]
