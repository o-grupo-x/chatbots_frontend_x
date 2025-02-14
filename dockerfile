# Etapa de build
FROM node:20-bullseye AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Adicionar variável de ambiente para evitar problemas de memória
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN npm install --legacy-peer-deps

COPY . .

# Compilar o Next.js
RUN npm run build

# Etapa final para rodar a aplicação
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "run", "start"]
