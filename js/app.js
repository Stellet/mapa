"use strict";

(() => {
  const config = window.EXHIBITION_CONFIG;
  const works = window.EXHIBITION_DATA;
  const selector = document.getElementById("floor-selector");
  const slots = document.getElementById("slots");
  const sheet = document.getElementById("work-sheet");
  const audio = document.getElementById("work-audio");
  const closeButton = document.getElementById("close-sheet");
  let selectedButton = null;
  const state = { floor: config.initialFloor, mode: "map", selected: null, grouped: true };
  const areaNames = { "area-loja-14": "SALA 1", "area-escritorios": "SALA 2" };
  const typeNames = { pintura: "Pintura", fotografia: "Fotografia", colagem: "Colagem", escultura: "Escultura" };

  function closeSheet(restoreFocus = false) {
    const previousButton = selectedButton;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    window.EXHIBITION_SHEET.close();
    state.selected = null;
    syncSelection();
    announceChange();
    selectedButton = null;
    if (restoreFocus) {
      const equivalent = document.querySelector((state.mode === "list" ? "#work-list" : "#slots") + ' [data-work-slot="' + previousButton?.dataset.workSlot + '"]');
      (equivalent && !equivalent.hidden ? equivalent : document.querySelector('[data-mode="' + state.mode + '"]')).focus({ preventScroll: true });
    }
  }

  closeButton.addEventListener("click", () => closeSheet(true));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !sheet.hidden) closeSheet(true);
  });

  function selectSlot(number, trigger) {
    const work = works.find(item => item.floor === state.floor && item.slot === number);
    if (!work) { closeSheet(); return; }
    if (state.selected === number) { selectedButton = trigger || selectedButton; return; }
    const wasHidden = sheet.hidden;
    state.selected = number;
    selectedButton = trigger;
    syncSelection();
    announceChange();
    document.getElementById("work-number").textContent = "Obra " + String(number).padStart(2, "0");
    document.getElementById("work-heading").textContent = work.title;
    document.getElementById("work-artist").textContent = work.artist;
    document.getElementById("work-description").textContent = work.description;
    document.getElementById("work-reading").textContent = work.reading;
    const image = document.getElementById("work-image");
    image.src = work.image;
    image.alt = work.imageAlt;
    const thumbnail = document.getElementById("work-thumbnail");
    thumbnail.src = work.image;
    thumbnail.alt = work.imageAlt;
    audio.pause();
    audio.src = work.audio;
    audio.load();
    window.EXHIBITION_SHEET.openPartial();
    document.getElementById("sheet-content").scrollTop = 0;
    if (wasHidden) closeButton.focus({ preventScroll: true });
  }

  function selectFloor(id) {
    state.floor = id;
    const floor = config.floors.find(item => item.id === id);
    for (const button of selector.children) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.floor) === id));
    }
    document.getElementById("map-heading").textContent = `Andar ${id}`;
    const map = document.getElementById("floor-map");
    map.setAttribute("href", floor.map);
    map.parentElement.dataset.real = String(Boolean(floor.realMap));
    document.getElementById("map-caption").textContent = floor.realMap ? "Planta simplificada" : "Planta provisória";
    document.getElementById("map-instructions").textContent = floor.realMap
      ? "Arraste para explorar. Amplie com dois dedos, com a roda do mouse ou +. Grupos indicam quantidade e numeração das obras; toque para ampliar. Selecione um número para abrir a ficha. O percentual restaura 100%, ajustando a planta à largura."
      : "Toque em um número para selecionar uma obra.";
    map.setAttribute("aria-label", floor.realMap ? "Planta simplificada do primeiro andar, com Sala 1, Sala 2, banheiros, acesso inferior, escada e salão lateral" : `Planta esquemática provisória do andar ${id}`);
    slots.replaceChildren();
    for (const slot of floor.slots) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot";
      button.dataset.slot = slot.number;
      button.dataset.workSlot = slot.number;
      const number = document.createElement("span");
      number.textContent = String(slot.number).padStart(2, "0");
      button.append(number);
      button.setAttribute("aria-label", `Selecionar obra ${slot.number}, andar ${id}`);
      button.style.setProperty("--x", `${slot.x}%`);
      button.style.setProperty("--y", `${slot.y}%`);
      const work = works.find(item => item.floor === id && item.slot === slot.number);
      if (work) button.setAttribute("aria-label", workLabel(work));
      button.addEventListener("click", () => selectSlot(slot.number, button));
      slots.append(button);
    }
    document.getElementById("floor-status").textContent = floor.slots.length
      ? `${floor.slots.length} slots com posições provisórias neste andar.` : "Este andar ainda não possui slots cadastrados.";
    closeSheet();
    window.EXHIBITION_MAP.setFloor(floor);
    renderResults();
  }

  function announceChange() { document.dispatchEvent(new Event("explorationchange")); }
  function syncSelection() {
    for (const button of document.querySelectorAll("[data-work-slot]")) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.workSlot) === state.selected));
    }
  }
  function workLabel(work) {
    return "Obra " + String(work.slot).padStart(2, "0") + ". " + work.title + ". " + work.artist + ". " + (areaNames[work.area] || work.area) + ". " + (typeNames[work.type] || work.type) + ". Tags: " + work.tags.join(", ");
  }
  function visibleWorks() {
    return works.filter(work => work.floor === state.floor);
  }
  function renderResults() {
    const visible = visibleWorks();
    const numbers = new Set(visible.map(work => work.slot));
    for (const button of slots.children) button.hidden = !numbers.has(Number(button.dataset.slot));
    if (state.selected !== null && !numbers.has(state.selected)) closeSheet();
    const list = document.getElementById("work-list");
    list.replaceChildren();
    const groups = new Map();
    for (const work of visible) {
      const key = state.grouped ? work.area : "all";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(work);
    }
    for (const [area, group] of groups) {
      const section = document.createElement("section");
      if (state.grouped) {
        const heading = document.createElement("h3");
        heading.textContent = areaNames[area] || area;
        section.append(heading);
      }
      const ul = document.createElement("ul");
      for (const work of group) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "list-work";
        button.dataset.workSlot = work.slot;
        button.setAttribute("aria-label", workLabel(work));
        for (const [className, text] of [["list-number", String(work.slot).padStart(2, "0")], ["list-title", work.title], ["list-artist", work.artist], ["list-meta", (areaNames[work.area] || work.area) + " · " + typeNames[work.type] + " · " + work.tags.join(", ")]]) {
          const span = document.createElement("span"); span.className = className; span.textContent = text; button.append(span);
        }
        button.addEventListener("click", () => selectSlot(work.slot, button));
        li.append(button); ul.append(li);
      }
      section.append(ul); list.append(section);
    }
    document.getElementById("results-status").textContent = "Andar " + state.floor + ": " + visible.length + " obras" + (visible.length ? "." : ". Nenhuma obra cadastrada neste andar.");
    document.getElementById("list-heading").textContent = "Obras — Andar " + state.floor;
    document.getElementById("floor-status").textContent = visible.length ? visible.length + " obras visíveis no mapa. Posições provisórias." : "Nenhuma obra cadastrada neste andar.";
    syncSelection();
    announceChange();
  }
  for (const floor of config.floors.filter(item => item.id === 1 || item.id === 2)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "floor-button";
    button.dataset.floor = floor.id;
    button.textContent = floor.id;
    button.setAttribute("aria-label", `Andar ${floor.id}`);
    button.addEventListener("click", () => selectFloor(floor.id));
    selector.append(button);
  }
  for (const button of document.querySelectorAll("[data-mode]")) {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      document.getElementById("map-view").hidden = state.mode !== "map";
      document.getElementById("list-view").hidden = state.mode !== "list";
      for (const mode of document.querySelectorAll("[data-mode]")) mode.setAttribute("aria-pressed", String(mode.dataset.mode === state.mode));
      if (state.mode === "map") window.EXHIBITION_MAP.refresh();
      syncSelection();
      announceChange();
    });
  }
  document.getElementById("group-by-area").addEventListener("change", event => { state.grouped = event.target.checked; renderResults(); });
  selectFloor(state.floor);
})();











