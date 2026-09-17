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
  // Fallback local sincronizado com data/positions-floor-1.json.
  const updatedPositions = {
    1: [263.51, 73.23, "main"],
    2: [246.93, 82.06, "main"],
    3: [265.28, 95.69, "main"],
    4: [255.64, 109.93, "main"],
    5: [263.73, 126.83, "main"],
    6: [241.71, 136.05, "main"],
    7: [263.84, 149.99, "main"],
    8: [243.61, 159.89, "main"],
    9: [265.17, 174.26, "main"],
    10: [256.54, 200.13, "main"],
    11: [266.25, 234.84, "main"],
    12: [270.94, 294.48, "main"],
    13: [270.27, 315.25, "main"],
    14: [270.94, 334.01, "main"],
    15: [270.8, 348.55, "main"],
    16: [268.93, 365.5, "main"],
    17: [268.46, 384.07, "main"],
    18: [269.86, 403.71, "main"],
    19: [269.39, 424.74, "main"],
    20: [269.86, 442.97, "main"],
    21: [267.99, 464.81, "main"],
    22: [268.43, 485.79, "main"],
    23: [270.22, 504.99, "main"],
    24: [269.77, 525.52, "main"],
    25: [269.77, 546.06, "main"],
    26: [269.33, 564.81, "main"],
    27: [236.74, 563.92, "main"],
    28: [214.41, 564.37, "main"],
    29: [192.54, 566.15, "main"],
    30: [174.53, 566.71, "main"],
    31: [157.64, 565.14, "main"],
    32: [139.96, 566.71, "main"],
    33: [121.11, 565.14, "main"],
    34: [104.61, 565.14, "main"],
    35: [85.76, 565.14, "main"],
    36: [76.15, 547.44, "main"],
    37: [77.12, 518.46, "main"],
    38: [79.77, 488.98, "main"],
    39: [81.41, 463.38, "main"],
    40: [79.77, 434.37, "main"],
    41: [81.2, 407.78, "mezzanine"],
    42: [81.2, 384.06, "mezzanine"],
    43: [81.2, 356.76, "mezzanine"],
    44: [79.05, 331.6, "mezzanine"],
    45: [80.48, 309.33, "mezzanine"],
    46: [78.33, 284.9, "mezzanine"],
    47: [78.87, 205.21, "mezzanine"],
    48: [72.52, 177.39, "mezzanine"],
    49: [71.63, 147.31, "mezzanine"],
    50: [72.52, 118.12, "mezzanine"],
    51: [139.41, 65.03, "mezzanine"],
    52: [179.81, 57.96, "mezzanine"],
    53: [165.85, 547.71, "mezzanine"],
    54: [291.92, 605.27, "main"],
    55: [292.83, 629.93, "main"],
    56: [290.9, 716.04, "main"],
    57: [291.93, 665.64, "main"],
    58: [268, 866.52, "main"],
    59: [269.7, 785.98, "main"],
    60: [268, 914.78, "main"],
    61: [268, 938.91, "main"],
    62: [271.18, 1023.14, "main"],
    63: [272.66, 1076.5, "main"],
    64: [268.22, 1152.09, "main"],
    65: [269.7, 1233.62, "main"],
    66: [272.66, 1284.01, "main"],
    67: [109.62, 1295.87, "main"],
    68: [105.17, 1254.37, "main"],
    69: [87.38, 1086.87, "main"],
    70: [88.86, 1024.62, "main"],
    71: [90.35, 929.76, "main"],
    72: [87.38, 879.36, "main"],
    73: [91.83, 815.62, "main"],
    74: [139.6, 711.46, "main"],
    75: [299.54, 238.09, "main"],
    76: [301.15, 327.44, "main"],
    77: [301.96, 411.96, "main"],
    78: [301.15, 500.5, "main"],
    79: [219.23, 595.24, "main"],
    80: [156.33, 596.54, "main"],
    81: [98.64, 598.6, "main"],
    82: [48.41, 508.55, "main"],
    83: [49.21, 449.79, "main"],
    84: [49.21, 393.45, "main"],
    85: [48.41, 318.59, "main"],
    86: [45.99, 262.24, "main"],
    87: [168.7, 242.12, "main"],
  };
  for (const [id, [x, y, level]] of Object.entries(updatedPositions)) {
    Object.assign(positions[Number(id) - 1], { x, y, level });
  }
  window.EXHIBITION_CONFIG = {
    initialFloor: 1,
    floors: [
      { id: 1, map: "maps/andar-1.svg", realMap: true, levels, areas, mezzanineTracks, features,
        slots: positions.slice(0, 87).map(({ roomId, areaId, level, wallId, x, y }, index) => ({
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