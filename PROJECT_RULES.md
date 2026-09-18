# Regras do projeto

- O usuário atua como designer/UX; implementação e arquitetura ficam com Codex/ChatGPT.
- Priorizar simplicidade, baixo peso e zero dependências quando possível.
- Usar apenas HTML, CSS e JavaScript puro, sem frameworks, bundler, npm ou dependências externas.
- O site é estático e mobile-first, com suporte a telas a partir de 320px.
- A exposição é dividida em andares.
- Cada andar possui planta SVG e slots numerados em posições fixas.
- Obras são vinculadas por andar + slot.
- Os dados virão de arquivo local gerado posteriormente a partir de planilha.
- `data/works-floor-1.json` é a fonte dos dados textuais das obras do 1º andar, vinculados às posições pelo campo `id`; coordenadas permanecem exclusivamente em `data/positions-floor-1.json`.
- Mapeamento definitivo do 1º andar: a aba "Respostas ao formulário 1" é a fonte principal das informações e sua Column 14 define o "id"/posição da obra. Não usar LOCAL da aba "Localização Mapa" para IDs; essa aba serve apenas como fallback textual quando faltarem dados da obra. IDs 1–53 e 88 pertencem à Sala 1; 54–87 à Sala 2.
- Imagens e áudios são arquivos locais.
- Imagens do 1º andar são importadas pelo manifesto data/import/image-sources-floor-1.json com 	ools/sync-images.ps1; somente arquivos de imagem validados são vinculados em data/works-floor-1.json.
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
- `js/app.js`: estado compartilhado de andar, modo e obra selecionada; mapa, lista e painel.
- `js/explore.js`: compactação da navegação e leitura semântica com Web Speech API.
- `maps/`: plantas SVG locais.
- `obras/imagens/` e `obras/audio/`: arquivos locais futuros.
- Scripts clássicos, carregados com `defer`, para permitir abrir `index.html` diretamente, sem servidor.



## Escopo atual

Wireframe estático com exploração por mapa e lista. Andar 1 contém 88 obras com posição no mapa e andar 2 contém 15 obras posicionadas conforme o mapa impresso v10, sem seleção inicial. Andar 3 permanece sem slots cadastrados. Selecionar um slot abre um bottom sheet não modal com conteúdo mock e mídias locais. Fechar remove a seleção. O botão de interesse abre o WhatsApp com mensagem específica da obra, sem formulário ou backend.


## Orientação das plantas e coordenadas dos slots

- As plantas arquitetônicas originais são horizontais.
- No site, serão representadas em orientação vertical para mobile, com rotação de 90° no sentido horário em relação à planta original.
- A versão vertical exibida no site é o sistema de coordenadas oficial dos slots.
- Não depender de rotação CSS para posicionar os slots.
- Os SVGs finais devem ter viewBox vertical.
- As posições x/y dos slots devem corresponder diretamente à orientação exibida.
- No 1º andar, a entrada fica no topo do mapa, conforme a organização espacial atual confirmada pelo usuário.
- Manter a possibilidade futura de indicar ENTRADA / VOCÊ ESTÁ AQUI.
- Esta decisão orienta a preparação futura das plantas e posições; não altera a interface nesta etapa.

## Navegação e exploração

- MAPA e LISTA compartilham andar e seleção; ambos abrem o mesmo bottom sheet.
- Cada obra possui area (identificador interno), type e tags[]. O vínculo andar + slot e as coordenadas permanecem separados.
- A interface não possui filtros. Área, tipo e tags permanecem nos dados; mudar de modo mantém a seleção e trocar de andar fecha o painel.
- A lista permite agrupamento por área. No 1º andar, os metadados internos distinguem Áreas 1 a 5.
- Header e sub-nav formam uma pilha sticky. O mapa usa toda a largura e a altura disponível abaixo dessa pilha; mudanças de viewport e orientação recalculam o enquadramento. Em telas baixas o header inicia compacto.
- O botão TENHO INTERESSE abre o WhatsApp a partir dos estados parcial e expandido, com número, título e artista disponíveis; não há formulário ou backend.
- OUVIR TELA usa somente speechSynthesis e vozes locais do dispositivo. A fala deriva do conteúdo textual/semântico do modo atual ou da ficha aberta; não interpreta o desenho do mapa. Preservar os controles semânticos para leitores de tela.
- As coordenadas, cadastro e geometria permanecem separados da exploração. O mezanino é um nível distinto nos dados, acima das Áreas 1, 2 e 3; suas posições definitivas ainda dependem de validação. Backend/propostas continuam fora do escopo.

