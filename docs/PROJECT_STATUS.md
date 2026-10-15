# Luna — Estado reconstruído

## Confirmado pela desenvolvedora

- Repositório: https://github.com/txsabrina/luna-app
- Bootstrap executado no Codespace.
- Aplicativo chegou a rodar.
- Identidade Luna e Lume aprovada.
- Codespace anterior não está mais disponível.
- Ambiente atual: VS Code local.
- docs passará a ser versionada.

## Evidências históricas

Foram mostrados:
- Componente LumeGuide usando /assets/lume.png.
- Arquivo src/features/learning/learning.test.tsx.
- Falha de build TS2307 para vitest, Testing Library React e user-event.
- Ferramenta de terminal remoto inserindo comandos sem submetê-los
  e sem retornar saída/código de execução.

Isso não confirma que os problemas foram corrigidos.
Não assumir que o clone local contém todas as alterações do Codespace.

## Não confirmado

- Branch e commit atuais.
- Conteúdo efetivamente recuperado no clone local.
- Extensão das funcionalidades de aula implementadas.
- Resultado atual de lint, build e testes.
- Configuração atual de Vitest.
- Persistência, autenticação ou recompensas.
- Estado atual de proxy e ferramentas locais.
- Assets presentes.
- Deploy.

## Próxima ação

Inspecionar:
- git status e histórico.
- backend/pom.xml.
- frontend/package.json e package-lock.json.
- Arquivos de aula e testes.
- Assets e configurações.

Executar verificações autorizadas e registrar resultados reais.

## Próxima fatia planejada

Tarô → Cartas e fundamentos → Arcanos Maiores → O Louco.

Primeiro incremento: etapas 01–04.
Ver specs/001-fool-lesson.md.

Não recriar código sem inspecionar o que existe.

## Auditoria da spec 001 — leitura do workspace

- Data e branch: não verificadas por terminal nesta auditoria.
- Escopo: inspeção estática de docs/specs/001-fool-lesson.md, conteúdo JSON, player, navegação, avaliação backend, componentes de imagem e arquivos de testes.
- Resultado: as etapas 01–04 existem no conteúdo, com status PREVIEW. Há implementação de observação livre, seleção e confirmação separadas, avaliação stateless no backend, feedback por alternativa e final exclusivo da prévia.
- A aula de 20 etapas não está entregue no conteúdo inspecionado. As etapas 05–20 pertencem ao roteiro posterior; o escopo inicial autorizado é 01–04.
- Pendência confirmada: o conteúdo solicita /assets/tarot/waite-smith/fool.jpg, mas o diretório contém fool.png. CardViewer possui fallback; origem, edição e licença da reprodução continuam pendentes no texto editorial.
- Existem testes frontend e backend, mas nenhum comando foi executado nesta auditoria. Lint, build, testes, navegação real e acessibilidade no dispositivo continuam sem validação de execução.
- Não é possível declarar o incremento inicial completamente aceito sem resultados reais dos testes e revisão da desenvolvedora.
- Arquivo alterado nesta auditoria: somente docs/PROJECT_STATUS.md. Sem commit, push ou deploy.
- Próxima tarefa: obter resultados de testes/build/lint e revisar a prévia no navegador, antes de ampliar o currículo.

## Leitura integral e correção dos caracteres em docs/

- Escopo autorizado: leitura de toda a pasta docs/ e correção de caracteres corrompidos, sem mudanças na aplicação.
- Os 13 arquivos Markdown encontrados em docs/ foram lidos integralmente e relidos após as correções. Na revisão textual, não foram observadas as sequências corrompidas anteriormente presentes; acentos, aspas, travessões e setas aparecem legíveis.
- Arquivos corrigidos: AGENT_WORKFLOW.md, BOOTSTRAP.md, ENVIRONMENT.md, EXPERIENCE_REQUIREMENTS.md, PROJECT_CONTEXT.md, PROJECT_STATUS.md, README.md, RESTORATION_NOTES.md, references/README.md, adr/0001-architecture.md, specs/001-fool-lesson.md, specs/002-fix-frontend-test-setup.md e skills/ai-product-engineering.md.
- Decisões, comandos, caminhos e o registro da auditoria anterior foram preservados. Não houve alteração de código, assets ou dependências.
- Skill condensada encontrada e lida: docs/skills/ai-product-engineering.md. O caminho docs/skills/ai-product-engineering/SKILL.md indicado em AGENTS.md permanece ausente.
- A divergência de ambiente entre AGENTS.md e ENVIRONMENT.md foi preservada; não foi resolvida por suposição.
- Validação: leitura direta dos arquivos pela ferramenta. Nenhum comando de terminal, teste, build ou lint foi executado. Data e branch não verificadas. Sem commit, push ou deploy.

## Registro de entregas

Preencher após cada trabalho:
- Data e branch.
- Arquivos alterados.
- Comandos realmente executados.
- Resultados.
- Pendências.
- Próxima tarefa.

Documentação reconstruída não recupera edições desconhecidas
do agente nem testes que não foram apresentados.