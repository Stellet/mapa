# Regras do projeto

- O usuário atua como designer/UX; implementação e arquitetura ficam com Codex/ChatGPT.
- Priorizar simplicidade, baixo peso e zero dependências quando possível.
- Usar apenas HTML, CSS e JavaScript puro, sem frameworks, bundler, npm ou dependências externas.
- O site é estático e mobile-first, com suporte a telas a partir de 320px.
- A exposição é dividida em andares.
- Cada andar possui planta SVG e slots numerados em posições fixas.
- Obras são vinculadas por andar + slot.
- Os dados virão de arquivo local gerado posteriormente a partir de planilha.
- Imagens e áudios são arquivos locais.
- A ficha terá: número, imagem, título, artista, descrição, audiodescrição, leitura e interesse via WhatsApp.
- O visual é wireframe: sem cores decorativas, sombras, gradientes ou border-radius.
- Usar tipografia, linhas, espaçamento e hierarquia.
- Não alterar partes não relacionadas à tarefa.
- Consultar PROJECT_RULES.md e DEVLOG.md antes de novas implementações.
- Atualizar DEVLOG.md brevemente após mudanças relevantes.
- Respostas finais curtas: arquivos alterados, resultado e pendências reais.

## Estrutura inicial

- `index.html`: estrutura e conteúdo acessível.
- `css/style.css`: apresentação mobile-first.
- `js/config.js`: configuração local dos andares.
- `js/data.js`: dados fictícios, com vínculo por andar + slot.
- `js/app.js`: seleção de andar e slot e resumo da obra.
- `maps/`: plantas SVG locais.
- `obras/imagens/` e `obras/audio/`: arquivos locais futuros.
- Scripts clássicos, carregados com `defer`, para permitir abrir `index.html` diretamente, sem servidor.

## Escopo atual

Somente wireframe inicial. Andar 1 contém 100 slots fictícios, sem seleção inicial. Andares 2 e 3 têm plantas placeholder e nenhum slot cadastrado. Selecionar um slot abre um bottom sheet não modal com conteúdo mock e mídias locais. Fechar remove a seleção. O botão de interesse permanece demonstrativo, sem integração com WhatsApp.

