# Luna — Instruções do agente

Leia explicitamente:
- docs/PROJECT_CONTEXT.md
- docs/EXPERIENCE_REQUIREMENTS.md
- docs/PROJECT_STATUS.md
- docs/adr/0001-architecture.md

docs/ e .local-context/ devem permanecer locais, fora do repositório.
Não adicionar essas pastas ao Git, mesmo com opções que ignorem o .gitignore.
Leia os documentos de docs/ explicitamente; a indexação automática pode não incluí-los.
Se os documentos estiverem ausentes ou inacessíveis, solicite contexto.
Não reconstrua as decisões por suposição.

Ambiente atual: VS Code local no Windows; o Codespace anterior está indisponível.
O prompt registrado utiliza PowerShell. Confirme o shell efetivo antes de
fornecer comandos e não assuma caminhos ou ferramentas do Codespace.

Inspecione o workspace antes de agir.
Exemplos do histórico não comprovam arquivos existentes.
Trabalhe em incrementos pequenos e testáveis.

Não sobrescreva trabalho, leia arquivos pessoais externos,
faça deploy, commit ou push sem autorização.
Não inclua credenciais nem exportações pessoais no Git.
Não declare testes aprovados sem executá-los.
Não anuncie conteúdo planejado como pronto.

Antes de ampliar currículo, aprovar uma aula de referência.
Atualize PROJECT_STATUS.md com resultados reais.

A leitura automática deste arquivo depende do cliente.
Anexá-lo explicitamente quando necessário.

## Limitação histórica do terminal remoto

No Codespace anterior, a ferramenta inseria comandos sem submissão comprovada
e não fornecia saída nem código de retorno. A integração local ainda precisa
ser validada; não assumir que a limitação foi corrigida.

Não declarar execução concluída ou testes aprovados com base
no status da ferramenta.

Enquanto a execução com saída e retorno não for validada, apresentar comandos para execução
manual pela desenvolvedora e analisar os resultados fornecidos.


## Skill de engenharia de produto

Antes de planejar ou implementar funcionalidades do Luna, leia:
docs/skills/ai-product-engineering.md

Aplique seus princípios ao escopo autorizado.
Se o arquivo não estiver acessível, informe.
Não considere exemplos ou roadmap como autorização para implementar tudo.