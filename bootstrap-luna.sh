#!/usr/bin/env bash
set -Eeuo pipefail

QUARKUS_VERSION="3.33.3"
ROOT="$(git rev-parse --show-toplevel)"
STAGE=""

cd "$ROOT"

cleanup() {
  if [[ -n "$STAGE" && -d "$STAGE" ]]; then
    rm -rf -- "$STAGE"
  fi
}

trap cleanup EXIT
trap 'printf "\nErro na linha %s. Verifique o estado antes de repetir.\n" "$LINENO" >&2' ERR

# Cria arquivos sem sobrescrever conteúdo existente.
write_new() {
  local path="$1"

  if [[ -e "$path" ]]; then
    printf 'Preservado: %s\n' "$path"
    cat >/dev/null
    return
  fi

  mkdir -p "$(dirname "$path")"
  cat >"$path"
  printf 'Criado: %s\n' "$path"
}

echo "Preparando configuração do Codespaces..."

write_new ".devcontainer/devcontainer.json" <<'JSON'
{
  "name": "Luna Development",
  "image": "mcr.microsoft.com/devcontainers/base:1-ubuntu-24.04",
  "features": {
    "ghcr.io/devcontainers/features/java:1": {
      "version": "25",
      "installMaven": true
    },
    "ghcr.io/devcontainers/features/node:1": {
      "version": "22"
    },
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "forwardPorts": [5173, 8080],
  "portsAttributes": {
    "5173": {
      "label": "Luna Frontend",
      "onAutoForward": "notify",
      "visibility": "private"
    },
    "8080": {
      "label": "Luna API",
      "onAutoForward": "silent",
      "visibility": "private"
    }
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "vscjava.vscode-java-pack",
        "redhat.vscode-quarkus",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  },
  "remoteUser": "vscode"
}
JSON

touch .gitignore

for rule in \
  '/docs/' \
  '/.local-context/' \
  '**/target/' \
  '**/node_modules/' \
  '**/dist/' \
  '.env' \
  '.env.*' \
  '!.env.example' \
  '*.log' \
  '/personal-data/' \
  '/backups/'; do
  if ! grep -qxF -- "$rule" .gitignore; then
    printf '%s\n' "$rule" >>.gitignore
  fi
done

echo "Verificando ferramentas..."

missing=0

for tool in git java mvn node npm docker; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf 'Ausente: %s\n' "$tool"
    missing=1
  fi
done

if [[ "$missing" -eq 1 ]]; then
  cat <<'TEXT'

A configuração .devcontainer/devcontainer.json foi criada.

No VS Code, abra a paleta de comandos e execute:
  Codespaces: Rebuild Container

Depois da reconstrução, rode novamente:
  bash bootstrap-luna.sh

O script não instala ferramentas globalmente nem usa sudo.
TEXT
  exit 1
fi

java_info="$(java -version 2>&1)"
maven_info="$(mvn -version 2>&1)"

if ! grep -Eq 'version "25(\.|")' <<<"$java_info"; then
  printf '%s\n' "$java_info"
  echo "É necessário Java 25. Reconstrua o Dev Container."
  exit 1
fi

if ! grep -Eq 'Java version: 25([.,]|$)' <<<"$maven_info"; then
  printf '%s\n' "$maven_info"
  echo "O Maven precisa usar Java 25. Verifique JAVA_HOME."
  exit 1
fi

node -e '
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  console.error("Use Node.js 22.12 ou superior.");
  process.exit(1);
}
'

for directory in backend frontend; do
  if [[ -e "$directory" ]]; then
    echo "Já existe '$directory'. Cancelado para não sobrescrever trabalho."
    echo "Peça ao agente para inspecionar o projeto existente."
    exit 1
  fi
done

if ! docker info >/dev/null 2>&1; then
  echo "Aviso: Docker existe, mas o daemon não respondeu."
  echo "Isso precisa ser resolvido antes de executar Quarkus Dev Services."
fi

STAGE="$(mktemp -d "${TMPDIR:-/tmp}/luna-bootstrap.XXXXXXXX")"

