# Usando a imagem oficial do Node.js
FROM node:18 AS builder

WORKDIR /app

# Copia os arquivos do projeto
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Compila o projeto Next.js
RUN npm run build

# Segunda fase para servir o app
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "run", "start"]
