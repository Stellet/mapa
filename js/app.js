"use strict";

(async () => {
  await Promise.all([window.POSITIONS_READY, window.WORKS_READY]);
  const config = window.EXHIBITION_CONFIG;
  const works = window.EXHIBITION_DATA;
  const selector = document.getElementById("floor-selector");
  const slots = document.getElementById("slots");
  const sheet = document.getElementById("work-sheet");
  const audio = document.getElementById("work-audio");
  const fullImage = document.getElementById("work-image");
  const thumbnail = document.getElementById("work-thumbnail");
  const closeButton = document.getElementById("close-sheet");
  let selectedButton = null;
  const state = { floor: config.initialFloor, mode: "map", selected: null, grouped: true };
  const areaNames = { "area-1": "ÁREA 1", "area-2": "ÁREA 2", "area-3": "ÁREA 3", "area-4": "ÁREA 4", "area-5": "ÁREA 5", "andar-2-primeira-sala": "PRIMEIRA SALA", "andar-2-segunda-sala": "SEGUNDA SALA", "andar-2-sala-vidro": "SALA DE VIDRO", "room-1": "SALA 1", "room-2": "SALA 2" };
  const typeNames = { pintura: "Pintura", fotografia: "Fotografia", colagem: "Colagem", escultura: "Escultura" };

  function hasValue(value) { return value !== null && value !== undefined && String(value).trim() !== ""; }
  function setOptional(element, value, block = element) {
    const visible = hasValue(value);
    element.textContent = visible ? value : "";
    block.hidden = !visible;
  }

  function interestUrl(work) {
    const details = [work.slot, work.title, work.artist]
      .filter(hasValue).map(value => String(value).trim()).join(" - ");
    const message = "Estive na exposição Rios-Reais no CC Lado B e tive interesse na obra " + details;
    return "https://wa.me/5521980339510?text=" + encodeURIComponent(message);
  }
  for (const button of document.querySelectorAll(".partial-interest, .interest-button")) {
    button.addEventListener("click", () => {
      const work = works.find(item => item.floor === state.floor && item.slot === state.selected);
      if (work) window.open(interestUrl(work), "_blank", "noopener,noreferrer");
    });
  }
  document.addEventListener("sheetstatechange", event => {
    if (!event.detail.expanded || state.selected === null) return;
    const work = works.find(item => item.floor === state.floor && item.slot === state.selected);
    if (work?.image && fullImage.getAttribute("src") !== work.image) fullImage.src = work.image;
  });

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
      (equivalent && !equivalent.hasAttribute("hidden") ? equivalent : document.querySelector('[data-mode="' + state.mode + '"]')).focus({ preventScroll: true });
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
    setOptional(document.getElementById("work-heading"), work.title);
    setOptional(document.getElementById("work-artist"), work.artist);
    setOptional(document.getElementById("work-description"), work.description);
    setOptional(document.getElementById("work-sale-status"), work.saleStatus, document.getElementById("work-sale-status-row"));
    setOptional(document.getElementById("work-price"), work.price, document.getElementById("work-price-row"));
    setOptional(document.getElementById("work-reading"), work.reading, document.getElementById("work-reading-section"));
    for (const element of [fullImage, thumbnail]) {
      element.classList.toggle("image-empty", !work.image);
      element.alt = "";
    }
    const hideMissingImage = state.floor === 2 && !work.image;
    fullImage.hidden = hideMissingImage;
    thumbnail.hidden = hideMissingImage;
    document.querySelector(".sheet-preview").classList.toggle("no-image", hideMissingImage);
    fullImage.removeAttribute("src");
    if (work.image) thumbnail.src = work.image;
    else thumbnail.removeAttribute("src");
    audio.pause();
    const hasAudio = hasValue(work.audio);
    document.getElementById("work-audio-section").hidden = !hasAudio;
    if (hasAudio) audio.src = work.audio;
    else audio.removeAttribute("src");
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
    const mapHeight = Number((floor.viewBox || "0 0 360 1780").split(/\s+/)[3]);
    map.setAttribute("height", mapHeight);
    document.getElementById("map-grid").setAttribute("height", mapHeight);
    document.querySelector(".map-overlay").setAttribute("height", mapHeight);
    document.getElementById("map-svg").style.setProperty("--map-content-height", mapHeight + "px");
    map.parentElement.dataset.real = String(Boolean(floor.realMap));
    document.getElementById("map-caption").textContent = floor.realMap ? "Planta simplificada" : "Planta provisória";
    document.getElementById("map-instructions").textContent = floor.realMap
      ? "Arraste para explorar. Amplie com dois dedos, com a roda do mouse ou +. Grupos indicam quantidade e numeração das obras; toque para escolher uma obra do grupo. Selecione um número para abrir a ficha. O percentual restaura 100%, ajustando a planta à largura."
      : "Toque em um número para selecionar uma obra.";
    document.getElementById("map-location-labels").style.display = id === 1 ? "" : "none";
    map.setAttribute("aria-label", id === 1 ? "Planta simplificada do primeiro andar, com entrada superior, rampa central, mezanino, bar, escada e banheiros" : "Planta do segundo andar, com primeira sala, segunda sala, sala de vidro, escada e entrada");
    slots.replaceChildren();
    for (const slot of floor.slots) {
      const button = document.createElementNS("http://www.w3.org/2000/svg", "g");
      button.setAttribute("class", "slot");
      button.setAttribute("role", "button");
      button.setAttribute("tabindex", "0");
      button.dataset.slot = slot.number;
      button.dataset.workSlot = slot.number;
      const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hit.setAttribute("class", "slot-hit");
      const face = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      face.setAttribute("class", "slot-face");
      const backdrop = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      backdrop.setAttribute("class", "slot-number-backdrop");
      const number = document.createElementNS("http://www.w3.org/2000/svg", "text");
      number.setAttribute("class", "slot-number");
      number.textContent = String(slot.number).padStart(2, "0");
      button.append(hit, face, backdrop, number);
      button.setAttribute("aria-label", `Selecionar obra ${slot.number}, andar ${id}`);
      button.style.setProperty("--x", `${slot.x}%`);
      button.style.setProperty("--y", `${slot.y}%`);
      const work = works.find(item => item.floor === id && item.slot === slot.number);
      if (work) button.setAttribute("aria-label", workLabel(work));
      button.addEventListener("click", () => selectSlot(slot.number, button));
      button.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); button.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
      });
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
    return ["Obra " + String(work.slot).padStart(2, "0"), work.title, work.artist, work.description, work.saleStatus, work.price].filter(hasValue).join(". ");
  }
  function visibleWorks() {
    return works.filter(work => work.floor === state.floor);
  }
  function renderResults() {
    const visible = visibleWorks();
    const numbers = new Set(visible.map(work => work.slot));
    for (const button of slots.children) button.toggleAttribute("hidden", !numbers.has(Number(button.dataset.slot)));
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
        if (state.floor === 2 && work.image) {
          button.classList.add("has-image");
          const image = document.createElement("img");
          image.className = "list-image";
          image.src = work.image;
          image.alt = "";
          image.width = 64;
          image.height = 64;
          image.loading = "lazy";
          image.decoding = "async";
          button.append(image);
        }
        for (const [className, text] of [["list-number", String(work.slot).padStart(2, "0")], ["list-title", work.title], ["list-artist", work.artist], ["list-description", work.description], ["list-sale-status", work.saleStatus], ["list-price", work.price]].filter(([, text]) => hasValue(text))) {
          const span = document.createElement("span"); span.className = className; span.textContent = text; button.append(span);
        }
        button.addEventListener("click", () => selectSlot(work.slot, button));
        li.append(button); ul.append(li);
      }
      section.append(ul); list.append(section);
    }
    document.getElementById("results-status").textContent = "Andar " + state.floor + ": " + visible.length + " obras" + (visible.length ? "." : ". Nenhuma obra cadastrada neste andar.");
    document.getElementById("list-heading").textContent = "Obras — Andar " + state.floor;
    const positioned = config.floors.find(floor => floor.id === state.floor).slots.filter(slot => numbers.has(slot.number)).length;
    document.getElementById("floor-status").textContent = visible.length ? positioned + " obras com posição no mapa; " + visible.length + " obras na lista." : "Nenhuma obra cadastrada neste andar.";
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
  if (!window.POSITIONS_LOADED) {
    document.addEventListener("positionsready", () => selectFloor(state.floor), { once: true });
  }
})();











