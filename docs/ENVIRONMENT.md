# Luna â€” Ambiente

## Atual

VS Code local, sem o Codespace anterior.

O histÃ³rico indica Windows.
Confirmar o terminal efetivo antes de fornecer comandos:
PowerShell, Git Bash, WSL ou Dev Container local.

NÃ£o usar caminhos /workspaces/luna-app como se ainda existissem.
Preferir comandos relativos Ã  raiz local do repositÃ³rio.

## Ferramentas

Java 25, Maven Wrapper, Node compatÃ­vel com o Vite instalado
e Docker para PostgreSQL de desenvolvimento.

Proxy CodeMie e Continue precisam executar em ambientes
com conectividade real entre si.

localhost no Windows, WSL, container e Codespace sÃ£o distintos.

## IntegraÃ§Ã£o anterior

Continue 2.0.0 em ambiente remoto mostrou:
- Leitura de arquivos funcional.
- Comandos inseridos, sem submissÃ£o comprovada.
- AusÃªncia de stdout, stderr e cÃ³digo de retorno.
- Aviso de comando registrado duas vezes.

NÃ£o assumir que a limitaÃ§Ã£o continua ou foi corrigida localmente.
Revalidar ferramentas em testes pequenos e autorizados.

## Testes mÃ­nimos de agente

1. Chat simples.
2. Ler um arquivo.
3. Executar comando simples e capturar saÃ­da.
4. Capturar retorno nÃ£o zero de comando controlado.
5. Criar arquivo pequeno autorizado.
6. Revisar diff.

Status da ferramenta nÃ£o substitui resultado observado.

## HistÃ³rico de container

Tag genÃ©rica base:ubuntu resolveu para uma distribuiÃ§Ã£o
incompatÃ­vel com a Feature Docker/Moby.

Foi proposta base:
mcr.microsoft.com/devcontainers/base:1-ubuntu-24.04

Verificar configuraÃ§Ã£o existente antes de reutilizÃ¡-la.
NÃ£o reconstruir ambiente sem necessidade.