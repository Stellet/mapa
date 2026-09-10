"use strict";

window.EXHIBITION_CONFIG = {
  initialFloor: 1,
  floors: [
    // Grade provisória: substituir por coordenadas reais { number, x, y } em porcentagem.
    { id: 1, map: "maps/andar-1.svg", slots: Array.from({ length: 100 }, (_, index) => ({
      number: index + 1,
      x: 10 + (index % 5) * 20,
      y: 3 + Math.floor(index / 5) * 94 / 19
    })) },
    { id: 2, map: "maps/andar-2.svg", slots: [] },
    { id: 3, map: "maps/andar-3.svg", slots: [] }
  ]
};
