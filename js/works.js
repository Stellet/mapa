"use strict";

(() => {
  const file = "data/works-floor-1.json";
  const floor2File = "data/works-floor-2.json";
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

  function applyFloor2(data) {
    if (!data || data.floor !== 2 || !Array.isArray(data.works) || data.works.length !== 15 ||
        data.works.some((work, index) => Number(work.id) !== index + 1)) throw new Error("formato inválido do 2º andar");
    for (const source of data.works) {
      const { id, ...fields } = source;
      const work = window.EXHIBITION_DATA.find(item => item.floor === 2 && item.slot === Number(id));
      if (work) Object.assign(work, fields);
      else window.EXHIBITION_DATA.push({ ...fields, floor: 2, slot: Number(id) });
    }
  }

  function localData(path) {
    const data = window.LOCAL_DATA?.[path];
    if (data === undefined) throw new Error("fallback local ausente: " + path);
    return data;
  }

  if (window.location.protocol === "file:") {
    apply(localData(file));
    applyFloor2(localData(floor2File));
    window.WORKS_READY = Promise.resolve();
    return;
  }

  function load(path, useData) {
    return fetch(path, { cache: "no-store" })
      .then(response => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(useData)
      .catch(error => {
        console.warn("Fetch de " + path + " falhou; usando fallback local:", error.message);
        useData(localData(path));
      });
  }
  window.WORKS_READY = Promise.all([load(file, apply), load(floor2File, applyFloor2)]);
})();
