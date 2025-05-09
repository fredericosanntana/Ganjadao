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