# Luna — Contexto do produto

## Objetivo

Aplicativo pessoal em português brasileiro para estudar:
- Tarô Waite–Smith.
- Numerologia.
- Padrões e autoconhecimento.

Uso prioritário: iPhone.
Não inclui prestação de consultas nem ofertas e precificação.

Experiência desejada:
participação, estímulos ajustáveis, repetição variada e retomada.
Não apresentar essas escolhas como tratamento ou garantia para TDAH.

## Identidade

- Aplicativo: Luna.
- Personagem: Lume, bruxinha adulta e companheira de estudos.
- Frase: Conhecimento em fases. No seu ritmo.
- Linguagem próxima, despojada, culta e tecnicamente compreensível.
- Não infantilizar a estudante.

## Referências

- https://astratarot.net/pt/professions/tarot-reader
- https://astratarot.net/pt/products/tarot
- https://astratarot.net/pt/products/numerology
- https://astratarot.net/pt/products/psychology

Astra orienta abrangência e experiência.
Luna deve ter textos, atividades, personagens e assets originais.

A pesquisa anterior utilizou páginas públicas e prints de parte do demo.
Não houve acesso integral ao currículo pago.
Títulos e contagens devem ser revalidados antes de uso como inventário.

## Hierarquia aprovada

Trilha → Curso → Módulo → Aula → Etapa.

Uma carta é uma aula ou conjunto de aulas, não uma trilha principal.
Cada aula pode ter um caminho visual.
Conclusões avançam módulo, curso e trilha conforme regras explícitas.

## Currículo planejado

### Tarô — quatro cursos

1. Cartas e fundamentos.
2. Inversões.
3. Combinações.
4. Correspondências astrológicas.

Cobertura progressiva:
estrutura do baralho, arcanos maiores, menores e corte,
observação visual, símbolos, cores, números, contexto,
inversões opcionais, combinações e tiragens pessoais.

### Numerologia — seis cursos

1. História e fundamentos.
2. Números de 0 a 9.
3. Redução e conexões.
4. Letras e números.
5. Números superiores e mestres.
6. Palavras e nomes.

Identificar o sistema utilizado.
Não misturar silenciosamente valores ordinais, redução pitagórica
e gematria.

### Padrões e autoconhecimento — quatorze cursos planejados

1. Processamento automático.
2. Sinais corporais e emoções.
3. Narrativas internas.
4. Hábitos e evitação.
5. Vínculos e apego.
6. Gatilhos e conflito.
7. Identidade, trabalho e valores.
8. Sonhos, símbolos e interpretação.
9. Influência de experiências anteriores.
10. Experimentação de comportamentos.
11. Diálogo interno.
12. Relações e limites.
13. Experiências sob pressão.
14. Integração num mapa pessoal de padrões.

São objetivos editoriais, não cursos implementados.

## Rigor

Tarô e numerologia são tradições simbólicas:
não métodos comprovados de previsão ou determinação de personalidade.

Distinguir:
- Observação da imagem.
- Tradição histórica/esotérica identificada.
- Possibilidade interpretativa.

Não diagnosticar, oferecer terapia, inferir traumas pelas cartas
ou prometer reprogramação do subconsciente.

Inversões são opcionais.
Normal não equivale automaticamente a positivo.
Invertida não equivale automaticamente a negativo.

## Stack e arquitetura

Requisito principal: Java e Quarkus.
Frontend proposto: React, TypeScript e Vite.
Persistência: PostgreSQL, Hibernate ORM e Flyway.
Maven Wrapper, contratos OpenAPI, validação e health checks.

Direção inicial: Java 25 e Quarkus 3.x suportado.
As versões efetivas devem ser verificadas no projeto.
Não usar versões flutuantes em produção.

Monorepo e monólito modular por funcionalidade.
Código deve ser fácil de ler, manter e modificar.

## Privacidade

Não versionar credenciais, notas pessoais, logs sensíveis
ou histórico integral.

Não sincronizar reflexões sem escolha explícita.
Implementar exportação/importação antes de migrações de progresso.
Repositório privado não torna site publicado privado.

## Publicação

Frontend estático e Quarkus precisam de hospedagens compatíveis.
Cloudflare Pages não executa backend Java.
Banco deve ser durável.
Não prometer custo zero ou disponibilidade contínua sem validar limites.