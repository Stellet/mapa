# Histórico de desenvolvimento

## 2026-09-09 — ajuste do wireframe

- Removida a seleção automática, inclusive ao trocar de andar. Clique/toque seleciona um único slot; repetir o clique mantém a seleção.
- Andar 1 agora possui 100 slots (01 a 100), em grade provisória de 5 colunas por 20 linhas, com coordenadas percentuais substituíveis por posições reais.
- Mapa vertical com proporção 9:16 e altura mínima de 1040px para preservar alvos de toque de 44px em telas de 320px. Seleção destacada em preto e branco com contorno.
- Ficha continua fora do escopo, sem novas dependências.

## 2026-09-09

- Criada estrutura estática em HTML, CSS e JavaScript puro, sem dependências.
- Registradas as regras de arquitetura, colaboração e apresentação em PROJECT_RULES.md.
- Implementados cabeçalho, seletor de três andares, plantas SVG placeholder e quatro slots fixos fictícios no andar 1, ativo inicialmente.
- Seleção por toque, clique e teclado atualiza o resumo com número, título e artista. O slot 1 inicia selecionado.
- Layout mobile-first a partir de 320px, controles com pelo menos 44px e indicação de foco.
- VER OBRA permanece desabilitado, pois a ficha completa está fora desta etapa.
- Pendências: plantas definitivas, dados gerados da planilha, mídias locais e implementação futura da ficha.
- Verificação: sintaxe dos três scripts, presença dos arquivos/pastas e XML dos SVGs conferidos. Validação visual em navegador ainda não realizada.

- Verificação do ajuste: seleção inicial vazia, troca/repetição e retorno de andar conferidos com DOM simulado; sintaxe e ausência de sobreposição dos alvos de 44px verificadas em larguras de 320, 375, 600 e 720px. Validação visual no navegador pendente.

## 2026-09-09 — bottom sheet de obra

- Substituído o resumo pelo painel fixo inferior de 40vh (40dvh quando disponível), inicialmente fechado, com rolagem interna e FECHAR sempre visível.
- Seleção abre o painel; trocar de slot atualiza os dados sem fechar. FECHAR/Escape removem a seleção e interrompem o áudio; trocar de andar fecha o painel. Mapa permanece acessível atrás, com espaço inferior para alcançar os últimos slots.
- Adicionados três conjuntos de conteúdo fictício, três imagens SVG locais e um WAV curto de teste identificado como sinal sonoro, sem narração. Player HTML nativo e botão de interesse demonstrativo, sem WhatsApp ou dependências.
- Verificação: sintaxe JS e SVGs válidos; testes no Edge headless passaram em 320x720 e 375x812 para estado inicial, abertura, troca de conteúdo, clique repetido, rolagem interna, altura do painel, ausência de overflow horizontal, FECHAR/Escape, foco e troca de andar.

## 2026-09-09 — conferência do bottom sheet

- Relidos PROJECT_RULES.md e DEVLOG.md e conferidos HTML, CSS e JavaScript: a implementação existente já atende à solicitação repetida, incluindo estado inicial fechado, troca de obra, FECHAR com remoção da seleção, painel de 40vh com rolagem e conteúdo mock completo.
- Preservada a implementação já testada em 320px e 375px. Sem mudanças de código, novas dependências ou integração com WhatsApp.

## 2026-09-09 — painel parcial e expandido

- Painel abre e troca de obra no estado parcial (~26vh, mínimo de 148px), com número, título, artista, FECHAR e indicador de arraste. Detalhes ficam fora da área visível e inacessíveis ao foco até expandir.
- Estado expandido mantém margem superior de 16px e rolagem interna. Gestos verticais, roda/trackpad e botão indicador controlam os estados; transição apenas de transform, com respeito a movimento reduzido.
- Cada gesto pertence ao painel ou à rolagem nativa até terminar. Puxar para baixo a partir do topo recolhe; atingir o topo durante uma rolagem exige novo gesto. Mouse permite arrastar o cabeçalho.
- Rolagem da página bloqueada com preservação/restauração da posição ao fechar. FECHAR/Escape continuam removendo seleção e interrompendo áudio. Novo js/sheet.js concentra somente estados e gestos; sem dependências.
- Verificação: sintaxe JS válida e testes no Edge headless em 320x568 e 375x812 aprovados para geometria, visibilidade, estados, gestos simulados, separação da rolagem, troca de obra, fechamento e restauração da posição da página. Sensação do gesto em dispositivo físico ainda não validada.

