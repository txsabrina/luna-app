# Infraestrutura

Local: Quarkus Dev Services inicia PostgreSQL usando Docker.
Não usar esse banco como armazenamento de produção.

Não há deploy neste bootstrap.
Antes de publicar, definir hosts, banco durável, autenticação,
secrets e roteamento /api.

Frontend usa proxy Vite apenas em desenvolvimento.
Manter portas do Codespace privadas.
