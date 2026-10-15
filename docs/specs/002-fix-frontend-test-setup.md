# EspecificaÃ§Ã£o 002 â€” Testes frontend

## EvidÃªncia histÃ³rica

Build falhou com TS2307 em learning.test.tsx:
vitest, @testing-library/react e @testing-library/user-event.

NÃ£o foi confirmado se dependÃªncias faltavam no manifest
ou apenas na instalaÃ§Ã£o local.

## Objetivo

Completar configuraÃ§Ã£o sem apagar ou excluir testes para esconder erros.

## InspeÃ§Ã£o

package.json, lockfile, Vite, TypeScript,
arquivos de testes e setup existentes.

## Escopo

DependÃªncias de desenvolvimento compatÃ­veis.
Vitest e ambiente jsdom quando necessÃ¡rio.
Scripts test e test:run.
Limpeza/setup adequado.
Workflow com execuÃ§Ã£o Ãºnica de testes apÃ³s validaÃ§Ã£o.

## RestriÃ§Ãµes

NÃ£o usar --force ou --legacy-peer-deps.
NÃ£o introduzir any ou ignorar TypeScript como atalho.
NÃ£o editar lockfile manualmente.
NÃ£o alterar backend ou proxy para esse erro.

## ValidaÃ§Ã£o

npm run lint
npm run build
npm run test:run

Se dependÃªncias jÃ¡ estÃ£o declaradas e lockfile consistente,
verificar instalaÃ§Ã£o antes de alterar versÃµes.

NÃ£o presumir correÃ§Ã£o no clone local.
Build nÃ£o substitui execuÃ§Ã£o de testes.

## AceitaÃ§Ã£o

DependÃªncias resolvidas sem conflitos ignorados.
Testes executados, nÃ£o desabilitados.
Scripts e CI consistentes.
Resultados observados registrados.