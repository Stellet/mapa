"use strict";

// Zoom por dimensões: SVG e posições compartilham a mesma escala;
// números acompanham o zoom, com alvos de toque de no mínimo 44px.
(() => {
  const viewport = document.getElementById("map-viewport");
  const map = viewport.querySelector(".map");
  const controls = document.getElementById("map-controls");
  const minus = document.getElementById("zoom-out");
  const plus = document.getElementById("zoom-in");
  const reset = document.getElementById("zoom-reset");
  const status = document.getElementById("zoom-status");
  const levels = [1, 1.5, 2, 3, 4, 5, 6];
  let level = 0;
  let enabled = false;
  let drag = null;
  let suppressClick = false;
  let previousWidth = 0;
  const blocked = () => document.body.classList.contains("sheet-open");

  function updateControls() {
    minus.disabled = blocked() || level === 0;
    plus.disabled = blocked() || level === levels.length - 1;
    reset.disabled = blocked();
    reset.textContent = Math.round(levels[level] * 100) + "%";
    status.textContent = "Zoom " + reset.textContent;
  }
  function render(general = false) {
    if (!enabled) return;
    const oldWidth = map.offsetWidth || viewport.clientWidth;
    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / oldWidth;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / oldWidth;
    const width = viewport.clientWidth * levels[level];
    map.style.setProperty("--map-zoom", levels[level]);
    map.style.width = width + "px";
    map.style.height = width * 1780 / 360 + "px";
    viewport.dataset.zoomed = String(level > 0);
    viewport.scrollLeft = general ? 0 : centerX * width - viewport.clientWidth / 2;
    viewport.scrollTop = general ? 0 : centerY * width - viewport.clientHeight / 2;
    previousWidth = viewport.clientWidth;
    updateControls();
  }
  function change(delta) {
    if (!enabled || blocked()) return;
    level = Math.max(0, Math.min(levels.length - 1, level + delta));
    render();
  }
  function general() {
    if (!enabled || blocked()) return;
    level = 0;
    render(true);
  }
  minus.addEventListener("click", () => change(-1));
  plus.addEventListener("click", () => change(1));
  reset.addEventListener("click", general);
  viewport.addEventListener("keydown", event => {
    if (event.target !== viewport) return;
    if (event.key === "+" || event.key === "=") { event.preventDefault(); change(1); }
    if (event.key === "-") { event.preventDefault(); change(-1); }
    if (event.key === "0") { event.preventDefault(); general(); }
  });
  window.EXHIBITION_MAP = {
    setFloor(floor) {
      enabled = Boolean(floor.realMap);
      controls.hidden = !enabled;
      viewport.dataset.interactive = String(enabled);
      level = 0;
      drag = null;
      viewport.dataset.dragging = "false";
      map.style.removeProperty("--map-zoom");
      map.style.removeProperty("width");
      map.style.removeProperty("height");
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
      viewport.dataset.zoomed = "false";
      if (enabled) render(true);
    }
  };
  new ResizeObserver(() => {
    if (enabled && viewport.clientWidth !== previousWidth) render();
  }).observe(viewport);
  new MutationObserver(updateControls).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  viewport.addEventListener("pointerdown", event => {
    if (!enabled || blocked()) return;
    suppressClick = false;
    if (!event.isPrimary) { drag = null; suppressClick = true; return; }
    if (level === 0 || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
  });
  viewport.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.id || blocked()) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    suppressClick = true;
    viewport.dataset.dragging = "true";
    if (!viewport.hasPointerCapture(event.pointerId)) viewport.setPointerCapture(event.pointerId);
    event.preventDefault();
    viewport.scrollLeft = drag.left - dx;
    viewport.scrollTop = drag.top - dy;
  });
  function endDrag() {
    drag = null;
    viewport.dataset.dragging = "false";
    setTimeout(() => { suppressClick = false; }, 0);
  }
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("lostpointercapture", endDrag);
  viewport.addEventListener("dragstart", event => event.preventDefault());

  // No enquadramento geral, alvos ampliados podem se aproximar.
  // O centro mais próximo resolve o toque; a seleção continua no app.js.
  viewport.addEventListener("click", event => {
    if (!enabled || event.detail === 0) return;
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    let nearest = null, distance = Infinity;
    for (const button of document.getElementById("slots").children) {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const d = dx * dx + dy * dy;
      if (Math.abs(dx) <= rect.width / 2 && Math.abs(dy) <= rect.height / 2 && d < distance) {
        nearest = button;
        distance = d;
      }
    }
    if (nearest) {
      event.preventDefault();
      event.stopImmediatePropagation();
      nearest.click();
    }
  }, true);
})();

