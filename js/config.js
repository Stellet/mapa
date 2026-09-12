"use strict";

// Sistema oficial: coordenadas do SVG vertical 360 x 1780.
// Áreas e faixas são metadados internos; seus nomes não aparecem na interface.
(() => {
  const areas = [
    {
      id: "area-loja-14",
      bounds: { left: 40, top: 40, right: 280, bottom: 620 },
      // Faixa inteira reservada às portas da entrada principal (antigos 45–50).
      exclusions: [
        { kind: "entrada-portas", left: 40, top: 40, right: 280, bottom: 110 },
        { kind: "elevador", left: 40, top: 90, right: 100, bottom: 140 },
        { kind: "rampa", left: 215, top: 220, right: 280, bottom: 305 }
      ]
    },
    {
      id: "area-escritorios",
      bounds: { left: 40, top: 620, right: 280, bottom: 1220 },
      exclusions: [
        { kind: "passagem-e-elevador", left: 40, top: 620, right: 130, bottom: 790 },
        { kind: "deposito", left: 205, top: 1135, right: 280, bottom: 1220 },
        { kind: "circulacao-acesso", left: 40, top: 1160, right: 280, bottom: 1220 }
      ]
    }
  ];
  const positions = [];
  function point(areaId, wallId, x, y) {
    positions.push({ areaId, wallId, x, y });
  }
  // Uma única fileira por parede; o zoom amplia as distâncias sem deslocar as obras.
  function wall(areaId, wallId, x1, y1, x2, y2, count) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      point(areaId, wallId, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
  }
  const loja = "area-loja-14";
  wall(loja, "parede-esquerda", 64, 160, 64, 584, 24);
  wall(loja, "divisoria", 136, 604, 256, 604, 7);
  wall(loja, "parede-direita", 256, 568, 256, 328, 14);
  wall(loja, "parede-direita", 256, 200, 256, 128, 5);

  const escritorios = "area-escritorios";
  wall(escritorios, "divisoria", 148, 644, 256, 644, 4);
  wall(escritorios, "parede-direita", 256, 680, 256, 1112, 26);
  wall(escritorios, "parede-esquerda", 64, 1136, 64, 812, 20);
  window.EXHIBITION_CONFIG = {
    initialFloor: 1,
    floors: [
      { id: 1, map: "maps/andar-1.svg", realMap: true, areas,
        slots: positions.map(({ areaId, wallId, x, y }, index) => ({
          number: index + 1, areaId, wallId,
          x: x / 360 * 100,
          y: y / 1780 * 100
        }))
      },
      { id: 2, map: "maps/andar-2.svg", slots: [] },
      { id: 3, map: "maps/andar-3.svg", slots: [] }
    ]
  };
})();


