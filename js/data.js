"use strict";

// Conteúdo fictício local; a futura exportação manterá o vínculo andar + slot.
(() => {
  const samples = [
    {
      title: "Linhas em encontro", artist: "Ana — artista fictícia",
      description: "Estudo fictício de linhas que se cruzam em um espaço vazio. Imagem provisória para testar o painel.",
      image: "obras/imagens/mock-linhas.svg", imageAlt: "Imagem mock com três linhas diagonais pretas sobre fundo branco.",
      reading: "As linhas partem de pontos diferentes e encontram um caminho comum. Observe os intervalos e imagine outras continuidades. Texto de leitura demonstrativo."
    },
    {
      title: "Intervalos", artist: "Bruno — artista fictício",
      description: "Composição fictícia de três retângulos. As distâncias entre as formas organizam o ritmo desta obra de teste.",
      image: "obras/imagens/mock-intervalos.svg", imageAlt: "Imagem mock com três retângulos de contorno preto e larguras diferentes.",
      reading: "O vazio também participa da composição. Percorra cada intervalo com o olhar, da esquerda para a direita. Que relações aparecem entre as formas? Esta leitura é apenas um exemplo para validar a troca de conteúdo."
    },
    {
      title: "Percurso aberto", artist: "Clara — artista fictícia",
      description: "Trajeto fictício construído com segmentos horizontais e verticais. Material provisório, sem relação com o acervo definitivo.",
      image: "obras/imagens/mock-percurso.svg", imageAlt: "Imagem mock com uma linha preta formando um percurso em degraus.",
      reading: "Um caminho pode mudar de direção sem perder a continuidade. Acompanhe as mudanças do percurso e pense em seus próprios deslocamentos. Texto demonstrativo para o wireframe."
    }
  ];
  window.EXHIBITION_DATA = Array.from({ length: 100 }, (_, index) => ({
    floor: 1, slot: index + 1,
    area: window.EXHIBITION_CONFIG.floors[0].slots[index].areaId,
    type: ["pintura", "fotografia", "colagem", "escultura"][index % 4],
    tags: index % 2 ? ["memória", "cidade"] : ["rios", "natureza"],
    ...samples[index % samples.length],
    audio: "obras/audio/mock-sinal.wav"
  }));
})();

