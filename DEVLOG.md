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
