# Estágio 1: Instalação de dependências
FROM node:20-slim AS deps
WORKDIR /app

# Copia os arquivos de manifesto de pacotes
COPY package.json ./
# O package-lock.json é recomendado para builds consistentes
COPY package-lock.json* ./

# Instala as dependências
RUN npm install

# Estágio 2: Build da aplicação
FROM node:20-slim AS builder
WORKDIR /app

# Copia as dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
# Copia o restante do código da aplicação
COPY . .

# Constrói a aplicação Next.js para produção
RUN npm run build

# Estágio 3: Imagem final de produção
FROM node:20-slim AS runner
WORKDIR /app

# Define o ambiente para produção
ENV NODE_ENV=production

# Copia os arquivos da aplicação construída do estágio 'builder'
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# O servidor será executado na porta 3000 por padrão.
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