echo "Gerando Quarkus em diretório temporário..."

(
  cd "$STAGE"

  mvn \
    "io.quarkus.platform:quarkus-maven-plugin:${QUARKUS_VERSION}:create" \
    -DprojectGroupId=dev.luna \
    -DprojectArtifactId=backend \
    -DprojectVersion=0.1.0-SNAPSHOT \
    -DjavaVersion=25 \
    -Dextensions=rest-jackson,jdbc-postgresql,hibernate-orm,flyway,hibernate-validator,smallrye-openapi,smallrye-health \
    -DnoCode=true

  npm exec --yes --package=create-vite@latest -- \
    create-vite frontend --template react-ts

  cd frontend
  npm install
)

# Remover somente os arquivos recém-gerados que substituiremos.
rm -f -- \
  "$STAGE/backend/src/main/resources/application.properties" \
  "$STAGE/frontend/src/App.tsx" \
  "$STAGE/frontend/src/App.css" \
  "$STAGE/frontend/src/index.css" \
  "$STAGE/frontend/vite.config.ts"

mv "$STAGE/backend" "$ROOT/backend"
mv "$STAGE/frontend" "$ROOT/frontend"

chmod +x backend/mvnw

echo "Criando implementação inicial..."

write_new "backend/src/main/resources/application.properties" <<'PROPERTIES'
quarkus.application.name=luna-api
quarkus.http.port=8080
quarkus.http.host=0.0.0.0

%dev.quarkus.datasource.db-kind=postgresql
%dev.quarkus.datasource.devservices.enabled=true
%dev.quarkus.datasource.devservices.image-name=postgres:17

quarkus.hibernate-orm.schema-management.strategy=none
quarkus.flyway.migrate-at-start=false

%prod.quarkus.datasource.db-kind=postgresql
%prod.quarkus.datasource.jdbc.url=${DATABASE_URL}
%prod.quarkus.datasource.username=${DATABASE_USERNAME}
%prod.quarkus.datasource.password=${DATABASE_PASSWORD}
PROPERTIES

write_new "backend/src/main/java/dev/luna/catalog/domain/LearningTrail.java" <<'JAVA'
package dev.luna.catalog.domain;

public record LearningTrail(
        String id,
        String title,
        String description,
        int plannedCourseCount,
        ContentStatus status
) {
    public enum ContentStatus {
        PLANNED,
        IN_PROGRESS,
        AVAILABLE
    }
}
JAVA

write_new "backend/src/main/java/dev/luna/catalog/application/GetLearningTrails.java" <<'JAVA'
package dev.luna.catalog.application;

import dev.luna.catalog.domain.LearningTrail;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

import static dev.luna.catalog.domain.LearningTrail.ContentStatus.PLANNED;

@ApplicationScoped
public class GetLearningTrails {

    public List<LearningTrail> execute() {
        return List.of(
                new LearningTrail(
                        "tarot",
                        "Tarô",
                        "Investigue imagens, conecte símbolos e construa leituras contextualizadas.",
                        4,
                        PLANNED
                ),
                new LearningTrail(
                        "numerology",
                        "Numerologia",
                        "Explore números e tradições simbólicas com métodos identificados.",
                        6,
                        PLANNED
                ),
                new LearningTrail(
                        "patterns",
                        "Padrões e autoconhecimento",
                        "Explore hábitos e interpretações em atividades educativas.",
                        14,
                        PLANNED
                )
        );
    }
}
JAVA

write_new "backend/src/main/java/dev/luna/catalog/infrastructure/rest/LearningTrailResource.java" <<'JAVA'
package dev.luna.catalog.infrastructure.rest;

import dev.luna.catalog.application.GetLearningTrails;
import dev.luna.catalog.domain.LearningTrail;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/api/v1/trails")
@Produces(MediaType.APPLICATION_JSON)
public class LearningTrailResource {

    private final GetLearningTrails getLearningTrails;

    public LearningTrailResource(GetLearningTrails getLearningTrails) {
        this.getLearningTrails = getLearningTrails;
    }