## 2026-09-10 — miniatura no painel parcial

- Estado parcial ajustado para ~28vh (mínimo de 168px), com miniatura à esquerda, número/título/artista à direita e “↑ ARRASTE PARA VER MAIS” abaixo; indicador superior centralizado preservado.
- Miniatura local com object-fit: cover, atualizada junto à obra. No estado expandido, miniatura e indicativo ficam ocultos e a imagem principal permanece na ficha.
- Alterados somente HTML, CSS e vínculo da miniatura em app.js. Lógica de estados, snap e rolagem em sheet.js preservada; sem dependências.
- Verificação: sintaxe JS válida; Edge headless em 320x568 e 375x812 aprovou posicionamento, conteúdo visível sem cortes, proporção compacta, troca de três obras e ocultação da miniatura/indicativo ao expandir.

## 2026-09-11 — orientação oficial das plantas

- Registrada a decisão de representar as plantas horizontais em orientação vertical mobile, giradas 90° no sentido horário. SVGs finais com viewBox vertical e coordenadas x/y diretamente na orientação exibida, sem depender de rotação CSS.
- No 1º andar, acesso na parte inferior do mapa; preservada a possibilidade futura de ENTRADA / VOCÊ ESTÁ AQUI.
- Alterados apenas PROJECT_RULES.md e DEVLOG.md. Interface, SVGs e posições atuais permanecem inalterados.

## 2026-09-11 — referências somente locais

- Criada a pasta references/ e adicionada a regra /references/ ao .gitignore, ignorando todo o conteúdo e subpastas nas adições normais do Git.
- Verificado diretamente o índice Git (formato v2): nenhum arquivo de references/ está rastreado. Executável Git indisponível neste ambiente; não foi possível executar git check-ignore.
- Limite do .gitignore: uma inclusão forçada com git add -f pode contornar a regra. Não constitui proibição absoluta de commit.
- Interface preservada e nenhuma dependência adicionada.

## 2026-09-11 — primeira planta simplificada do 1º andar

- Usado somente o PDF local references/CC LadoB - Planta 1o Andar.pdf (nome disponível; planta-andar-1.pdf não existe). Referência original e prévia de leitura permanecem na pasta ignorada.
- Substituído maps/andar-1.svg por desenho simplificado com viewBox vertical 360 x 1780, correspondente à rotação horária de 90°, sem rotação CSS. Preservados contorno, divisões principais, acesso inferior, salão lateral, escada, elevadores, rampa e obstáculos de circulação. Excluídos prédio vizinho, cotas, códigos, projeções e equipamentos técnicos.
- Reposicionados os 100 slots em percurso provisório desde a entrada, acompanhando paredes e contornando núcleos. Coordenadas continuam em config.js, separadas das obras em data.js; números permanecem retos.
- Planta sem distorção, com largura mínima de 480px e deslocamento horizontal local em telas estreitas, para manter os 100 alvos de 44px sem sobreposição. A página não ganha rolagem horizontal; o deslocamento do mapa é bloqueado enquanto o painel está aberto.
- Bottom sheet e identidade visual preservados. Atualizados somente SVG, configuração, integração/apresentação do mapa e este registro.
- Verificação: SVG válido, sintaxe JS, inspeção visual e testes no Edge em 320px e 375px para proporções, 100 números, áreas de toque, ausência de sobreposição, deslocamento, seleção e troca de andar. Posições são provisórias e dependem de validação curatorial; planta é esquemática, não levantamento técnico.

## 2026-09-11 — correção espacial dos slots

