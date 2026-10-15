# Especificação 001 — O Louco: o primeiro passo

Status: reconstrução do planejamento.
Não implica implementação ou aprovação de novos incrementos.

## Hierarquia

Trilha: tarot
Curso: tarot-cards-foundations
Módulo: major-arcana
Aula: fool-first-step
Versão de conteúdo proposta: 1

Identificadores estáveis, não índices de array.

## Objetivos

Reconhecer abertura, começo e espontaneidade.
Relacionar imagem e interpretação.
Distinguir observação de associação.
Ler com contexto.
Entender inversões como opcionais.

## Primeiro incremento

Escopo planejado: etapas 01–04.
Inspecionar código existente antes de implementar ou recriar.

Não implementar ainda:
XP, recompensa persistida, login fictício,
progresso global compartilhado ou demais cartas.

Exibir prévia, não aula completa disponível.

## Roteiro

### Caminho A — Conhecer

01 — Abertura, explanation.
Lume:
“Você precisa conhecer o caminho inteiro para dar o primeiro passo?
O Louco mora nessa pergunta. Mas calma: ele não veio mandar você
se jogar de um penhasco.”
CTA: Vamos investigar.

02 — Observação livre, observation.
Carta ampliável.
Escolhas: cachorro, penhasco, flor, bagagem, outro detalhe.
Sem resposta correta ou XP.

Feedback:
Cachorro: acompanha a figura perto dos pés.
Penhasco: existe uma borda no caminho.
Flor: a figura carrega uma flor branca.
Bagagem: a trouxa é pequena.
Outro: a observação da estudante também importa.

Continuar após escolha.
Não confundir observação com avaliação.

03 — Núcleo, explanation.
Abertura, começo e espontaneidade.
“Experimentar sem exigir domínio antes da primeira tentativa.”
Não significa abandonar planejamento.
Explorar disponibilidade para começar e atenção ao terreno.

04 — Cenário, single-choice.
Pessoa quer aprender desenho, mas espera ter habilidade antes de tentar.

A: Reunir mais referências antes de qualquer tentativa.
Feedback: preparação ajuda, mas pode prolongar a espera neste cenário.

B: Experimentar um desenho simples e observar o que aprende.
Esperada.
Feedback: abertura em forma concreta, sem exigir domínio antecipado.

C: Definir rotina rigorosa antes de permitir improvisação.
Feedback: prioriza estrutura, não disponibilidade para experimentar.

D: Esperar sentir confiança completa.
Feedback: confiança absoluta pode manter o primeiro passo suspenso.

Seleção e confirmação separadas.
Feedback da escolha e identificação textual da esperada.
Permitir retomada após erro sem bloqueio indefinido.

05 — Palavras, multiple-choice.
Abertura, consolidação, começo, espontaneidade, rigidez.
Esperadas: abertura, começo e espontaneidade.
Explicar o contraste sem universalizar significados.

06 — Pausa, checkpoint.
Resumo e botões continuar/voltar ao mapa.
Não prometer retomada persistente antes de implementá-la.

### Caminho B — Investigar

07 — Symbol-explorer.
Penhasco, cachorro e olhar.
Separar observação literal e interpretação possível.
Oferecer lista acessível além dos hotspots.

08 — Matching.
Relacionar os elementos às leituras apresentadas nesta aula.
Toque e teclado; arrastar não obrigatório.
Não apresentar associação como significado exclusivo.

09 — Symbol-explorer.
Rosa: possibilidade de inocência.
Trouxa: recursos/experiências.
Sol: luz/vitalidade.
Montanhas: distância/desafios.
Cada item inclui também observação literal.

10 — Classification.
“Há cachorro junto à figura” → observação.
“Cachorro pode sugerir alerta” → interpretação.
“Figura carrega flor branca” → observação.
“Flor pode evocar inocência” → interpretação.

11 — Cores e zero, explanation.
Amarelo no fundo, branco em detalhes, número zero.
Associações contextualizadas, não dicionário universal.
Zero como potencial é leitura simbólica, não prova matemática.

12 — Recuperação visual.
Construir uma interpretação de abertura e percepção do terreno
usando movimento e borda.
Distratores devem ser elementos plausíveis da própria imagem,
não alternativas obviamente absurdas.
Evitar afirmar associação exclusiva.

