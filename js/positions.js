"use strict";

(() => {
  const files = new Map([
    [1, "data/positions-floor-1.json"],
    [2, "data/positions-floor-2.json"]
  ]);

  function dimensions(floor) {
    const values = (floor.viewBox || "0 0 360 1780").split(/\s+/).map(Number);
    return { width: values[2], height: values[3] };
  }

  async function load(floor) {
    const file = files.get(floor.id);
    if (!file) return;
    try {
      const response = await fetch(file, { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (!data || Array.isArray(data) || typeof data !== "object") throw new Error("formato inválido");

      const size = dimensions(floor);
      const parsed = Object.entries(data).map(([id, item]) => {
        const number = Number(id);
        const valid = /^\d+$/.test(id) &&
          Number.isInteger(number) && number > 0 &&
          item && typeof item === "object" &&
          Number.isFinite(item.x) && Number.isFinite(item.y) &&
          item.x >= 0 && item.x <= size.width &&
          item.y >= 0 && item.y <= size.height &&
          (item.level === "main" || item.level === "mezzanine");
        if (!valid) throw new Error("posição inválida: " + id);
        return { number, x: item.x, y: item.y, level: item.level };
      });

      const byNumber = new Map(floor.slots.map(slot => [slot.number, slot]));
      for (const item of parsed) {
        const slot = byNumber.get(item.number) || { number: item.number };
        slot.x = item.x / size.width * 100;
        slot.y = item.y / size.height * 100;
        slot.level = item.level;
        if (!byNumber.has(item.number)) {
          floor.slots.push(slot);
          byNumber.set(item.number, slot);
        }
      }
      floor.slots.sort((a, b) => a.number - b.number);
    } catch (error) {
      console.warn("Posições mantidas pelo fallback de " + file + ":", error.message);
    }
  }

  window.POSITIONS_READY = Promise.all(
    window.EXHIBITION_CONFIG.floors.filter(floor => files.has(floor.id)).map(load)
  ).then(() => {
    if (window.EXHIBITION_DATA) {
      for (const work of window.EXHIBITION_DATA) {
        const floor = window.EXHIBITION_CONFIG.floors.find(item => item.id === work.floor);
        const slot = floor?.slots.find(item => item.number === work.slot);
        if (slot) work.level = slot.level;
      }
    }
    window.POSITIONS_LOADED = true;
    document.dispatchEvent(new CustomEvent("positionsready"));
  });
})();