- Conferida a prévia local do PDF do 1º andar. Definidas internamente area-loja-14 e area-escritorios em config.js, com limites, zonas excluídas e vínculo de cada slot à área/parede; nomes não exibidos na interface.
- Redistribuídos exatamente 100 slots, 50 por área principal, em duas faixas próximas às paredes para preservar alvos de 44px. Numeração 01–100 parte da primeira parede válida após as portas da entrada principal e segue os circuitos das áreas.
- Liberada a faixa das antigas posições 45–50 nas portas. Novas posições desses números ficam na parede lateral válida. Removidos todos os slots do acesso inferior, salão lateral, circulação, escada, elevadores e núcleos técnicos; rampa e passagens excluídas.
- No SVG, apenas corrigidos os vãos das portas antes representados como parede contínua e quebrados os rótulos genéricos em duas linhas para evitar sobreposição. Demais geometria, bottom sheet, escala, identidade visual e dados das obras preservados; sem zoom ou dependências.
- Validação: 100 números únicos e sequenciais, 50 por área, alvos inteiros fora das zonas excluídas e sem colisões na largura mínima de 480px do mapa. Edge em 320px e 375px confirmou 44px, ausência de sobreposição/overflow da página e nomes internos ocultos; realizada inspeção visual.

## 2026-09-12 — rótulos públicos do 1º andar

- Substituídos os dois rótulos genéricos por SALA 1 (area-loja-14) e SALA 2 (area-escritorios), preservando os identificadores internos.
- Removidos os rótulos ELEVADOR e sua menção nas descrições acessíveis. Contornos arquitetônicos mantidos, conforme a restrição de não alterar a geometria.
- Adicionado apenas BANHEIROS junto ao núcleo sanitário do acesso, antes da escada, conforme a referência local. Sem PNE, metragens ou códigos.
- Atualizados SVG e texto alternativo em app.js; slots, bottom sheet, estilos e comportamento preservados. Conferidos XML e igualdade de todos os paths antes/depois.

## 2026-09-12 — identidade visual e zoom do mapa

- Aplicada a segunda versão do pedido ao cabeçalho: 2ª RIOS—REAIS, “Ideias para adiar o fim dos Rios”, CC-LADO B e INSTAGRAM ↗ para https://www.instagram.com/___ladob/, informado pelo usuário.
- Paleta invertida: fundo preto, linhas/textos/mapas brancos, tipografia seca e sem sombras, gradientes ou arredondamentos. Conferida a referência local RR26_Identidade.pdf. Mídias e cadastro das obras preservados; painel alterado apenas pelas cores.
- Adicionado js/map.js com controles −, percentual/reset e +, zoom de 100% a 600%, arraste por mouse ou um dedo e limites do container. 100% ajusta à largura e restaura o início da planta; conteúdo comprido continua com rolagem vertical. Sem pinch-to-zoom ou bibliotecas.
- Mantidos 100 slots e os metadados existentes, em uma única fileira por parede nas duas áreas principais. Números menores no enquadramento inicial e ampliados proporcionalmente com o mapa, conforme orientação posterior do usuário. Alvos com mínimo de 44px; na visão geral, quando próximos, o toque é resolvido pelo centro mais próximo antes de acionar a seleção existente.
- Arraste não seleciona obra. Zoom/arraste bloqueados enquanto o painel está aberto; troca de andar restaura o enquadramento. Acrescentadas alternativas de teclado e estado acessível do percentual.
- Verificação: sintaxe JS, 100 números sequenciais e fileira única por parede. Edge em 320x568, 375x812 e 960x900 aprovou paleta/cabeçalho/link, zoom proporcional, arraste real via eventos de mouse e toque, ausência de seleção durante arraste, reset, seleção e troca de andar. Realizada inspeção das capturas de tela.

## 2026-09-15 — navegação e exploração compartilhadas

- Criados header/sub-nav sticky com compactação sem deslocamento do conteúdo, modos MAPA/LISTA, seleção de andar e filtros combinados por área, tipo e tag. Lista agrupável por área abre a mesma ficha e compartilha filtros/seleção com o mapa.
- Acrescentados area, type e tags[] às obras mock, incluindo pintura, fotografia, colagem e escultura. Configuração dos slots e geometria do mapa preservadas.
- TENHO INTERESSE movido para rodapé fixo do painel expandido, sem fluxo de proposta. Gestos do bottom sheet preservados.
- Adicionado OUVIR ESTA TELA com início/parada, texto semântico do contexto atual e somente vozes locais via speechSynthesis; mensagem de indisponibilidade quando necessário. Sem serviços externos ou dependências.
- Edge em 320x568, 375x812 e 960x900: aprovados filtros/estados vazios, agrupamento, seleção entre modos, restauração de foco, zoom preservado, rodapé fixo e compactação sem salto. Integração de fala testada com síntese simulada para texto/voz local/cancelamento; API nativa confirmou voz local disponível. Reprodução audível em dispositivo físico não validada.

