# Luna — Rodar e verificar localmente

Execute a partir da pasta local do repositório.

## Pré-requisitos

Confirmar:
java -version
node --version
npm --version
docker info

Maven Wrapper deve usar o JDK configurado para o projeto.

Instalar frontend conforme o estado do lockfile.
Em clone com package-lock.json consistente:
npm ci

Não usar --force ou --legacy-peer-deps para esconder conflitos.

## PowerShell — backend

Terminal separado:
cd backend
.\mvnw.cmd quarkus:dev

Docker precisa estar disponível quando Dev Services criar PostgreSQL.

## PowerShell — frontend

Outro terminal:
cd frontend
npm run dev

Abrir o endereço informado pelo Vite.
Em ambiente local normal, costuma ser http://localhost:5173.

## Validação

Backend:
.\mvnw.cmd verify

Frontend:
npm run lint
npm run build

Consultar scripts disponíveis:
npm pkg get scripts

Se test:run existir:
npm run test:run

Não afirmar que testes foram executados apenas porque build passou.

## Bash / WSL

Wrapper:
./mvnw quarkus:dev
./mvnw verify

Executar no ambiente real do projeto.
Não misturar caminhos ou executáveis de Windows e Linux.

## Erros

Não regenerar o projeto para corrigir dependência ausente.
Não apagar testes para fazer TypeScript passar.
Guardar saída e código de retorno.