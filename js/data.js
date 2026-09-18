"use strict";

// Conteúdo fictício local; a futura exportação manterá o vínculo andar + slot.
(() => {
  const samples = [
    {
      title: "Linhas em encontro", artist: "Ana — artista fictícia",
      description: "Estudo fictício de linhas que se cruzam em um espaço vazio. Imagem provisória para testar o painel.",
      image: "obras/imagens/mock-linhas.svg", imageAlt: "Imagem mock com três linhas diagonais pretas sobre fundo branco."
    },
    {
      title: "Intervalos", artist: "Bruno — artista fictício",
      description: "Composição fictícia de três retângulos. As distâncias entre as formas organizam o ritmo desta obra de teste.",
      image: "obras/imagens/mock-intervalos.svg", imageAlt: "Imagem mock com três retângulos de contorno preto e larguras diferentes."
    },
    {
      title: "Percurso aberto", artist: "Clara — artista fictícia",
      description: "Trajeto fictício construído com segmentos horizontais e verticais. Material provisório, sem relação com o acervo definitivo.",
      image: "obras/imagens/mock-percurso.svg", imageAlt: "Imagem mock com uma linha preta formando um percurso em degraus."
    }
  ];
  window.EXHIBITION_DATA = Array.from({ length: 87 }, (_, index) => ({
    floor: 1, slot: index + 1,
    area: window.EXHIBITION_CONFIG.floors[0].slots[index].areaId,
    level: window.EXHIBITION_CONFIG.floors[0].slots[index].level,
    type: ["pintura", "fotografia", "colagem", "escultura"][index % 4],
    tags: index % 2 ? ["memória", "cidade"] : ["rios", "natureza"],
    ...samples[index % samples.length],
    reading: null,
    audio: "obras/audio/mock-sinal.wav"
  }));
  // Identificações transcritas do mapa impresso do 2º andar; coordenadas ficam no JSON.
  window.EXHIBITION_DATA.push(...[["Ventura Profana","SEM SENHOR"],["Tetê Lian","Corrente"],["Augusto Malta","Jatos d’água para remoção de terra..."],["Murillo Marques","150"],["Marcos Chaves","Norte/Sul"],["Alexandre Baltazar","Viajo porque preciso, volto porque te amo"],["Fujioka","Mantra Anal"],["Fujioka","Mantra da Boneca"],["Fujioka","Sortilégio do Amor"],["Patricia Ruth","As ruas pelas quais passei"],["Loren Minzú","substância-miragem"],["Jéssica Senra","Sol de Meio Dia"],["Laryssa Machada","Que longas distâncias a fertilidade precisa percorrer..."],["Wiki Pirela",null],["Rivane Neuenschwander + Cao Guimarães","O inquilino"]].map(([artist, title], index) => ({
    floor: 2, slot: index + 1,
    area: index < 6 ? "andar-2-primeira-sala" : index < 14 ? "andar-2-segunda-sala" : "andar-2-sala-vidro",
    level: "main", artist, title, description: null, saleStatus: null, price: null,
    image: null, reading: "", audio: "", type: null, tags: []
  })));
})();