## 2026-09-15 — área útil, pinch e exploração por clusters

- Navegação e filtros reunidos na pilha sticky; mapa sem margens/painéis laterais ocupa a largura e altura restantes. ResizeObserver e visualViewport recalculam fit; telas baixas usam header compacto. Chevron recolhe/reabre opções sem perder filtros; zoom não as fecha.
- Substituído o zoom por um único estado de escala/posição com Pointer Events: pinch ancorado no ponto médio, pan limitado, botões/teclado e reset para a planta inteira. Em fit, gesto vertical permite compactar a navegação; scroll fora do mapa permanece nativo.
- Removidos somente os textos visíveis do SVG. Clusters por proximidade separam progressivamente os slots; miniaturas locais surgem a partir de 400% apenas nas obras individuais visíveis. Mantidos os 100 slots, coordenadas, cadastro e gestos do bottom sheet.
- Validação no Edge headless em 320×568, 375×812 e 812×375: área útil/overflow, filtros preservados ao ampliar, pinch e pan com eventos nativos de toque, estabilidade matemática do ponto sob os dedos, clusters, miniaturas sob demanda (6 na região testada, nenhuma em fit), ficha compartilhada e compactação/reabertura de filtros. Sintaxe JS e hashes de config.js/sheet.js conferidos. Teste em aparelho físico/iOS ainda não realizado.

## 2026-09-15 — correção específica do pan touch

- Pan passou a acumular diferenças reais entre clientX/clientY consecutivos, em pixels CSS, sem normalização, divisão por zoom ou sensibilidade artificial. Limites incidem somente na posição final; render continua em requestAnimationFrame, sem transição CSS no mapa.
- Captura no pointerdown e liberação no pointerup/pointercancel; estados de pan/pinch separados, com referência reinicializada no dedo restante. Preservado o toque em slots/clusters após captura. Escala, clustering, coordenadas, layout e bottom sheet não alterados.
- Edge com eventos nativos de toque emulados, larguras 320/375px: pan lento de 20/30px e rápido de 60/80px acompanharam os deltas 1:1; pinch terminou sem salto e dedo restante moveu 12/16px; arraste não selecionou obra e toque continuou ampliando cluster. Teste em celular físico ainda pendente.

## 2026-09-16 — navegação em coordenadas SVG e novo 100%

- Motor centralizado no SVG raiz: createSVGPoint/getScreenCTM().inverse() convertem os ponteiros; estado único { x, y, scale } transforma apenas g#map-content, incluindo planta e alvos. Pan sem normalização/divisão do delta, captura/liberação de ponteiros e retorno de pinch para um dedo sem salto.
- Novo 100% é fit-width, com reset para a largura disponível; a relação com o antigo percentual depende da proporção da tela. Pan funciona desde a escala base. Wheel no mapa aproxima/afasta ancorado no cursor, sem recolher filtros nem capturar scroll fora dele. Atualizadas as regras que descreviam o antigo fit da planta inteira.
- Clusters exibem quantidade maior e intervalo abaixo somente quando os slots são sequenciais; grupos não contíguos usam lista compacta, mantendo todos os números no nome acessível. Coordenadas, cadastro, geometria e bottom sheet preservados.
- Edge: larguras 320/375px com eventos nativos de toque emulados validaram fit-width, pan lento/rápido 1:1, âncora do pinch, retomada com um dedo e toque nos clusters. Desktop validou wheel nas duas direções e âncora no cursor; filtros abertos, grupos não contíguos e ficha compartilhada passaram. Sintaxe JS e captura visual conferidas. Mouse/toque físicos, especialmente iOS, ainda não testados.