## Motor de mapa e navegação

- O SVG oficial da planta mantém a geometria sem alterações; rótulos de BAR e BANHEIROS são sobrepostos no mapa interativo e acompanham pan/zoom. Áreas permanecem nos dados e na lista.
- Pointer Events ficam no SVG raiz; clientX/clientY são convertidos por createSVGPoint e getScreenCTM().inverse(). Pan, pinch pelo ponto médio, wheel ancorado no cursor e botões compartilham { x, y, scale }, aplicado somente ao grupo interno map-content, sem transform CSS concorrente.
- 100% ajusta a planta à largura disponível (fit-width), sem expor a escala antiga. O zoom pode descer até 20% para visão geral; reset e redimensionamento voltam a 100%. Os limites se aplicam à posição final, não aos deltas.
- Clusters por proximidade na tela separam progressivamente os slots conforme o zoom. Fechados, exibem somente a quantidade; abertos, mantêm o centro como botão de fechar e distribuem obras numeradas em círculos dentro da viewport. Todos os números permanecem no nome acessível. Agrupar não altera coordenadas nem cadastro.
- Miniaturas locais aparecem a partir de 400%, somente para slots individuais visíveis; não pré-carregar as 100 imagens. Número e seleção continuam acessíveis.
- Sub-nav em uma linha desde 320px: MAPA / LISTA | ANDAR 1 / 2 | OUVIR TELA, com separadores verticais e estados ativos. A compactação sticky continua controlada pela sentinela. O andar 3 permanece apenas na configuração, sem controle visível.
- Viewport/SVG usam touch-action:none para pan/pinch. Wheel sobre o mapa controla zoom e impede scroll apenas durante essa interação; fora do mapa, scroll permanece nativo. Bottom sheet mantém seu comportamento próprio.





## Organização espacial atual do 1º andar

- Entrada no topo. Na parte superior: Área 3 à esquerda, Área 1 à direita e Área 2 na parede transversal inferior; rampa de skate central e Som/DJ junto à Área 2.
- Mezanino acima das Áreas 1, 2 e 3, com nível `mezzanine` e faixas paralelas próprias, separadas do nível `main`.
- Na parte inferior: Área 5 à esquerda, Área 4 à direita, bar abaixo da Área 5, escada do 2º andar no extremo inferior esquerdo e banheiros no bloco inferior direito.
- Áreas não são rotuladas dentro do SVG. Preservar geometria existente onde a função não estiver confirmada; posições finais dos slots ainda não definidas.

## Referência do 2º andar

- references/mapa_2o_andar_rios_reais_v10_qr.pdf é a fonte principal e mais atual para organização espacial, entrada, escadas, sala de vidro, circulação e relação entre obras e ambientes do 2º andar; prevalece sobre rascunhos e versões anteriores.

## Editor local de posições

- O parâmetro ?edit=1 ativa somente no navegador local os modos NAVEGAR e POSICIONAR do 1º andar, sem botão de acesso no rodapé público. Seu menu fica na pilha sticky, acima do header e fora do mapa. Posições usam coordenadas internas do SVG, persistem temporariamente em localStorage e podem ser exportadas como JSON com id, x, y e level. A URL pública não exibe nem ativa o editor.

## Arquivos de posições

- O 1º e o 2º andar carregam posições de data/positions-floor-1.json e data/positions-floor-2.json. Cada arquivo usa chaves numéricas com objetos x, y e level; arquivo ausente ou inválido preserva a configuração de fallback em js/config.js.
- EXPORTAR POSIÇÕES no modo ?edit=1 gera o mesmo formato de positions-floor-1.json.

## Sincronização dos dados locais

Sempre que qualquer JSON de runtime em /data for criado, removido ou alterado, executar:
`powershell -ExecutionPolicy Bypass -File tools/sync-local-data.ps1`

O fallback local gerado deve permanecer sincronizado com os JSONs antes de considerar a tarefa concluída.

## Geometria oficial do 1º andar

- A versão atual de "maps/andar-1.svg" editada manualmente pelo usuário é a fonte oficial da geometria do mapa.
- Preservar integralmente essas alterações manuais: não recriar, reverter ou substituir o SVG com base em versões anteriores.
- Em ajustes futuros do mapa interativo, adaptar o restante da implementação à geometria atual desse arquivo.
