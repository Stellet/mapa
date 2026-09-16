"use strict";

const APP_VERSION = "2026.09.16-1514";
console.info("APP_VERSION", APP_VERSION);

// Sistema oficial: coordenadas do SVG vertical 360 x 1780.
// Áreas, níveis e faixas são metadados internos; não são desenhados como rótulos no mapa.
(() => {
  const levels = [
    { id: "main" },
    { id: "mezzanine", aboveAreas: ["area-1", "area-2", "area-3"] }
  ];
  const areas = [
    { id: "area-3", side: "left", section: "upper", levels: ["main", "mezzanine"] },
    { id: "area-1", side: "right", section: "upper", levels: ["main", "mezzanine"] },
    { id: "area-2", side: "transverse", section: "upper-lower", levels: ["main", "mezzanine"] },
    { id: "area-5", side: "left", section: "lower", levels: ["main"] },
    { id: "area-4", side: "right", section: "lower", levels: ["main"] }
  ];
  // Segunda linha paralela reservada para o mezanino; coordenadas definitivas ainda não atribuídas.
  const mezzanineTracks = ["area-1", "area-2", "area-3"].map(areaId => ({
    areaId, level: "mezzanine", parallelTo: areaId + "-main"
  }));
  const features = [
    { id: "entrada", position: "top" },
    { id: "rampa-skate", position: "center-upper", areas: ["area-1", "area-2", "area-3"] },
    { id: "som-dj", areaId: "area-2" },
    { id: "bar", side: "left", belowArea: "area-5" },
    { id: "escada-andar-2", position: "bottom-left" },
    { id: "banheiros", position: "bottom-right" }
  ];

  const positions = [];
  function point(areaId, wallId, x, y) {
    const number = positions.length + 1;
    // Classificação provisória; a posição física das obras no mezanino será definida depois.
    const level = (number >= 13 && number <= 24) ||
      (number >= 28 && number <= 31) ||
      (number >= 41 && number <= 45) ||
      number === 50 ||
      (number >= 53 && number <= 54) ? "mezzanine" : "main";
    positions.push({ areaId, level, wallId, x, y });
  }
  // Os sete segmentos originais permanecem idênticos para preservar todos os x/y.
  function wall(areaId, wallId, x1, y1, x2, y2, count) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      point(areaId, wallId, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
  }
  wall("area-3", "parede-esquerda", 64, 160, 64, 584, 24);
  wall("area-2", "parede-transversal", 136, 604, 256, 604, 7);
  wall("area-1", "parede-direita", 256, 568, 256, 328, 14);
  wall("area-1", "parede-direita", 256, 200, 256, 128, 5);
  wall("area-2", "parede-transversal", 148, 644, 256, 644, 4);
  wall("area-4", "parede-direita", 256, 680, 256, 1112, 26);
  wall("area-5", "parede-esquerda", 64, 1136, 64, 812, 20);  window.EXHIBITION_CONFIG = {
    initialFloor: 1,
    floors: [
      { id: 1, map: "maps/andar-1.svg", realMap: true, levels, areas, mezzanineTracks, features,
        slots: positions.map(({ areaId, level, wallId, x, y }, index) => ({
          number: index + 1, areaId, level, wallId,
          x: x / 360 * 100,
          y: y / 1780 * 100
        }))
      },
      { id: 2, map: "maps/andar-2.svg", slots: [] },
      { id: 3, map: "maps/andar-3.svg", slots: [] }
    ]
  };
})();