- 2026-09-16: compactação do mapa controlada por sentinela + IntersectionObserver na zona sticky, com histerese e ancoragem automática desativada no modo mapa para evitar oscilações; retorno ao topo restaura header/sub-nav, sem alterar zoom/pan.
- Validado no Edge mobile em 320/375px, com ciclos de descida/retorno e toque emulado: estados estáveis e valores dos filtros preservados. Aparelho físico não testado.

- 2026-09-16: grid SVG fino inserido atrás da planta no mesmo grupo de pan/zoom; footer fixo com CC-LADO B, Instagram transferido do header e versão única APP_VERSION em config.js, exibida no rodapé e registrada no console.
- Altura real do footer reservada no mapa, lista e bottom sheet; Edge em 320/375px e paisagem validou grid acompanhando navegação, versão/log e ausência de sobreposição. Motor de zoom/pan e gestos do painel preservados.

- 2026-09-16: painel parcial recebeu fechamento “×” no canto superior direito (alvo de 44px) e ações VER MAIS / TENHO INTERESSE lado a lado na base; VER MAIS expande, interesse continua demonstrativo/desabilitado. Controles do estado expandido preservados.
- Edge em 320/375px e paisagem validou espaço das ações, expansão e fechamento removendo a seleção; conteúdo, zoom/pan e filtros não alterados.
- 2026-09-16: logo fornecida copiada de references/ para assets/ e aplicada como único conteúdo visível do header, com proporção preservada, tamanho compacto e alternativa textual para leitores de tela/OUVIR ESTA TELA; conferida visualmente no navegador.
- 2026-09-16: logo centralizada horizontalmente no header, nos estados normal e compacto, mantendo tamanho e proporção.

- 2026-09-16: filtros removidos integralmente da interface/estado; sub-nav sticky em linha única MAPA / LISTA | ANDAR 1 / 2 | OUVIR TELA, com separadores e estados ativos. Campos das obras e configuração dos andares preservados; regras atualizadas.
- Edge em 320/375/812px validou linha única normal/compacta, troca de modo/andar, 100 registros e início/parada de leitura com síntese simulada; mapa, zoom/pan, bottom sheet e footer não alterados.
- 2026-09-16: sub-nav ajustada ao esquema solicitado, com barras nas duas extremidades e entre grupos, mantendo espaçamento responsivo em uma linha.
- 2026-09-16: sub-nav distribui os três grupos por toda a largura com flex/space-between, padding lateral pequeno e respiro nos separadores; linha única e tamanhos dos controles preservados, sem mudanças de lógica.
- 2026-09-16: separadores da sub-nav convertidos em elementos independentes e flexíveis entre os três grupos; distribuição validada em uma linha a 320px.
- 2026-09-16: restaurado min-width de 90% nos botões de modo e andar; separadores independentes e distribuição horizontal preservados.
- 2026-09-16: separadores mantidos como itens flex fixos com margem lateral; pares de botões contidos em colunas, preservando min-width de 90% e linha única sem sobreposição em 320px.
- 2026-09-16: sub-nav passou a usar Grid de cinco colunas (três grupos iguais e dois separadores próprios), com grupos centralizados e largura total; botões e lógica preservados.
- 2026-09-16: régua de patrocinadores adicionada no fluxo normal logo após o container do mapa, com largura integral, proporção preservada e espaço inferior para o footer fixo; permanece fora do SVG e do zoom/pan.
- 2026-09-16: régua movida para faixa fixa acima do footer de versão/local/Instagram; alturas medidas das duas faixas reservadas no mapa e bottom sheet. APP_VERSION atualizado para 2026.09.16-1514 (padrão YYYY.MM.DD-HHMM).
- 2026-09-16: controles de zoom centralizados no topo do mapa com largura limitada ao container; altura visual reduzida e alvos de toque de 40×36px, eliminando o min-width herdado que causava overflow.


## 2026-09-16 — interação dos clusters

- O toque em um cluster abre diretamente um leque reposicionado dentro do mapa; cada número seleciona a obra no bottom sheet existente. Toque externo, Escape, troca de cluster ou andar fecham o leque, sem alterar agrupamento ou zoom/pan. Sintaxe JS validada; teste visual/touch no navegador permanece pendente.

## 2026-09-16 — estrutura espacial do 1º andar

