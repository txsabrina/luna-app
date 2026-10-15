# ADR 0001 — Arquitetura inicial

Status: direção aprovada; configuração efetiva deve ser inspecionada.

## Decisão

Monorepo:
- backend
- frontend
- content
- infra
- docs
- skills, quando aplicável

Monólito modular por funcionalidade.
Separar domínio, aplicação e infraestrutura conforme necessidade.

## Stack

Java 25, Quarkus, Maven Wrapper.
React, TypeScript e Vite.
PostgreSQL, Hibernate ORM e Flyway.
OpenAPI, validação e health checks.

Bootstrap proposto utilizou Quarkus 3.33.3.
Não significa patch mais recente.
Revisar segurança e compatibilidade antes de publicar.

## Regras

DTOs próprios, injeção por construtor e transações nos casos de uso.
Interfaces nos limites reais, não para toda classe.
Conteúdo separado dos componentes e da avaliação.
Contratos e conteúdo versionados.
Tentativas e recompensas idempotentes.
Não aceitar XP arbitrário do cliente.

Evitar microsserviços, event sourcing e abstrações prematuras.

## Manutenção

Nomes claros, funções focadas, tipos explícitos e fluxo previsível.
Comentários devem explicar decisões.
Extrair responsabilidades, não criar camadas por estética.

Versionar lockfiles e wrappers.
Não editar package-lock.json manualmente.

## IA

Desenvolver com IA não exige LLM no produto.
Começar com conteúdo editorial versionado.
Tutor generativo só com caso de uso, avaliações, privacidade e limites.