    @GET
    public List<LearningTrailResponse> list() {
        return getLearningTrails.execute()
                .stream()
                .map(LearningTrailResponse::from)
                .toList();
    }

    public record LearningTrailResponse(
            String id,
            String title,
            String description,
            int plannedCourseCount,
            String status
    ) {
        static LearningTrailResponse from(LearningTrail trail) {
            return new LearningTrailResponse(
                    trail.id(),
                    trail.title(),
                    trail.description(),
                    trail.plannedCourseCount(),
                    trail.status().name()
            );
        }
    }
}
JAVA

write_new "frontend/vite.config.ts" <<'TS'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
});
TS

write_new "frontend/src/App.tsx" <<'TSX'
import { useEffect, useState } from 'react';
import './App.css';

type Status = 'PLANNED' | 'IN_PROGRESS' | 'AVAILABLE';

type Trail = {
  id: string;
  title: string;
  description: string;
  plannedCourseCount: number;
  status: Status;
};

type Catalog =
  | { kind: 'loading' }
  | { kind: 'success'; trails: Trail[] }
  | { kind: 'error'; message: string };

const labels: Record<Status, string> = {
  PLANNED: 'Em planejamento',
  IN_PROGRESS: 'Em produção',
  AVAILABLE: 'Disponível',
};

const symbols: Record<string, string> = {
  tarot: '✦',
  numerology: '∞',
  patterns: '◌',
};

function isTrail(value: unknown): value is Trail {
  if (typeof value !== 'object' || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.plannedCourseCount === 'number' &&
    Number.isInteger(item.plannedCourseCount) &&
    item.plannedCourseCount >= 0 &&
    (item.status === 'PLANNED' ||
      item.status === 'IN_PROGRESS' ||
      item.status === 'AVAILABLE')
  );
}

export default function App() {
  const [catalog, setCatalog] = useState<Catalog>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [quiet, setQuiet] = useState(false);
  const [portraitAvailable, setPortraitAvailable] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setCatalog({ kind: 'loading' });

      try {
        const response = await fetch('/api/v1/trails', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`A API respondeu com HTTP ${response.status}.`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data) || !data.every(isTrail)) {
          throw new Error('O catálogo recebido tem um formato inesperado.');
        }

        setCatalog({ kind: 'success', trails: data });
      } catch (error) {
        if (controller.signal.aborted) return;

        setCatalog({
          kind: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar o catálogo.',
        });
      }
    }

    void load();
    return () => controller.abort();
  }, [attempt]);

  return (
    <div className={`universe ${quiet ? 'quiet' : ''}`}>
      <header className="site-header">
        <a href="/" className="brand">
          <span aria-hidden="true">☾</span> LUNA
        </a>
        <span className="preview">Prévia de desenvolvimento</span>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Conhecimento em fases. No seu ritmo.</p>
          <h1 id="hero-title">Seu universo de estudos.</h1>
          <p className="hero-description">
            Observe, experimente e conecte ideias.
            Uma descoberta de cada vez.
          </p>

          <aside className="lume-panel" aria-label="Mensagem da Lume">
            {portraitAvailable && (
              <img
                className="lume-image"
                src="/assets/lume.png"
                alt="Lume, a bruxinha companheira de estudos"
                onError={() => setPortraitAvailable(false)}
              />
            )}
            <div>
              <p className="eyebrow">Lume</p>
              <p>“Vamos observar antes de decorar?”</p>
              {!portraitAvailable && (
                <small>Retrato da personagem ainda não adicionado.</small>
              )}
            </div>
          </aside>
        </section>

        <section aria-labelledby="catalog-title">
          <h2 id="catalog-title">Escolha uma constelação</h2>
          <p className="muted">Três trilhas, diferentes formas de investigar.</p>

          {catalog.kind === 'loading' && (
            <p className="notice" role="status">Carregando as trilhas…</p>
          )}

          {catalog.kind === 'error' && (
            <div className="notice error" role="alert">
              <h3>O catálogo não está acessível.</h3>
              <p>{catalog.message}</p>
              <p>Confira se o Quarkus está rodando na porta 8080.</p>
              <button onClick={() => setAttempt(value => value + 1)}>
                Tentar novamente
              </button>
            </div>
          )}

          {catalog.kind === 'success' && (
            <div className="trail-grid">
              {catalog.trails.map(trail => (
                <article className="trail-card" key={trail.id}>
                  <span className="trail-symbol" aria-hidden="true">
                    {symbols[trail.id] ?? '✦'}
                  </span>
                  <span className="status">{labels[trail.status]}</span>
                  <h3>{trail.title}</h3>
                  <p>{trail.description}</p>
                  <footer>{trail.plannedCourseCount} cursos planejados</footer>
                </article>
              ))}
            </div>
          )}
        </section>

        <label className="motion-setting">
          <input
            type="checkbox"
            checked={quiet}
            onChange={event => setQuiet(event.target.checked)}
          />
          Modo tranquilo: sem animações
        </label>

        <p className="scope-note">
          Esta prévia apresenta o catálogo. Aulas, progresso e conquistas
          serão implementados nas próximas entregas.
        </p>
      </main>
    </div>
  );
}
TSX

