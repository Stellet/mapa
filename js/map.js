"use strict";
(() => {
  const viewport = document.getElementById("map-viewport"), image = document.getElementById("floor-map"), slots = document.getElementById("slots");
  const clusters = document.createElement("div"); clusters.className = "map-clusters"; viewport.append(clusters);
  const minus = document.getElementById("zoom-out"), plus = document.getElementById("zoom-in"), reset = document.getElementById("zoom-reset");
  const pointers = new Map();
  // Coordenadas do SVG; botões e gestos compartilham esta transformação.
  const state = { fit: 1, zoom: 1, x: 0, y: 0 };
  let floor, frame = 0, gesture = null, moved = false, ignoreClickUntil = 0;
  const blocked = () => document.body.classList.contains("sheet-open");
  const scale = () => state.fit * state.zoom;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function constrain() {
    const w = 360 * scale(), h = 1780 * scale();
    state.x = state.zoom === 1 ? (viewport.clientWidth - w) / 2 : clamp(state.x, Math.min(0, viewport.clientWidth - w), Math.max(0, viewport.clientWidth - w));
    state.y = state.zoom === 1 ? (viewport.clientHeight - h) / 2 : clamp(state.y, Math.min(0, viewport.clientHeight - h), Math.max(0, viewport.clientHeight - h));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; render(); }); }
  function fit() {
    if (!floor?.realMap || !viewport.clientWidth || !viewport.clientHeight) return;
    state.fit = Math.min(viewport.clientWidth / 360, viewport.clientHeight / 1780);
    state.zoom = 1; state.x = 0; state.y = 0;
    pointers.clear(); gesture = null; schedule();
  }
  function zoomAt(zoom, x, y) {
    const wx = (x - state.x) / scale(), wy = (y - state.y) / scale();
    state.zoom = clamp(zoom, 1, 32);
    state.x = x - wx * scale(); state.y = y - wy * scale(); schedule();
  }
  function render() {
    if (!floor?.realMap || !viewport.clientWidth) return;
    constrain();
    image.style.transform = `translate(${state.x}px, ${state.y}px) scale(${scale()})`;
    viewport.dataset.zoomed = String(state.zoom > 1.001);
    reset.textContent = Math.round(state.zoom * 100) + "%";
    document.getElementById("zoom-status").textContent = "Zoom " + reset.textContent;
    minus.disabled = blocked() || state.zoom <= 1; plus.disabled = blocked() || state.zoom >= 32; reset.disabled = blocked();
    const groups = [];
    for (const button of slots.children) {
      const point = floor.slots.find(slot => slot.number === Number(button.dataset.slot));
      const x = state.x + point.x / 100 * 360 * scale(), y = state.y + point.y / 100 * 1780 * scale();
      button.style.left = x + "px"; button.style.top = y + "px";
      button.classList.remove("clustered", "outside-map");
      if (button.hidden) { button.querySelector("img")?.remove(); continue; }
      const selected = button.getAttribute("aria-pressed") === "true";
      let group = !selected && groups.find(g => !g.selected && Math.hypot(g.x - x, g.y - y) < 48);
      if (!group) { group = { x, y, selected, items: [] }; groups.push(group); }
      group.items.push({ button, x, y });
    }
    const focusedKey = document.activeElement?.dataset.cluster;
    clusters.replaceChildren();
    for (const group of groups) {
      const x = group.items.reduce((sum, p) => sum + p.x, 0) / group.items.length;
      const y = group.items.reduce((sum, p) => sum + p.y, 0) / group.items.length;
      const outside = x < -24 || y < -24 || x > viewport.clientWidth + 24 || y > viewport.clientHeight + 24;
      for (const item of group.items) {
        item.button.classList.toggle("clustered", group.items.length > 1);
        item.button.classList.toggle("outside-map", outside);
        const needsImage = state.zoom >= 4 && !outside && group.items.length === 1;
        let thumb = item.button.querySelector("img");
        if (!needsImage) { thumb?.remove(); continue; }
        if (!thumb) {
          const work = window.EXHIBITION_DATA.find(w => w.floor === floor.id && w.slot === Number(item.button.dataset.slot));
          if (work?.image) {
            thumb = document.createElement("img"); thumb.className = "map-thumbnail"; thumb.alt = "";
            thumb.loading = "lazy"; thumb.decoding = "async"; thumb.src = work.image;
            item.button.prepend(thumb);
          }
        }
      }
      if (group.items.length < 2 || outside) continue;
      const button = document.createElement("button");
      button.type = "button"; button.className = "map-cluster";
      button.dataset.cluster = group.items.map(p => p.button.dataset.slot).join("-");
      button.style.left = x + "px"; button.style.top = y + "px"; button.textContent = group.items.length;
      button.setAttribute("aria-label", "Ampliar grupo de " + group.items.length + " obras: " + group.items.map(p => p.button.dataset.slot).join(", "));
      button.addEventListener("click", () => {
        if (blocked()) return;
        zoomAt(state.zoom * 2, x, y); viewport.focus({ preventScroll: true });
      });
      clusters.append(button);
      if (button.dataset.cluster === focusedKey) button.focus({ preventScroll: true });
    }
  }
  minus.addEventListener("click", () => { if (!blocked()) zoomAt(state.zoom / 1.5, viewport.clientWidth / 2, viewport.clientHeight / 2); });
  plus.addEventListener("click", () => { if (!blocked()) zoomAt(state.zoom * 1.5, viewport.clientWidth / 2, viewport.clientHeight / 2); });
  reset.addEventListener("click", () => { if (!blocked()) fit(); });
  function local(event) { const r = viewport.getBoundingClientRect(); return { x: event.clientX - r.left, y: event.clientY - r.top }; }
  function begin() {
    const points = [...pointers.values()];
    if (points.length >= 2) {
      const [a, b] = points, x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      gesture = { kind: "pinch", distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), zoom: state.zoom, wx: (x - state.x) / scale(), wy: (y - state.y) / scale() }; moved = true;
    } else if (points.length) gesture = { kind: state.zoom > 1.001 ? "pan" : "scroll", start: points[0], last: points[0], x: state.x, y: state.y };
    else gesture = null;
  }
  viewport.addEventListener("pointerdown", event => {
    if (!floor?.realMap || blocked() || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (!pointers.size) moved = false;
    pointers.set(event.pointerId, local(event)); begin();
    if (pointers.size > 1) for (const id of pointers.keys()) viewport.setPointerCapture(id);
  });
  viewport.addEventListener("pointermove", event => {
    if (!pointers.has(event.pointerId) || blocked()) return;
    const p = local(event); pointers.set(event.pointerId, p);
    if (!gesture) return;
    if (gesture.kind === "pinch") {
      const [a, b] = [...pointers.values()];
      state.zoom = clamp(gesture.zoom * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance, 1, 32);
      state.x = (a.x + b.x) / 2 - gesture.wx * scale(); state.y = (a.y + b.y) / 2 - gesture.wy * scale();
    } else {
      const dx = p.x - gesture.start.x, dy = p.y - gesture.start.y;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      moved = true;
      if (gesture.kind === "pan") { state.x = gesture.x + dx; state.y = gesture.y + dy; }
      else if (event.pointerType !== "mouse") { const delta = gesture.last.y - p.y; window.scrollBy(0, delta); viewport.dispatchEvent(new CustomEvent("mapscrollintent", { detail: delta })); }
      gesture.last = p;
    }
    if (!viewport.hasPointerCapture(event.pointerId)) viewport.setPointerCapture(event.pointerId);
    event.preventDefault(); viewport.dataset.dragging = "true"; schedule();
  });
  function end(event) {
    if (!pointers.has(event.pointerId)) return;
    if (moved || event.type === "pointercancel") ignoreClickUntil = performance.now() + 350;
    pointers.delete(event.pointerId); begin();
    if (!pointers.size) viewport.dataset.dragging = "false";
  }
  viewport.addEventListener("pointerup", end);
  viewport.addEventListener("pointercancel", end);
  viewport.addEventListener("lostpointercapture", end);
  viewport.addEventListener("pointerleave", event => { if (event.pointerType === "mouse" && !viewport.hasPointerCapture(event.pointerId)) end(event); });
  viewport.addEventListener("click", event => {
    if (event.detail && performance.now() < ignoreClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  viewport.addEventListener("dragstart", event => event.preventDefault());
  viewport.addEventListener("keydown", event => {
    if (event.target !== viewport || blocked() || !floor?.realMap) return;
    const shifts = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] };
    if (shifts[event.key] && state.zoom > 1) { event.preventDefault(); state.x += shifts[event.key][0]; state.y += shifts[event.key][1]; schedule(); }
    if (["+", "=", "-", "0"].includes(event.key)) { event.preventDefault(); if (event.key === "0") fit(); else zoomAt(state.zoom * (event.key === "-" ? 1 / 1.5 : 1.5), viewport.clientWidth / 2, viewport.clientHeight / 2); }
  });
  new ResizeObserver(fit).observe(viewport);
  new MutationObserver(() => { if (blocked()) { pointers.clear(); gesture = null; } schedule(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("explorationchange", schedule);
  window.EXHIBITION_MAP = {
    refresh: schedule,
    setFloor(next) {
      floor = next; clusters.replaceChildren(); image.style.transform = "";
      document.getElementById("map-controls").hidden = !floor.realMap;
      viewport.dataset.interactive = String(Boolean(floor.realMap)); fit();
    }
  };
})();



