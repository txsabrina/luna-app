# ADR 0001 â€” Arquitetura inicial

Status: direÃ§Ã£o aprovada; configuraÃ§Ã£o efetiva deve ser inspecionada.

## DecisÃ£o

Monorepo:
- backend
- frontend
- content
- infra
- docs
- skills, quando aplicÃ¡vel

MonÃ³lito modular por funcionalidade.
Separar domÃ­nio, aplicaÃ§Ã£o e infraestrutura conforme necessidade.

## Stack

Java 25, Quarkus, Maven Wrapper.
React, TypeScript e Vite.
PostgreSQL, Hibernate ORM e Flyway.
OpenAPI, validaÃ§Ã£o e health checks.

Bootstrap proposto utilizou Quarkus 3.33.3.
NÃ£o significa patch mais recente.
Revisar seguranÃ§a e compatibilidade antes de publicar.

## Regras

DTOs prÃ³prios, injeÃ§Ã£o por construtor e transaÃ§Ãµes nos casos de uso.
Interfaces nos limites reais, nÃ£o para toda classe.
ConteÃºdo separado dos componentes e da avaliaÃ§Ã£o.
Contratos e conteÃºdo versionados.
Tentativas e recompensas idempotentes.
NÃ£o aceitar XP arbitrÃ¡rio do cliente.

Evitar microsserviÃ§os, event sourcing e abstraÃ§Ãµes prematuras.

## ManutenÃ§Ã£o

Nomes claros, funÃ§Ãµes focadas, tipos explÃ­citos e fluxo previsÃ­vel.
ComentÃ¡rios devem explicar decisÃµes.
Extrair responsabilidades, nÃ£o criar camadas por estÃ©tica.

Versionar lockfiles e wrappers.
NÃ£o editar package-lock.json manualmente.

## IA

Desenvolver com IA nÃ£o exige LLM no produto.
ComeÃ§ar com conteÃºdo editorial versionado.
Tutor generativo sÃ³ com caso de uso, avaliaÃ§Ãµes, privacidade e limites.