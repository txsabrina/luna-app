# Luna â€” Rodar e verificar localmente

Execute a partir da pasta local do repositÃ³rio.

## PrÃ©-requisitos

Confirmar:
java -version
node --version
npm --version
docker info

Maven Wrapper deve usar o JDK configurado para o projeto.

Instalar frontend conforme o estado do lockfile.
Em clone com package-lock.json consistente:
npm ci

NÃ£o usar --force ou --legacy-peer-deps para esconder conflitos.

## PowerShell â€” backend

Terminal separado:
cd backend
.\mvnw.cmd quarkus:dev

Docker precisa estar disponÃ­vel quando Dev Services criar PostgreSQL.

## PowerShell â€” frontend

Outro terminal:
cd frontend
npm run dev

Abrir o endereÃ§o informado pelo Vite.
Em ambiente local normal, costuma ser http://localhost:5173.

## ValidaÃ§Ã£o

Backend:
.\mvnw.cmd verify

Frontend:
npm run lint
npm run build

Consultar scripts disponÃ­veis:
npm pkg get scripts

Se test:run existir:
npm run test:run

NÃ£o afirmar que testes foram executados apenas porque build passou.

## Bash / WSL

Wrapper:
./mvnw quarkus:dev
./mvnw verify

Executar no ambiente real do projeto.
NÃ£o misturar caminhos ou executÃ¡veis de Windows e Linux.

## Erros

NÃ£o regenerar o projeto para corrigir dependÃªncia ausente.
NÃ£o apagar testes para fazer TypeScript passar.
Guardar saÃ­da e cÃ³digo de retorno.