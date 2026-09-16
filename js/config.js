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
  function point(roomId, areaId, level, wallId, x, y) {
    positions.push({ roomId, areaId, level, wallId, x, y });
  }
  function wall(roomId, areaId, level, wallId, x1, y1, x2, y2, count) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      point(roomId, areaId, level, wallId, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
    }
  }

  // Sala 1 — 01 começa no canto superior direito e percorre o perímetro principal.
  wall("sala-1", "area-1", "main", "direita-superior", 268, 130, 268, 550, 14);
  // 15–26 ficam na parede transversal atrás do DJ.
  wall("sala-1", "area-2", "main", "transversal-atras-dj", 235, 617, 55, 617, 12);
  wall("sala-1", "area-3", "main", "esquerda-superior", 52, 550, 52, 130, 14);

  // Continuação do percurso no nível visual separado do mezanino.
  wall("sala-1", "area-3", "mezzanine", "mezanino-esquerda", 84, 130, 84, 530, 5);
  wall("sala-1", "area-2", "mezzanine", "mezanino-transversal", 90, 561, 225, 561, 4);
  wall("sala-1", "area-1", "mezzanine", "mezanino-direita", 236, 530, 236, 130, 4);

  // Sala 2 — 54 inicia no alto à direita e segue as duas paredes disponíveis.
  wall("sala-2", "area-4", "main", "direita-inferior", 268, 770, 268, 1325, 24);
  wall("sala-2", "area-5", "main", "esquerda-inferior", 52, 1450, 52, 805, 23);
  window.EXHIBITION_CONFIG = {
    initialFloor: 1,
    floors: [
      { id: 1, map: "maps/andar-1.svg", realMap: true, levels, areas, mezzanineTracks, features,
        slots: positions.map(({ roomId, areaId, level, wallId, x, y }, index) => ({
          number: index + 1, roomId, areaId, level, wallId,
          x: x / 360 * 100,
          y: y / 1780 * 100
        }))
      },
      { id: 2, map: "maps/andar-2.svg", viewBox: "0 0 360 992",
        source: "references/mapa_2o_andar_rios_reais_v9_qr.pdf",
        areas: [
          { id: "andar-2-primeira-sala", plannedWorks: [1, 2, 3, 4, 5, 6] },
          { id: "andar-2-segunda-sala", plannedWorks: [7, 8, 9, 10, 11, 12, 13, 14] },
          { id: "andar-2-sala-vidro", plannedWorks: [15] }
        ],
        features: [
          { id: "entrada", position: "bottom-right" },
          { id: "escada", position: "bottom-right" },
          { id: "circulacao", connects: ["andar-2-primeira-sala", "andar-2-segunda-sala", "andar-2-sala-vidro"] }
        ],
        slots: []
      },
      { id: 3, map: "maps/andar-3.svg", slots: [] }
    ]
  };
})();