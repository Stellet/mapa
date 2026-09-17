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
    1: [293.51, 73.23, "main"],
    2: [276.93, 82.06, "main"],
    3: [295.28, 95.69, "main"],
    4: [285.64, 109.93, "main"],
    5: [293.73, 126.83, "main"],
    6: [271.71, 136.05, "main"],
    7: [293.84, 149.99, "main"],
    8: [273.61, 159.89, "main"],
    9: [295.17, 174.26, "main"],
    10: [286.54, 200.13, "main"],
    11: [274.33, 233.19, "main"],
    12: [272.15, 292.19, "main"],
    13: [273.15, 313.24, "main"],
    14: [272.17, 333.07, "main"],
    15: [272.8, 351.27, "main"],
    16: [273.37, 366.65, "main"],
    17: [274.96, 386.27, "main"],
    18: [274.37, 404.31, "main"],
    19: [276.02, 423.38, "main"],
    20: [277.61, 445.12, "main"],
    21: [277.08, 464.74, "main"],
    22: [276.02, 486.48, "main"],
    23: [274.96, 507.69, "main"],
    24: [274.96, 526.25, "main"],
    25: [275.49, 547.99, "main"],
    26: [272.35, 568.56, "main"],
    27: [224.81, 563.57, "main"],
    28: [207.53, 566.71, "main"],
    29: [190.24, 565.53, "main"],
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
    47: [87.84, 217.47, "mezzanine"],
    48: [72.52, 177.39, "mezzanine"],
    49: [71.63, 147.31, "mezzanine"],
    50: [72.52, 118.12, "mezzanine"],
    51: [138.87, 66.8, "mezzanine"],
    52: [174.26, 61.49, "mezzanine"],
    53: [344.73, 525.11, "mezzanine"],
    54: [298, 770, "main"],
    55: [298, 794.13, "main"],
    56: [298, 818.26, "main"],
    57: [298, 842.39, "main"],
    58: [298, 866.52, "main"],
    59: [298, 890.65, "main"],
    60: [298, 914.78, "main"],
    61: [298, 938.91, "main"],
    62: [298, 963.04, "main"],
    63: [298, 987.17, "main"],
    64: [298, 1011.3, "main"],
    65: [298, 1035.43, "main"],
    66: [298, 1059.57, "main"],
    67: [298, 1083.7, "main"],
    68: [298, 1107.83, "main"],
    69: [298, 1131.96, "main"],
    70: [298, 1156.09, "main"],
    71: [298, 1180.22, "main"],
    72: [298, 1204.35, "main"],
    73: [298, 1228.48, "main"],
    74: [298, 1252.61, "main"],
    75: [298, 1276.74, "main"],
    76: [298, 1300.87, "main"],
    77: [298, 1325, "main"],
    78: [52, 1450, "main"],
    79: [52, 1420.68, "main"],
    80: [52, 1391.36, "main"],
    81: [52, 1362.05, "main"],
    82: [52, 1332.73, "main"],
    83: [52, 1303.41, "main"],
    84: [52, 1274.09, "main"],
    85: [52, 1244.77, "main"],
    86: [52, 1215.45, "main"],
    87: [52, 1186.14, "main"],
    88: [52, 1156.82, "main"],
    89: [52, 1127.5, "main"],
    90: [52, 1098.18, "main"],
    91: [52, 1068.86, "main"],
    92: [52, 1039.55, "main"],
    93: [52, 1010.23, "main"],
    94: [52, 980.91, "main"],
    95: [52, 951.59, "main"],
    96: [52, 922.27, "main"],
    97: [52, 892.95, "main"],
    98: [52, 863.64, "main"],
    99: [52, 834.32, "main"],
    100: [52, 805, "main"],
  };
  for (const [id, [x, y, level]] of Object.entries(updatedPositions)) {
    Object.assign(positions[Number(id) - 1], { x, y, level });
  }
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