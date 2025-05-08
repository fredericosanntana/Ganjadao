# 1. Imagem base leve com Node.js
FROM node:18-alpine

# 2. Define diretório de trabalho
WORKDIR /app

# 3. Copia apenas package.json e package-lock.json para instalar dependências
COPY package*.json ./

# 4. Instala apenas dependências de produção
RUN npm install --production

# 5. Copia todo o código da aplicação
COPY . .

# 6. Expõe a porta que seu app usa (conforme seu código)
EXPOSE 3000

# 7. Comando para iniciar sua aplicação
CMD ["npm", "start"]
