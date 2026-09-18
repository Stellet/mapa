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

  function localData(file) {
    const data = window.LOCAL_DATA?.[file];
    if (data === undefined) throw new Error("fallback local ausente: " + file);
    return data;
  }

  async function read(file) {
    if (window.location.protocol === "file:") return localData(file);
    try {
      const response = await fetch(file, { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      console.warn("Fetch de " + file + " falhou; usando fallback local:", error.message);
      return localData(file);
    }
  }
  async function load(floor) {
    const file = files.get(floor.id);
    if (!file) return;
    try {
      const data = await read(file);
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
      floor.slots = parsed.map(item => ({
        ...byNumber.get(item.number),
        number: item.number,
        x: item.x / size.width * 100,
        y: item.y / size.height * 100,
        level: item.level
      })).sort((a, b) => a.number - b.number);
    } catch (error) {
      console.warn("Posições mantidas pelo fallback de configuração para " + file + ":", error.message);
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