### Caminho C — Interpretar

13 — Comparison.
Pequeno experimento criativo versus muitos projetos sem continuidade.
Mesma abertura pode ter expressões diferentes.

14 — Single-choice.
Cenário de projetos demais.
Investigar foco e continuidade sem aconselhamento prescritivo.
Distratores plausíveis e feedback por opção.

15 — Inversões, explanation.
Carta virável por botão acessível.
Uso opcional.
Bloqueio/excesso/interiorização como abordagem, não regra universal.

16 — Nuance, single-choice.
Esperada: método e contexto orientam a inversão.
Distratores:
oposto obrigatório, ausência de mudança,
posição normal elimina dificuldades.
Feedback por alternativa.

17 — Reflection.
“Vejo __ e __. Neste contexto penso em __.
Outra possibilidade seria __.”
Nota opcional, sem correção automática.
Não enviar ao servidor por padrão.
Evitar dados sensíveis.

### Caminho D — Guardar

18 — Review-group.
Recuperação de símbolo e aplicação em novo cenário.
Não repetir os mesmos enunciados.

19 — Summary.
Núcleo, tensão, pistas, pergunta útil e referências.
Mostrar nota apenas se armazenamento existir.

20 — Completion.
Colecionável original: Primeiro Passo.
Lume:
“Você não guardou só palavras: construiu conexões.”
Revelação breve e alternativa sem animação.
Recompensa fixa e idempotente quando persistência existir.

## Contrato inicial

Tipos:
explanation, observation, single-choice.

Base:
id, type, title, lume(mood,message).

Aula:
id, contentVersion, title, status, objectives, steps.

Não incluir resposta correta no payload público.

API sugerida:
GET /api/v1/courses/{courseId}
GET /api/v1/modules/{moduleId}
GET /api/v1/lessons/{lessonId}
POST /api/v1/lessons/{lessonId}/steps/{stepId}/evaluate

Avaliação:
request: contentVersion, selectedOptionId.
response: correct, selectedOptionFeedback,
expectedOptionId, explanation.

Primeiro incremento pode avaliar stateless.
Não simular identidade ou tentativa persistida.

Validar aula, etapa, versão e alternativa.
Erros consistentes, sem stack trace ao cliente.

## Organização

Conteúdo separado da apresentação e da avaliação.
Proposta:
backend/src/main/resources/content/tarot/fool-first-step.v1.json

Componentes:
LessonPlayer, LumeGuide, CardViewer, ExplanationStep,
ObservationStep, SingleChoiceStep, LessonProgress, PreviewCompletion.

Inspecionar e adaptar estrutura existente.
Não duplicar fontes de verdade.

## Assets

Lume: /assets/lume.png.
Carta: /assets/tarot/waite-smith/fool.jpg.

Fallback explícito se ausentes.
Hotspots definidos sobre o asset real em incremento posterior.
Referências e condições de uso registradas.

## Acessibilidade

Mobile-first, sem overflow horizontal.
Toque, teclado, foco visível.
Resultado não depende só de cor.
Modal com foco controlado e Escape.
Movimento reduzido.
Loading, retry e seleção preservada em falha.
Prevenir confirmação duplicada.

## Testes

Backend:
conteúdo, avaliação por opção, alternativa inválida,
versão incompatível e ausência da chave de resposta no payload público.

Frontend:
loading/erro, observação livre, confirmação,
feedback, retry, navegação e final de prévia.

## Aceitação do incremento inicial

Navegação até O Louco.
Quatro etapas originais.
Quiz avaliado no backend.
Observação não classificada como erro.
Lume e carta ou fallback.
Feedback específico.
Prévia não conclui aula inteira.
Sem funcionalidades fictícias.
Resultados de testes registrados.

## Referências editoriais

Waite–Smith como imagem de estudo.
The Pictorial Key to the Tarot como apoio histórico.
Leituras didáticas modernas precisam de identificação.
Não atribuir toda associação ao texto de Waite sem conferir.

## Entrega

Antes de editar: arquivos envolvidos e conflitos.
Depois: alterações, assets pendentes, testes e resultados reais.
Sem commit/push não autorizado.