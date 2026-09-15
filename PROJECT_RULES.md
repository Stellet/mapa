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
- `js/app.js`: estado compartilhado de andar, modo, filtros e obra selecionada; mapa, lista e painel.
- `js/explore.js`: compactação da navegação e leitura semântica com Web Speech API.
- `maps/`: plantas SVG locais.
- `obras/imagens/` e `obras/audio/`: arquivos locais futuros.
- Scripts clássicos, carregados com `defer`, para permitir abrir `index.html` diretamente, sem servidor.

## Escopo atual

Wireframe estático com exploração por mapa e lista. Andar 1 contém 100 slots fictícios, sem seleção inicial. Andares 2 e 3 têm plantas placeholder e nenhum slot cadastrado. Selecionar um slot abre um bottom sheet não modal com conteúdo mock e mídias locais. Fechar remove a seleção. O botão de interesse permanece demonstrativo, sem integração com WhatsApp.


## Orientação das plantas e coordenadas dos slots

- As plantas arquitetônicas originais são horizontais.
- No site, serão representadas em orientação vertical para mobile, com rotação de 90° no sentido horário em relação à planta original.
- A versão vertical exibida no site é o sistema de coordenadas oficial dos slots.
- Não depender de rotação CSS para posicionar os slots.
- Os SVGs finais devem ter viewBox vertical.
- As posições x/y dos slots devem corresponder diretamente à orientação exibida.
- No 1º andar, a região de acesso fica na parte inferior do mapa.
- Manter a possibilidade futura de indicar ENTRADA / VOCÊ ESTÁ AQUI.
- Esta decisão orienta a preparação futura das plantas e posições; não altera a interface nesta etapa.

## Navegação e exploração

- MAPA e LISTA compartilham andar, filtros e seleção; ambos abrem o mesmo bottom sheet.
- Cada obra possui area (identificador interno), type e tags[]. O vínculo andar + slot e as coordenadas permanecem separados.
- Filtros de área, tipo e tag são combinados; mudar de modo mantém filtros e seleção. Trocar de andar ou excluir a obra selecionada pelos filtros fecha o painel.
- A lista permite agrupamento por área. Nomes públicos continuam SALA 1 e SALA 2.
- Header, sub-nav e filtros formam uma pilha sticky. O mapa usa toda a largura e a altura disponível abaixo dessa pilha; mudanças de viewport e orientação recalculam o enquadramento. Em telas baixas o header inicia compacto.
- O botão TENHO INTERESSE permanece no rodapé do painel expandido, ainda demonstrativo, sem formulário, backend ou proposta.
- OUVIR ESTA TELA usa somente speechSynthesis e vozes locais do dispositivo. A fala deriva do conteúdo textual/semântico do modo atual ou da ficha aberta; não interpreta o desenho do mapa. Preservar os controles semânticos para leitores de tela.
- As coordenadas, cadastro e geometria permanecem separados da exploração. Não incluir mezanino ou backend/propostas nesta etapa.

## Motor de mapa e navegação

- O SVG exibe apenas geometria, sem rótulos visuais internos. Áreas permanecem nos dados, filtros e lista.
- Pointer Events controlam pinch pelo ponto médio e pan, com um único estado de escala/posição compartilhado com +, − e reset. Não há rotação CSS.
- 100% enquadra a planta inteira na área útil; redimensionamento recalcula fit. Limites de pan mantêm o mapa dentro do enquadramento quando menor que a viewport e impedem arrastá-lo para fora quando ampliado.
- Clusters por proximidade na tela separam progressivamente os slots conforme o zoom. Agrupar não altera coordenadas nem cadastro; grupos são botões acessíveis que ampliam a região.
- Miniaturas locais aparecem a partir de 400%, somente para slots individuais visíveis; não pré-carregar as 100 imagens. Número e seleção continuam acessíveis.
- Compactar a navegação recolhe as opções dos filtros, preservando valores. O chevron permite reabrir; zoom/pan não fecham os filtros.
- Gestos do mapa não concorrem com scroll nativo: área interativa usa Pointer Events; em fit, arraste vertical encaminha rolagem à página e compactação. Fora dela, scroll permanece nativo. Bottom sheet mantém seu comportamento próprio.