- Estrutura interna atualizada para Áreas 1–5 e níveis main/mezzanine, com faixas paralelas reservadas nas Áreas 1–3. As 100 coordenadas de slots foram preservadas sem alteração.
- SVG mantém a geometria estrutural confirmada pela planta local e corrige a entrada para o topo; elementos funcionais ficam em metadados internos, sem rótulos no mapa. Sintaxe JS, XML e vínculos area/level validados.

## 2026-09-16 — mapa atual do 1º andar

- SVG corrigido conforme o rascunho local: entrada superior, circulação pelo lado direito, ambientes inferiores sem espelhamento e mezanino visível como três faixas hachuradas com paredes paralelas. Proporções apoiadas na planta arquitetônica disponível; slots e interações preservados.

## 2026-09-16 — base estrutural do 2º andar

- maps/andar-2.svg substituído por base vertical baseada no PDF v9: entrada/escada no canto inferior direito, primeira sala, segunda sala, sala de vidro, blocos e circulação. Zonas 01–06, 07–14 e 15 preparadas sem criar slots ou interações.

## 2026-09-16 — editor local de posições

- Adicionado modo ?edit=1 para alternar entre navegação e posicionamento no 1º andar, selecionar/mover obras em coordenadas SVG, persistir no localStorage e exportar id/x/y/level. A página pública permanece sem controles de edição.
- Edge headless em 375×812 validou isolamento público, seleção da obra 01, deslocamento, 100 registros persistidos e igualdade entre coordenadas exportadas e a conversão pelo CTM do SVG.

## 2026-09-16 — percurso provisório das obras do 1º andar

- Reorganizados somente os 100 slots em config.js: Sala 1 ocupa 01–53, iniciando no canto superior direito, passando pela parede atrás do DJ e continuando no mezanino separado; Sala 2 ocupa 54–100 pelas paredes inferiores.
- Numeração sequencial, contagens, ausência de coordenadas duplicadas e vínculos main/mezzanine validados. SVG, zoom, UI e js/data.js permaneceram inalterados.

## 2026-09-16 — posições externas por andar

- Posições dos andares 1 e 2 passam a ser lidas de data/positions-floor-1.json e data/positions-floor-2.json, com fallback integral para config.js em ausência ou conteúdo inválido. O arquivo do 1º andar contém os 100 pontos atuais; o 2º permanece vazio.
- O editor local agora persiste e exporta positions-floor-1.json como objeto indexado por id, contendo somente x, y e level. Sintaxe, carregamento válido e fallback inválido foram verificados.

## 2026-09-16 — menu do editor e zoom reduzido

- Menu de ?edit=1 movido para a pilha sticky acima do header, fora do mapa. Zoom mínimo reduzido a 20% para botões, wheel e pinch; limites centralizam o mapa quando ele cabe na viewport e reset continua em 100%.
- Edge headless em 320×720 confirmou menu acima do logo sem cobrir o mapa, mínimo de 20% e reset para 100%.


## 2026-09-16 — acesso temporário ao editor e créditos

- Adicionado EDITAR MAPA no footer; em ?edit=1, o painel completo substitui header/sub-nav e oferece SAIR DO EDITOR. Footer mantém build e régua, com créditos e links externos de Lado B e NebulaDevs.
- REMOVER botão/modo de acesso ao editor antes da versão final pública.


## 2026-09-16 — posições atualizadas do mapa

- Aplicadas as 100 posições enviadas em data/positions-floor-1.json e sincronizado o fallback de config.js para uso direto/local; numeração 01–100 e 13 posições de mezanino validadas.


## 2026-09-16 — cache local do editor

- O editor remove a chave antiga do localStorage e usa uma nova chave para edições futuras; as posições publicadas no JSON deixam de ser sobrescritas pelo cache anterior.


## 2026-09-16 — geometria da rampa e do mezanino

- Rampa alinhada verticalmente entre as obras 10 e 12; faixas laterais do mezanino passam a iniciar no alinhamento da obra 10. Posições das obras e demais elementos foram preservados.


## 2026-09-16 — nova invalidação do cache do editor

- Removidas as chaves locais anteriores e criada a chave v3; ao recarregar ?edit=1, o editor parte novamente das posições atuais do JSON.


## 2026-09-16 — publicação das posições exportadas