write_new "frontend/src/index.css" <<'CSS'
:root {
  font-family: system-ui, -apple-system, sans-serif;
  color: #f8f3ff;
  background: #120e22;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
button, input { font: inherit; }
button { cursor: pointer; }
button:focus-visible, a:focus-visible, input:focus-visible {
  outline: 3px solid #dbc1ff;
  outline-offset: 5px;
}
CSS

write_new "frontend/src/App.css" <<'CSS'
.universe {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 15% 10%, #7446a840, transparent 45%),
    radial-gradient(ellipse at 85% 40%, #39578c30, transparent 40%),
    #120e22;
}
.site-header, main {
  width: min(1120px, 100%);
  margin: auto;
  padding-inline: 24px;
}
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding-block: 26px;
}
.brand {
  color: #fff6e8;
  text-decoration: none;
  letter-spacing: .15em;
  font: 29px Georgia, serif;
}
.brand span, .eyebrow { color: #d6b979; }
.preview { font-size: 12px; color: #cabbd8; }
.hero { padding-block: 48px 36px; max-width: 760px; }
.eyebrow {
  font-size: 12px;
  letter-spacing: .1em;
  text-transform: uppercase;
}
h1, h2, h3 { font-family: Georgia, serif; font-weight: 400; }
h1 {
  font-size: clamp(40px, 6vw, 68px);
  line-height: 1.08;
  margin-block: 20px;
}
h2 { font-size: 31px; }
.hero-description, .muted, .scope-note {
  color: #d0c4dc;
  line-height: 1.7;
}
.hero-description { font-size: 19px; max-width: 560px; }
.lume-panel {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 28px;
  padding: 20px;
  border: 1px solid #d9bbff40;
  border-radius: 24px;
  background: #f5eeff08;
}
.lume-panel p { margin-block: 8px; }
.lume-panel small { color: #d0c4dc; }
.lume-image {
  width: 128px;
  height: 128px;
  object-fit: contain;
  border-radius: 22px;
}
.trail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 28px;
}
.trail-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  border: 1px solid #d4bcf45c;
  border-radius: 26px;
  color: #35263f;
  background: linear-gradient(145deg, #fffaf2, #f0e8f6);
  box-shadow: 0 16px 44px #0003;
}
.trail-symbol {
  font-size: 40px;
  color: #74518c;
  margin-bottom: 24px;
}
.status {
  align-self: flex-start;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #593b6f;
  background: #e8ddf1;
}
.trail-card h3 { font-size: 29px; margin-block: 18px 12px; }
.trail-card p { line-height: 1.7; color: #65566e; }
.trail-card footer {
  margin-top: auto;
  padding-top: 20px;
  font-size: 13px;
  color: #705a80;
}
.notice {
  padding: 24px;
  border-radius: 22px;
  border: 1px solid #c6a7ed70;
  background: #281d3d;
  line-height: 1.7;
}
.error { border-color: #d6b979; }
.notice button {
  border: 0;
  border-radius: 14px;
  padding: 12px 18px;
  color: #261a35;
  background: #e2ccff;
}
.motion-setting {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 32px;
  color: #d0c4dc;
}
.motion-setting input { width: 22px; height: 22px; }
.scope-note {
  margin-block: 24px 0;
  padding-bottom: 50px;
  font-size: 13px;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .universe:not(.quiet) .trail-card {
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .universe:not(.quiet) .trail-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 22px 55px #0005, 0 0 22px #b58add20;
  }
}
@media (max-width: 800px) {
  .trail-grid { grid-template-columns: 1fr; }
  .hero { padding-top: 24px; }
}
@media (max-width: 420px) {
  .preview { max-width: 110px; text-align: right; }
  .lume-image { width: 88px; height: 100px; }
}
CSS

echo "Criando documentos de continuidade..."

write_new "docs/PROJECT_CONTEXT.md" <<'MD'
# Luna — Contexto do produto

## Objetivo
Aplicativo pessoal em português brasileiro:
Tarô Waite–Smith, Numerologia e Padrões e autoconhecimento.
Não inclui consultas para clientes nem ofertas e precificação.

Priorizar interação, repetição variada, estímulos ajustáveis e retomada.
Não prometer tratamento ou eficácia universal para TDAH.

## Identidade
Luna é o aplicativo.
Lume é a bruxinha adulta e companheira de estudos.
Frase: Conhecimento em fases. No seu ritmo.
Linguagem próxima, técnica e compreensível, sem infantilização.

## Referências
- https://astratarot.net/pt/professions/tarot-reader
- https://astratarot.net/pt/products/tarot
- https://astratarot.net/pt/products/numerology
- https://astratarot.net/pt/products/psychology

Referência de experiência e abrangência, não fonte para copiar conteúdo.
A pesquisa anterior não acessou o currículo pago inteiro.
Revalidar títulos, contagens e descrições antes de usá-los como inventário.

## Hierarquia
Trilha → Curso → Módulo → Aula → Etapa.
Cada aula possui um pequeno caminho visual.
Uma carta não é uma trilha principal.

## Planejamento
Tarô: quatro cursos.
Cartas/fundamentos, inversões, combinações e correspondências astrológicas.

Numerologia: seis cursos.
História/fundamentos, números 0–9, redução/conexões, letras/números,
números superiores/mestres e palavras/nomes.

Padrões: quatorze cursos educativos.
Processamento automático; sinais corporais/emocionais; narrativas;
hábitos/evitação; vínculos/apego; gatilhos/conflito;
identidade/trabalho/valores; sonhos/símbolos/interpretação;
experiências anteriores; experimentação de comportamentos;
diálogo interno; relações/limites; pressão; mapa pessoal de padrões.

Contagens são planejamento, não implementação concluída.

## Rigor
Tarô e numerologia são apresentados como tradições simbólicas.
Não afirmar previsão comprovada ou determinação de personalidade.
Identificar observação, tradição e interpretação.
Não misturar sistemas numerológicos silenciosamente.
A trilha de padrões é educativa, não clínica ou terapêutica.
Não diagnosticar, inferir traumas pelas cartas ou prometer reprogramação.

## Stack
Java 25, Quarkus, Maven Wrapper.
React, TypeScript e Vite.
PostgreSQL, Hibernate ORM e Flyway.
Monorepo e monólito modular por funcionalidade.
Domínio, aplicação e infraestrutura conforme necessidade.
DTOs próprios, injeção por construtor e interfaces nos limites reais.

## Aprendizagem
Etapas previstas:
explicação, escolha única, múltipla seleção, símbolos,
associação, ordenação, cálculo e reflexão.

Conteúdo e progresso versionados.
Tentativas e recompensas idempotentes.
Servidor não aceita XP arbitrário enviado pelo cliente.

## Privacidade e deploy
Não versionar notas pessoais ou credenciais.
Não sincronizar reflexões sem escolha explícita.
Implementar exportação/importação antes de migrar progresso.
Frontend estático e backend Quarkus exigem hospedagens compatíveis.
Repositório privado não torna site publicado privado.
Não prometer gratuidade permanente.
MD

write_new "docs/EXPERIENCE_REQUIREMENTS.md" <<'MD'
# Luna — Experiência

Não criar apenas enciclopédia, flashcards ou quizzes repetitivos.
Distribuir profundidade em pequenas interações.

Retomar conceitos por imagem, contraste, cenário e interpretação.
Distratores plausíveis, posição correta variada e feedback por alternativa.
Não inventar informações para preencher categorias.

Cartas:
observação, símbolos, núcleo, nuances, cores/números contextualizados,
correspondências identificadas, inversões e conexões progressivas.

Lume:
companheira que acolhe, pergunta, explica e compara.
Respostas a erros sem constrangimento.
Não precisa aparecer em toda tela.
Estilo 2.5D, volume e sombras suaves; poses consistentes.
Imagem estática não é rig animável.

Visual:
ameixa profundo, marfim para leitura, lavanda e dourado nos detalhes.
Constelações com alternativa acessível em lista.
Nada essencial depende de hover.
Respeitar prefers-reduced-motion e modo tranquilo.
Evitar flashes e movimento decorativo constante.
Não substituir ilustrações finais por emojis.

Prints Astra mostram parte da demonstração:
narrativa, quizzes, seleção de palavras, verdadeiro/falso,
associação e recompensas.
Não representam a aula inteira.
Waite–Smith continua sendo a referência principal do Luna.

Recompensas educativas, previsíveis, sem compra, sorteio ou punição.
Conclusão registra estudo, não comprova domínio.

Antes de expandir:
construir uma aula aprofundada de referência, testar e obter aprovação.
Não gerar 78 cópias superficiais de um template.
MD

write_new "docs/PROJECT_STATUS.md" <<'MD'
# Luna — Estado

Ambiente atual: Linux em GitHub Codespaces.
Repositório: https://github.com/txsabrina/luna-app

Bootstrap:
catálogo estático de três trilhas, API Quarkus, frontend React,
estados de loading/erro, interface cósmica, modo tranquilo,
Dev Container e workflow de verificação.

Não implementado:
motor de aulas, currículo completo, autenticação,
tentativas/progresso persistidos, recompensas, revisão,
importação/exportação, offline/PWA, sincronização e deploy.

Assets finais da Lume pendentes.

O bootstrap instala dependências, mas não executa build ou testes.
Não afirmar que verificações passaram sem observar os resultados.

Próxima fatia:
Tarô → Cartas → Arcanos Maiores → O Louco.
Explicação, escolha única e exploração de símbolos;
feedback por alternativa, persistência, retomada,
recompensa idempotente e testes.

Atualizar após cada entrega:
mudanças, comandos executados, resultados, pendências e próxima tarefa.

docs/ está ignorada no Git por escolha da desenvolvedora.
Fazer backup antes de excluir o Codespace.
MD

write_new "docs/adr/0001-architecture.md" <<'MD'
# ADR 0001 — Arquitetura inicial

Monorepo, monólito modular, conteúdo separado das regras e da interface.
Java 25/Quarkus e React/TypeScript/Vite.
PostgreSQL e Flyway quando houver persistência.

Catálogo inicial estático.
Não criar persistência ou autenticação fictícias.
Cliente OpenAPI e bibliotecas adicionais entram conforme necessidade.

Quarkus 3.33.3 é uma versão fixa conhecida da linha LTS,
não uma afirmação de patch mais recente.
Revisar segurança e patches antes de publicar.

O gerador Vite atual resolve as dependências.
Versionar package-lock.json e usar npm ci no CI.

Docker-in-Docker destina-se ao desenvolvimento neste Codespace,
não a um ambiente de produção.
MD

write_new "docs/references/README.md" <<'MD'
# Referências locais

Guardar:
.local-context/conversation.md
.local-context/astra-screenshots/
.local-context/lume-concepts/

O script não tem acesso aos anexos da conversa.
Copiar os arquivos manualmente.

Prints Astra são referências, não assets para publicar.
Separar observado, requisito aprovado e sugestão nova.

Links sandbox não são URLs públicas permanentes.
Baixar conceitos da Lume antes de transferir o contexto.

Retrato opcional:
frontend/public/assets/lume.png

Preferir retrato individual; painel conceitual não é asset final.
MD

write_new "AGENTS.md" <<'MD'
# Luna — Instruções do agente

Leia explicitamente:
- docs/PROJECT_CONTEXT.md
- docs/EXPERIENCE_REQUIREMENTS.md
- docs/PROJECT_STATUS.md
- docs/adr/0001-architecture.md

docs/ está ignorada: a indexação automática pode não incluí-la.
Se os documentos estiverem ausentes ou inacessíveis, solicite contexto.
Não reconstrua as decisões por suposição.

Ambiente: Linux em GitHub Codespaces.
Use Bash, não PowerShell.

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
MD

write_new "infra/README.md" <<'MD'
# Infraestrutura

Local: Quarkus Dev Services inicia PostgreSQL usando Docker.
Não usar esse banco como armazenamento de produção.

Não há deploy neste bootstrap.
Antes de publicar, definir hosts, banco durável, autenticação,
secrets e roteamento /api.

Frontend usa proxy Vite apenas em desenvolvimento.
Manter portas do Codespace privadas.
MD

write_new "docs/BOOTSTRAP.md" <<'MD'
# Rodar no Codespaces

Se as ferramentas estiverem ausentes, reconstruir Dev Container
e executar novamente bash bootstrap-luna.sh.

Terminal 1:
cd backend
./mvnw quarkus:dev

Terminal 2:
cd frontend
npm run dev

Na aba Ports, abrir a porta 5173 no navegador.
Manter visibilidade privada.

API dentro do terminal:
curl --fail http://localhost:8080/api/v1/trails

Swagger: /q/swagger-ui na porta 8080.
Health: /q/health na porta 8080.

Verificar:
(cd backend && ./mvnw verify)
(cd frontend && npm run lint && npm run build)

Não há testes personalizados de aprendizagem neste bootstrap.

Imagem opcional:
frontend/public/assets/lume.png

Se houver bloqueio de host pelo Vite, adicionar apenas o hostname
exato do preview em server.allowedHosts.
Não configurar allowedHosts: true indiscriminadamente.

docs/ e .local-context/ estão fora do Git.
Fazer backup antes de excluir o Codespace.
MD

write_new ".github/workflows/verify.yml" <<'YAML'
name: Verify Luna

on:
  push:
  pull_request:

permissions:
  contents: read

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '25'
          cache: maven
      - name: Verify backend
        working-directory: backend
        run: bash ./mvnw -B verify

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - name: Install
        working-directory: frontend
        run: npm ci
      - name: Lint
        working-directory: frontend
        run: npm run lint
      - name: Build
        working-directory: frontend
        run: npm run build
YAML

for directory in \
  content/tarot \
  content/numerology \
  content/patterns \
  frontend/public/assets \
  backend/src/main/resources/db/migration \
  .local-context/astra-screenshots \
  .local-context/lume-concepts; do
  mkdir -p "$directory"
done

for directory in \
  content/tarot \
  content/numerology \
  content/patterns \
  frontend/public/assets; do
  touch "$directory/.gitkeep"
done

cat <<'TEXT'

Bootstrap criado.

Não foram executados:
- Build ou testes.
- Commit ou push.
- Deploy.
- Importação do histórico ou das imagens.

Próximos passos:
1. Verifique docker info.
2. Terminal 1: cd backend && ./mvnw quarkus:dev
3. Terminal 2: cd frontend && npm run dev
4. Abra a porta 5173 pela aba Ports.
5. Leia docs/BOOTSTRAP.md.

Documentos existentes foram preservados.
Se eles ainda mencionarem Windows, revise-os com o agente.

Se docs/ já era rastreada pelo Git, a regra do .gitignore
não remove o rastreamento automaticamente.
TEXT
