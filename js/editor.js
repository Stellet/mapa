"use strict";

(() => {
  if (new URLSearchParams(window.location.search).get("edit") !== "1") return;

  const floor = window.EXHIBITION_CONFIG.floors.find(item => item.id === 1);
  const viewport = document.getElementById("map-viewport");
  const svg = document.getElementById("map-svg");
  const content = document.getElementById("map-content");
  const slots = document.getElementById("slots");
  const storageKey = "rios-reais:andar-1:positions";
  let mode = "navigate";
  let selected = null;
  let gesture = null;

  function toMapPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const mapped = point.matrixTransform(content.getScreenCTM().inverse());
    return {
      x: Math.max(0, Math.min(360, mapped.x)),
      y: Math.max(0, Math.min(1780, mapped.y))
    };
  }

  function exportPositions() {
    return floor.slots.map(slot => ({
      id: slot.number,
      x: Number((slot.x / 100 * 360).toFixed(2)),
      y: Number((slot.y / 100 * 1780).toFixed(2)),
      level: slot.level || "main"
    }));
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(exportPositions()));
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const byId = new Map(saved.map(item => [Number(item.id), item]));
      for (const slot of floor.slots) {
        const item = byId.get(slot.number);
        if (!item || !Number.isFinite(item.x) || !Number.isFinite(item.y)) continue;
        slot.x = Math.max(0, Math.min(360, item.x)) / 360 * 100;
        slot.y = Math.max(0, Math.min(1780, item.y)) / 1780 * 100;
        if (item.level === "main" || item.level === "mezzanine") slot.level = item.level;
      }
    } catch (error) {
      console.warn("Posições locais ignoradas:", error);
    }
  }
  const panel = document.createElement("aside");
  panel.className = "map-editor";
  panel.setAttribute("aria-label", "Editor local de posições");
  panel.innerHTML = `
    <div class="map-editor-modes" role="group" aria-label="Modo do editor">
      <button type="button" data-edit-mode="navigate" aria-pressed="true">NAVEGAR</button>
      <button type="button" data-edit-mode="position" aria-pressed="false">POSICIONAR</button>
    </div>
    <p class="map-editor-selection" aria-live="polite">OBRA SELECIONADA: —</p>
    <button type="button" class="map-editor-export">EXPORTAR POSIÇÕES</button>
  `;
  document.getElementById("map-view").append(panel);

  const selectionLabel = panel.querySelector(".map-editor-selection");
  function select(number) {
    selected = floor.slots.find(slot => slot.number === number) || null;
    selectionLabel.textContent = "OBRA SELECIONADA: " + (selected ? String(selected.number).padStart(2, "0") : "—");
    for (const button of slots.children) {
      button.classList.toggle("edit-selected", Number(button.dataset.slot) === selected?.number);
    }
  }

  function place(point, persist = false) {
    if (!selected) return;
    selected.x = point.x / 360 * 100;
    selected.y = point.y / 1780 * 100;
    window.EXHIBITION_MAP.refresh();
    if (persist) save();
  }

  function setMode(next) {
    mode = next;
    gesture = null;
    document.body.classList.toggle("edit-positioning", mode === "position");
    viewport.dataset.editMode = mode;
    for (const button of panel.querySelectorAll("[data-edit-mode]")) {
      button.setAttribute("aria-pressed", String(button.dataset.editMode === mode));
    }
    if (mode === "position" && document.body.classList.contains("sheet-open")) {
      document.getElementById("close-sheet").click();
    }
    window.EXHIBITION_MAP.refresh();
  }

  panel.addEventListener("click", event => {
    const modeButton = event.target.closest("[data-edit-mode]");
    if (modeButton) setMode(modeButton.dataset.editMode);
  });

  panel.querySelector(".map-editor-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(exportPositions(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "andar-1-posicoes.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });
  svg.addEventListener("pointerdown", event => {
    if (mode !== "position" || !floorOneActive() || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (gesture && gesture.pointerId !== event.pointerId) return;
    const button = event.target.closest(".slot");
    if (button) select(Number(button.dataset.slot));
    const point = toMapPoint(event);
    gesture = {
      pointerId: event.pointerId,
      beganOnSlot: Boolean(button),
      startClient: { x: event.clientX, y: event.clientY },
      moved: false
    };
    svg.setPointerCapture(event.pointerId);
  }, true);

  svg.addEventListener("pointermove", event => {
    if (mode !== "position" || !gesture || gesture.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const point = toMapPoint(event);
    if (Math.hypot(event.clientX - gesture.startClient.x, event.clientY - gesture.startClient.y) >= 6) gesture.moved = true;
    if (gesture.beganOnSlot && gesture.moved) place(point);
  }, true);

  function finish(event) {
    if (mode !== "position" || !gesture || gesture.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.type === "pointerup") {
      const point = toMapPoint(event);
      if (!gesture.beganOnSlot || gesture.moved) place(point, true);
    }
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    gesture = null;
  }
  svg.addEventListener("pointerup", finish, true);
  svg.addEventListener("pointercancel", finish, true);

  svg.addEventListener("click", event => {
    if (mode !== "position") return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

function floorOneActive() {
    return document.getElementById("floor-map").getAttribute("href") === floor.map;
  }

  function syncFloor() {
    panel.hidden = !floorOneActive();
    if (panel.hidden) {
      select(null);
      setMode("navigate");
    }
  }

  restore();
  document.body.classList.add("edit-mode");
  select(null);
  setMode("navigate");
  syncFloor();
  document.addEventListener("explorationchange", syncFloor);
  window.EXHIBITION_MAP.refresh();
})();