- O fallback público/local foi sincronizado integralmente com o novo data/positions-floor-1.json exportado pelo editor; as 100 posições agora coincidem também fora de ?edit=1.


## 2026-09-16 — conexão entre as salas

- Alinhadas em x=310 as paredes direitas das Salas 1 e 2 e mantida a passagem pela direita abaixo do mezanino; Sala 2 recebeu faixas de mezanino nas laterais e base, e o bloco esquerdo da entrada foi unificado.
- Apenas os 51 slots das paredes direitas afetadas foram deslocados +30 unidades SVG, preservando altura, número, nível e distância relativa às paredes; JSON e fallback foram sincronizados.


## 2026-09-16 — vão aberto entre as salas

- Removidos os traços que fechavam a passagem pela direita entre Sala 1 e Sala 2; o vão permanece abaixo do mezanino, com paredes alinhadas e demais geometrias e posições preservadas.


## 2026-09-16 — nova publicação das posições

- Sincronizadas as 100 posições recém-exportadas do 1º andar com o fallback público/local; cache v3 do editor invalidado e nova chave v4 preparada para edições futuras.


## 2026-09-16 — 87 obras e alinhamento da Sala 2

- Partindo do JSON mais recente, 54–69 foram alinhadas em x=270 e espaçadas igualmente de y=605,27 a y=1086,87; o topo do bar foi estendido à altura da 69.
- Posições, slots e dados mock acima de 87 removidos sem renumeração; JSON oficial e fallback local conferidos com 87 entradas idênticas.


## 2026-09-16 — correção das posições 54–69

- Desfeita a redistribuição automática de 54–69: as coordenadas exportadas pelo usuário foram restauradas integralmente. As demais posições, o limite de 87 obras e a geometria do bar foram preservados; fallback sincronizado.


## 2026-09-16 — atualização das posições exportadas

- As 87 posições mais recentes do JSON oficial foram sincronizadas com o fallback público/local; cache v4 invalidado e chave v5 preparada para novas edições.


## 2026-09-16 — representação curva da rampa

- A seta foi removida e a rampa passou a usar um perfil curvo esquemático, encostando nas paredes esquerda e direita dentro da mesma faixa vertical. Obras e demais elementos foram preservados.


## 2026-09-16 — dados textuais das obras

- Integrado data/works-floor-1.json por id às 87 posições do 1º andar. Lista e bottom sheet usam artist, title, description, saleStatus e price e omitem campos vazios; placeholders e áudio atuais foram preservados.


## 2026-09-16 — dados das obras em execução local

- Adicionado espelho local gerado do JSON para contornar o bloqueio de fetch em file://; as 87 obras agora carregam ao abrir index.html diretamente, mantendo works-floor-1.json como fonte oficial.


## 2026-09-16 — fallback local unificado

- Criado tools/sync-local-data.ps1 para gerar data/local-data.generated.js a partir de todos os JSONs de runtime. Posições e obras usam LOCAL_DATA em file:// e como fallback de fetch; fallback específico anterior removido.


## 2026-09-16 — mapeamento corrigido das obras

- Validado o JSON corrigido do 1º andar com 87 IDs da Column 14 da aba Respostas ao formulário 1 (1–53 Sala 1; 54–87 Sala 2); fallback local regenerado, sem alterar posições ou geometria.


## 2026-09-17 — imagens das obras do 1º andar

- Criado tools/sync-images.ps1 e movido o manifesto para data/import. Foram baixadas e validadas 66 imagens; 12 fontes nulas foram ignoradas e 9 respostas sem formato de imagem foram rejeitadas.
- works-floor-1.json recebeu caminhos apenas para arquivos existentes e image=null nas outras 21 obras; fallback local regenerado. A UI preserva a área vazia quando não há imagem.


## 2026-09-17 — geometria oficial do 1º andar

- Registrada a edição manual atual de maps/andar-1.svg como fonte oficial; próximas alterações interativas devem partir dela. SVG preservado sem modificações.


## 2026-09-17 — rodapé desktop

- No desktop, régua e faixa de versão ficam limitadas juntas a 100px, com SVG contido sem distorção/overflow; medição existente reserva a altura real para o mapa. Mobile preservado.


