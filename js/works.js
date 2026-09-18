"use strict";

(() => {
  const file = "data/works-floor-1.json";
  const clean = value => typeof value === "string" ? value.trim() : value;
  function apply(data) {
    if (!data || data.floor !== 1 || !Array.isArray(data.works)) throw new Error("formato inválido");
    const byId = new Map(data.works.map(item => [Number(item.id), item]));
    for (const source of data.works) {
      if (window.EXHIBITION_DATA.some(work => work.floor === 1 && work.slot === Number(source.id))) continue;
      window.EXHIBITION_DATA.push({
        floor: 1, slot: Number(source.id), area: "room-" + source.room, level: "main",
        type: null, tags: [], reading: "", audio: null, image: null
      });
    }
    for (const work of window.EXHIBITION_DATA) {
      if (work.floor !== 1) continue;
      const source = byId.get(work.slot);
      if (!source) continue;
      const slot = window.EXHIBITION_CONFIG.floors[0].slots.find(item => item.number === work.slot);
      if (slot) work.level = slot.level;
      for (const field of ["artist", "title", "description", "saleStatus", "price", "image", "audio", "reading"]) {
        work[field] = clean(source[field]);
      }
    }
  }

  function localData() {
    const data = window.LOCAL_DATA?.[file];
    if (data === undefined) throw new Error("fallback local ausente: " + file);
    return data;
  }

  if (window.location.protocol === "file:") {
    apply(localData());
    window.WORKS_READY = Promise.resolve();
    return;
  }

  window.WORKS_READY = fetch(file, { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(apply)
    .catch(error => {
      console.warn("Fetch de " + file + " falhou; usando fallback local:", error.message);
      apply(localData());
    });
})();
