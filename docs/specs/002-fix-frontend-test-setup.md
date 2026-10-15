# Especificação 002 — Testes frontend

## Evidência histórica

Build falhou com TS2307 em learning.test.tsx:
vitest, @testing-library/react e @testing-library/user-event.

Não foi confirmado se dependências faltavam no manifest
ou apenas na instalação local.

## Objetivo

Completar configuração sem apagar ou excluir testes para esconder erros.

## Inspeção

package.json, lockfile, Vite, TypeScript,
arquivos de testes e setup existentes.

## Escopo

Dependências de desenvolvimento compatíveis.
Vitest e ambiente jsdom quando necessário.
Scripts test e test:run.
Limpeza/setup adequado.
Workflow com execução única de testes após validação.

## Restrições

Não usar --force ou --legacy-peer-deps.
Não introduzir any ou ignorar TypeScript como atalho.
Não editar lockfile manualmente.
Não alterar backend ou proxy para esse erro.

## Validação

npm run lint
npm run build
npm run test:run

Se dependências já estão declaradas e lockfile consistente,
verificar instalação antes de alterar versões.

Não presumir correção no clone local.
Build não substitui execução de testes.

## Aceitação

Dependências resolvidas sem conflitos ignorados.
Testes executados, não desabilitados.
Scripts e CI consistentes.
Resultados observados registrados.