## 2026-09-17 — rodapé, posições e legendas

- Removido o link público EDITAR MAPA, preservando ?edit=1; régua e créditos centralizados, mantendo o limite desktop de 100px.
- JSON atual de posições sincronizado para file:// e aplicado integralmente ao 1º andar; BAR (dois pontos) e BANHEIROS aparecem em camada interativa sem modificar maps/andar-1.svg.


## 2026-09-17 — remoção do versionamento visível

- Removidos o número de versão do rodapé e o registro APP_VERSION no console; medição do rodapé e reserva de espaço do mapa preservadas.


## 2026-09-17 — largura dos botões de andar

- O seletor ANDAR agora preenche a largura disponível do seu grupo; 1 e 2 ocupam colunas iguais, com "min-width: 90%" e separadores preservados.

## 2026-09-17 — mapa do 2º andar

- Legendas PISTA DE SKATE e SOM / DJ sobrepostas ao mapa interativo do 1º andar, sem alterar o SVG oficial.
- Os 15 marcadores do 2º andar foram transcritos do mapa impresso v10 para positions-floor-2.json; troca de andar agora ajusta mapa, slots e zoom à altura de cada planta. Fallback local sincronizado.

## 2026-09-17 — clusters circulares

- Cluster fechado mostra apenas a quantidade; aberto usa o centro como botão × e distribui os números em círculos dentro da viewport, com camadas adicionais conforme necessário.

## 2026-09-17 — posições atualizadas

- Sincronizadas as 15 posições alteradas do 1º andar a partir do JSON oficial; cache anterior do editor invalidado para não sobrepor os novos pontos.


## 2026-09-17 — catálogo e mídias do 1º andar

- Validado o catálogo 1–88; manifest de imagens consolidado e import temporário removido. 66 imagens locais vinculadas; 9 fontes faltantes são PDFs, sem arquivo de imagem válido.
- Manifest de áudio e sincronizador adicionados; 73 links exigem login no Drive, então nenhum áudio foi salvo e o bloco de audiodescrição fica oculto. Fallback local sincronizado; obra 88 aparece na lista, aguardando coordenada no mapa.

## 2026-09-17 — obra 88 e interesse

- Obra 88 posicionada junto da 53 no mezanino; as 87 coordenadas anteriores foram preservadas e o fallback local sincronizado.
- TENHO INTERESSE ativo nos estados parcial e expandido, abrindo WhatsApp em nova aba com mensagem montada pelos dados disponíveis.

## 2026-09-17 — leitura opcional

- A seção LEITURA e sua menção em OUVIR TELA ficam ocultas quando o campo está vazio; conteúdo futuro continua sendo exibido normalmente.


## 2026-09-17 — remoção da leitura fictícia

- Removidos os três textos de leitura mock; sem leitura real, a seção permanece oculta. O campo continua disponível nos dados oficiais para conteúdo futuro.

## 2026-09-17 — imagens das obras 11 e 88

- Imagens locais renomeadas e vinculadas às obras 11 e 88; fallback local sincronizado, sem alterações nos demais registros.

## 2026-09-17 — cabeçalho da ficha

- O cabeçalho do bottom sheet agora acompanha a altura do conteúdo, sem reservar altura fixa.

## 2026-09-17 — audiodescrições locais

- 73 áudios válidos importados do manifesto oficial em OGA/OGG/M4A/MP3/WAV e vinculados às obras; 15 obras sem fonte permanecem sem áudio. Fallback local sincronizado.

## 2026-09-17 — espaçamento da ficha reduzida

- Removido apenas o padding inferior do cabeçalho no estado parcial; o estado expandido mantém o espaçamento anterior.

## 2026-09-17 — altura do painel reduzido

- O conteúdo completo oculto sai do fluxo no estado parcial; o painel reduzido termina após o resumo, mantendo o estado expandido e sua rolagem.

## 2026-09-17 — respiro da ficha reduzida

- Removido o ajuste extra de padding do cabeçalho parcial; permanece o espaçamento padrão da ficha.

## 2026-09-17 — repaint dos pontos no iOS

- Estabilizada a composição dos números dentro do foreignObject no WebKit touch, sem alterar pan/zoom, posições ou desktop.
