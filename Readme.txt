Objetivo
Desenvolver um sistema de CRUD de produtos com microserviços, onde cada cliente gerencia seus próprios produtos e o dono do sistema pode visualizar a quantidade total de clientes.

Arquitetura (Microserviços)
auth-service (Laravel): cadastro, login, JWT, refresh, logout e consulta de total de clientes (rota admin).

product-service (Laravel): CRUD de produtos (criar, listar, atualizar, deletar) com isolamento por cliente via token JWT.

Comunicação síncrona via HTTP/REST entre os serviços (validação de token).

Requisitos Técnicos
Item	Tecnologia
Backend	Laravel 13+ (PHP 8.2)
Banco	MySQL/PostgreSQL (um por serviço)
Testes	TDD (PHPUnit/Pest, cobertura ≥ 80%)
Documentação	OpenAPI/Swagger (gerada automaticamente)
Frontend	React 18 + TypeScript + TailwindCSS
Infra	Docker + Docker Compose
Endpoints Principais
Auth: /register, /login, /refresh, /logout, /users/count (admin)

Products: GET /, POST /, GET /{id}, PUT /{id}, DELETE /{id} (todos autenticados)

Entregáveis
Código fonte nos repositórios GitHub (monorepo ou separados).

Adicionar o avaliador como colaborador.

Execução com docker-compose up --build.

Documentação da API acessível via /api/docs.

Prazo: 28/06/2026 às 19h.

Avaliação final por Google Meet.

Regras
Proibido uso de IA para geração de código.

Desenvolvimento guiado por testes (TDD) obrigatório.

Código limpo, PSR-12, padrões de projeto.