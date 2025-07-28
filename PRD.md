PRD — Plataforma de Gerenciamento de Scripts para Go High Level
🧾 Sumário Executivo
Esta aplicação tem como objetivo permitir que uma agência que utiliza o Go High Level (GHL) gerencie, distribua e monetize scripts personalizados que interagem com o front-end e back-end da plataforma GHL. A solução será construída com Firebase Studio e utilizará IA para facilitar a criação dos scripts, além de um sistema de autorização baseado em subcontas.

🎯 Objetivos
Automatizar a injeção e execução de scripts nas contas/subcontas do GHL.

Controlar o acesso aos scripts com base na autorização de subcontas.

Permitir que a agência venda funcionalidades de forma separada.

Utilizar IA para geração automatizada de scripts com base em comandos em linguagem natural.

Oferecer uma interface amigável de gerenciamento para o superadministrador e agências.

👥 Usuários e Perfis
Tipo de Usuário	Permissões Principais
Superadministrador	Gerenciar scripts, autorizações, usar IA para criação, ver logs, controlar tudo
Administrador de Agência	Adicionar subcontas, atribuir scripts, verificar logs
Subconta Autorizada	Executar scripts permitidos, sem acesso ao painel de controle
Subconta Não Autorizada	Sem permissão para execução dos scripts; recebe erro ou é ignorada

🔧 Funcionalidades
1. Injeção Automática de Script
Script global é injetado automaticamente via conta principal da agência no GHL.

Executado em todas as subcontas, mas só efetua ações se a subconta for autorizada.

2. Validação e Autorização
Ao ser executado, o script envia o ID da subconta à aplicação via HTTP Request.

A aplicação verifica, no banco de dados, se a subconta está autorizada e quais scripts ela pode usar.

Se autorizado: o script prossegue.

Se não autorizado: exibe aviso ou não executa.

3. Painel de Gerenciamento
CRUD de scripts e funcionalidades.

Vinculação de scripts a subcontas específicas.

Visualização de logs de execução e erros.

Autorizações automáticas via integração com Stripe ou Mercado Pago.

Interface adaptada para o superadmin com funções exclusivas.

4. Criação de Scripts com IA (Somente Superadmin)
Leitura do DOM da página do GHL.

Leitura de logs do backend (se possível via console ou fetch intercept).

Comando em linguagem natural do tipo: “Crie um botão que copia o telefone do lead para a área de transferência.”

Geração automática de script com IA (via Gemini / GenKit).

Teste do script antes da publicação.

Armazenamento do script com metadados (descrição, tags, versão, autor).

5. Monetização
Scripts são agrupados em “funcionalidades vendáveis”.

Painel de controle permite vincular funções específicas a subcontas específicas.

Integração com gateways de pagamento (Stripe / Mercado Pago) adiciona autorização automaticamente.

🧠 Tecnologias
Componente	Tecnologia
Backend e Banco de Dados	Firebase (Firestore, Functions)
Frontend	Firebase Studio
Autenticação	Firebase Auth + JWT
IA para geração de scripts	Gemini ou GenKit
API externa	Go High Level API
Injeção de Scripts	Script JS inserido na conta principal da agência
Pagamentos	Stripe / Mercado Pago

🔐 Segurança
Tokens únicos por subconta.

Verificação de ID e permissão em tempo real.

Restrições por CORS.

Logs criptografados no Firestore.

📊 Métricas de Sucesso
% de scripts executados com sucesso.

Tempo médio de criação de scripts com IA.

Subcontas ativas vs. autorizadas.

Receita por funcionalidade vendida.

Erros de execução ou rejeições por autorização.

🧪 MVP: Funcionalidades para Primeira Versão
Injeção e execução de script com verificação de autorização.

Painel de gerenciamento básico (CRUD de scripts e subcontas).

IA básica para geração de scripts com DOM simples.

Integração com Stripe para liberar acesso.

🔜 Próximas Etapas
Definir estrutura do Firestore (coleções: scripts, subcontas, autorizacoes, logs, funcoes).

Criar script global inicial para testes de injeção e comunicação.

Validar documentação da API do GHL para injeção automática e obtenção do ID da subconta.

Prototipar painel no Firebase Studio.

Implementar primeira função IA com prompt básico.
