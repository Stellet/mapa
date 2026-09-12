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
  let currentFloor = config.initialFloor;

  function closeSheet(restoreFocus = false) {
    const previousButton = selectedButton;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    window.EXHIBITION_SHEET.close();
    for (const button of slots.children) button.setAttribute("aria-pressed", "false");
    selectedButton = null;
    if (restoreFocus && previousButton) previousButton.focus({ preventScroll: true });
  }

  closeButton.addEventListener("click", () => closeSheet(true));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !sheet.hidden) closeSheet(true);
  });

  function selectSlot(number) {
    const work = works.find(item => item.floor === currentFloor && item.slot === number);
    if (!work) { closeSheet(); return; }
    if (selectedButton && Number(selectedButton.dataset.slot) === number) return;
    const wasHidden = sheet.hidden;
    for (const button of slots.children) {
      const selected = Number(button.dataset.slot) === number;
      button.setAttribute("aria-pressed", String(selected));
      if (selected) selectedButton = button;
    }
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
    currentFloor = id;
    const floor = config.floors.find(item => item.id === id);
    for (const button of selector.children) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.floor) === id));
    }
    document.getElementById("map-heading").textContent = `Andar ${id}`;
    const map = document.getElementById("floor-map");
    map.src = floor.map;
    map.parentElement.dataset.real = String(Boolean(floor.realMap));
    document.getElementById("map-caption").textContent = floor.realMap ? "Planta simplificada" : "Planta provisória";
    document.getElementById("map-instructions").textContent = floor.realMap
      ? "Toque em um número para selecionar uma obra. Em telas estreitas, deslize o mapa para os lados."
      : "Toque em um número para selecionar uma obra.";
    map.alt = floor.realMap ? "Planta simplificada do primeiro andar, com acesso inferior, escada, elevador e salão lateral" : `Planta esquemática provisória do andar ${id}`;
    slots.replaceChildren();
    for (const slot of floor.slots) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot";
      button.dataset.slot = slot.number;
      button.textContent = String(slot.number).padStart(2, "0");
      button.setAttribute("aria-label", `Selecionar obra ${slot.number}, andar ${id}`);
      button.style.setProperty("--x", `${slot.x}%`);
      button.style.setProperty("--y", `${slot.y}%`);
      button.addEventListener("click", () => selectSlot(slot.number));
      slots.append(button);
    }
    document.getElementById("floor-status").textContent = floor.slots.length
      ? `${floor.slots.length} slots com posições provisórias neste andar.` : "Este andar ainda não possui slots cadastrados.";
    closeSheet();
  }

  for (const floor of config.floors) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "floor-button";
    button.dataset.floor = floor.id;
    button.textContent = floor.id;
    button.setAttribute("aria-label", `Andar ${floor.id}`);
    button.addEventListener("click", () => selectFloor(floor.id));
    selector.append(button);
  }
  selectFloor(currentFloor);
})();



