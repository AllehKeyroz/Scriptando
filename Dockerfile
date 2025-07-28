# Estágio 1: Instalação de dependências
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
# Use 'ci' para instalações mais rápidas e determinísticas em ambientes de CI/CD
RUN npm install

# Estágio 2: Construção da aplicação
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Expõe o argumento GIT_SHA para o build
ARG GIT_SHA
ENV NEXT_PUBLIC_GIT_SHA=$GIT_SHA

# Roda o build da aplicação
RUN npm run build

# Estágio 3: Produção
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia os arquivos da aplicação construída do estágio 'builder'
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Define o usuário não-root para execução
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001
# USER nextjs

# Expõe a porta 3000
EXPOSE 3000

# Define a variável de ambiente para a porta
ENV PORT 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
