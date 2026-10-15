# Luna â€” Contexto do produto

## Objetivo

Aplicativo pessoal em portuguÃªs brasileiro para estudar:
- TarÃ´ Waiteâ€“Smith.
- Numerologia.
- PadrÃµes e autoconhecimento.

Uso prioritÃ¡rio: iPhone.
NÃ£o inclui prestaÃ§Ã£o de consultas nem ofertas e precificaÃ§Ã£o.

ExperiÃªncia desejada:
participaÃ§Ã£o, estÃ­mulos ajustÃ¡veis, repetiÃ§Ã£o variada e retomada.
NÃ£o apresentar essas escolhas como tratamento ou garantia para TDAH.

## Identidade

- Aplicativo: Luna.
- Personagem: Lume, bruxinha adulta e companheira de estudos.
- Frase: Conhecimento em fases. No seu ritmo.
- Linguagem prÃ³xima, despojada, culta e tecnicamente compreensÃ­vel.
- NÃ£o infantilizar a estudante.

## ReferÃªncias

- https://astratarot.net/pt/professions/tarot-reader
- https://astratarot.net/pt/products/tarot
- https://astratarot.net/pt/products/numerology
- https://astratarot.net/pt/products/psychology

Astra orienta abrangÃªncia e experiÃªncia.
Luna deve ter textos, atividades, personagens e assets originais.

A pesquisa anterior utilizou pÃ¡ginas pÃºblicas e prints de parte do demo.
NÃ£o houve acesso integral ao currÃ­culo pago.
TÃ­tulos e contagens devem ser revalidados antes de uso como inventÃ¡rio.

## Hierarquia aprovada

Trilha â†’ Curso â†’ MÃ³dulo â†’ Aula â†’ Etapa.

Uma carta Ã© uma aula ou conjunto de aulas, nÃ£o uma trilha principal.
Cada aula pode ter um caminho visual.
ConclusÃµes avanÃ§am mÃ³dulo, curso e trilha conforme regras explÃ­citas.

## CurrÃ­culo planejado

### TarÃ´ â€” quatro cursos

1. Cartas e fundamentos.
2. InversÃµes.
3. CombinaÃ§Ãµes.
4. CorrespondÃªncias astrolÃ³gicas.

Cobertura progressiva:
estrutura do baralho, arcanos maiores, menores e corte,
observaÃ§Ã£o visual, sÃ­mbolos, cores, nÃºmeros, contexto,
inversÃµes opcionais, combinaÃ§Ãµes e tiragens pessoais.

### Numerologia â€” seis cursos

1. HistÃ³ria e fundamentos.
2. NÃºmeros de 0 a 9.
3. ReduÃ§Ã£o e conexÃµes.
4. Letras e nÃºmeros.
5. NÃºmeros superiores e mestres.
6. Palavras e nomes.

Identificar o sistema utilizado.
NÃ£o misturar silenciosamente valores ordinais, reduÃ§Ã£o pitagÃ³rica
e gematria.

### PadrÃµes e autoconhecimento â€” quatorze cursos planejados

1. Processamento automÃ¡tico.
2. Sinais corporais e emoÃ§Ãµes.
3. Narrativas internas.
4. HÃ¡bitos e evitaÃ§Ã£o.
5. VÃ­nculos e apego.
6. Gatilhos e conflito.
7. Identidade, trabalho e valores.
8. Sonhos, sÃ­mbolos e interpretaÃ§Ã£o.
9. InfluÃªncia de experiÃªncias anteriores.
10. ExperimentaÃ§Ã£o de comportamentos.
11. DiÃ¡logo interno.
12. RelaÃ§Ãµes e limites.
13. ExperiÃªncias sob pressÃ£o.
14. IntegraÃ§Ã£o num mapa pessoal de padrÃµes.

SÃ£o objetivos editoriais, nÃ£o cursos implementados.

## Rigor

TarÃ´ e numerologia sÃ£o tradiÃ§Ãµes simbÃ³licas:
nÃ£o mÃ©todos comprovados de previsÃ£o ou determinaÃ§Ã£o de personalidade.

Distinguir:
- ObservaÃ§Ã£o da imagem.
- TradiÃ§Ã£o histÃ³rica/esotÃ©rica identificada.
- Possibilidade interpretativa.

NÃ£o diagnosticar, oferecer terapia, inferir traumas pelas cartas
ou prometer reprogramaÃ§Ã£o do subconsciente.

InversÃµes sÃ£o opcionais.
Normal nÃ£o equivale automaticamente a positivo.
Invertida nÃ£o equivale automaticamente a negativo.

## Stack e arquitetura

Requisito principal: Java e Quarkus.
Frontend proposto: React, TypeScript e Vite.
PersistÃªncia: PostgreSQL, Hibernate ORM e Flyway.
Maven Wrapper, contratos OpenAPI, validaÃ§Ã£o e health checks.

DireÃ§Ã£o inicial: Java 25 e Quarkus 3.x suportado.
As versÃµes efetivas devem ser verificadas no projeto.
NÃ£o usar versÃµes flutuantes em produÃ§Ã£o.

Monorepo e monÃ³lito modular por funcionalidade.
CÃ³digo deve ser fÃ¡cil de ler, manter e modificar.

## Privacidade

NÃ£o versionar credenciais, notas pessoais, logs sensÃ­veis
ou histÃ³rico integral.

NÃ£o sincronizar reflexÃµes sem escolha explÃ­cita.
Implementar exportaÃ§Ã£o/importaÃ§Ã£o antes de migraÃ§Ãµes de progresso.
RepositÃ³rio privado nÃ£o torna site publicado privado.

## PublicaÃ§Ã£o

Frontend estÃ¡tico e Quarkus precisam de hospedagens compatÃ­veis.
Cloudflare Pages nÃ£o executa backend Java.
Banco deve ser durÃ¡vel.
NÃ£o prometer custo zero ou disponibilidade contÃ­nua sem validar limites.