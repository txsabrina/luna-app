# Luna — Ambiente

## Atual

VS Code local, sem o Codespace anterior.

O histórico indica Windows.
Confirmar o terminal efetivo antes de fornecer comandos:
PowerShell, Git Bash, WSL ou Dev Container local.

Não usar caminhos /workspaces/luna-app como se ainda existissem.
Preferir comandos relativos à raiz local do repositório.

## Ferramentas

Java 25, Maven Wrapper, Node compatível com o Vite instalado
e Docker para PostgreSQL de desenvolvimento.

Proxy CodeMie e Continue precisam executar em ambientes
com conectividade real entre si.

localhost no Windows, WSL, container e Codespace são distintos.

## Integração anterior

Continue 2.0.0 em ambiente remoto mostrou:
- Leitura de arquivos funcional.
- Comandos inseridos, sem submissão comprovada.
- Ausência de stdout, stderr e código de retorno.
- Aviso de comando registrado duas vezes.

Não assumir que a limitação continua ou foi corrigida localmente.
Revalidar ferramentas em testes pequenos e autorizados.

## Testes mínimos de agente

1. Chat simples.
2. Ler um arquivo.
3. Executar comando simples e capturar saída.
4. Capturar retorno não zero de comando controlado.
5. Criar arquivo pequeno autorizado.
6. Revisar diff.

Status da ferramenta não substitui resultado observado.

## Histórico de container

Tag genérica base:ubuntu resolveu para uma distribuição
incompatível com a Feature Docker/Moby.

Foi proposta base:
mcr.microsoft.com/devcontainers/base:1-ubuntu-24.04

Verificar configuração existente antes de reutilizá-la.
Não reconstruir ambiente sem necessidade.