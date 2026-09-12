"use strict";

// Coordenadas na planta vertical exibida (viewBox 360 x 1780).
// Percurso provisório ao longo das paredes, começando no acesso inferior.
// A lista pode ser substituída por posições curatoriais reais, sem alterar obras.
(() => {
  const positions = [];
  function wall(x1, y1, x2, y2, count) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      positions.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
    }
  }
  wall(252, 1660, 252, 1372, 9); // Acesso.
  wall(194, 1336, 194, 1192, 5); // Contorna o núcleo junto à escada.
  wall(64, 1156, 64, 800, 11); // Parede esquerda do ambiente central.
  wall(112, 764, 112, 692, 3); // Contorno do elevador.
  wall(64, 656, 64, 80, 17); // Passagem e ambiente superior.
  wall(100, 80, 244, 80, 5);
  wall(256, 116, 256, 584, 14);
  wall(220, 596, 148, 596, 3); // Faces da divisão central.
  wall(148, 644, 256, 644, 4);
  wall(256, 680, 256, 1076, 12);
  positions.push([256, 1112], [200, 1112], [200, 1156], [140, 1196], [104, 1196], [68, 1236]);
  wall(64, 1272, 64, 1452, 6); // Salão lateral.
  positions.push([100, 1476]);
  wall(136, 1440, 136, 1332, 4);

  // Desvios locais junto ao elevador superior e à rampa existente.
  for (const point of positions) {
    if (point[0] === 64 && point[1] === 116) point[0] = 112;
    if (point[0] === 256 && point[1] >= 224 && point[1] <= 296) point[0] = 208;
  }

  window.EXHIBITION_CONFIG = {
    initialFloor: 1,
    floors: [
      { id: 1, map: "maps/andar-1.svg", realMap: true, slots: positions.map(([x, y], index) => ({
        number: index + 1,
        x: x / 360 * 100,
        y: y / 1780 * 100
      })) },
      { id: 2, map: "maps/andar-2.svg", slots: [] },
      { id: 3, map: "maps/andar-3.svg", slots: [] }
    ]
  };
})();

