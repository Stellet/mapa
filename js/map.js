"use strict";
(() => {
  const viewport = document.getElementById("map-viewport"), svg = document.getElementById("map-svg");
  const content = document.getElementById("map-content"), slots = document.getElementById("slots"), clusters = document.getElementById("map-clusters");
  const minus = document.getElementById("zoom-out"), plus = document.getElementById("zoom-in"), reset = document.getElementById("zoom-reset");
  // O viewBox faz fit-width; toda navegação ocorre nas unidades do SVG raiz.
  const state = { x: 0, y: 0, scale: 1 };
  const pointers = new Map();
  let floor, frame = 0, gesture = null, moved = false, tapTarget = null, ignoreClickUntil = 0;
  const blocked = () => document.body.classList.contains("sheet-open");
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function svgPoint(event) {
    const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }
  function constrain() {
    const height = svg.viewBox.baseVal.height;
    state.x = clamp(state.x, 360 - 360 * state.scale, 0);
    state.y = clamp(state.y, Math.min(0, height - 1780 * state.scale), Math.max(0, height - 1780 * state.scale));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; render(); }); }
  function clearPointers() {
    const ids = [...pointers.keys()]; pointers.clear(); gesture = null;
    for (const id of ids) if (svg.hasPointerCapture(id)) svg.releasePointerCapture(id);
    viewport.dataset.dragging = "false";
  }
  function fit() {
    if (!viewport.clientWidth || !viewport.clientHeight) return;
    svg.setAttribute("viewBox", `0 0 360 ${360 * viewport.clientHeight / viewport.clientWidth}`);
    state.x = 0; state.y = 0; state.scale = 1; clearPointers(); schedule();
  }
  function zoomAt(scale, point) {
    const world = { x: (point.x - state.x) / state.scale, y: (point.y - state.y) / state.scale };
    state.scale = clamp(scale, 1, 32);
    state.x = point.x - world.x * state.scale; state.y = point.y - world.y * state.scale;
    constrain(); schedule();
  }
  const center = () => ({ x: 180, y: svg.viewBox.baseVal.height / 2 });
  function clusterLabel(numbers) {
    const ordered = [...numbers].sort((a, b) => a - b);
    if (ordered.every((n, i) => i === 0 || n === ordered[i - 1] + 1)) return ordered[0] + "–" + ordered.at(-1);
    return ordered.slice(0, 3).join(", ") + (ordered.length > 3 ? "…" : "");
  }
  function render() {
    if (!floor || !viewport.clientWidth || !viewport.clientHeight) return;
    constrain(); content.setAttribute("transform", `translate(${state.x} ${state.y}) scale(${state.scale})`);
    viewport.dataset.zoomed = String(state.scale > 1.001);
    reset.textContent = Math.round(state.scale * 100) + "%";
    document.getElementById("zoom-status").textContent = "Zoom " + reset.textContent;
    minus.disabled = blocked() || state.scale <= 1; plus.disabled = blocked() || state.scale >= 32; reset.disabled = blocked();
    const pixels = svg.getScreenCTM().a * state.scale;
    content.style.setProperty("--marker-unit", 1 / pixels + "px");
    const size = 44 / pixels, groups = [];
    for (const button of slots.children) {
      const point = floor.slots.find(s => s.number === Number(button.dataset.slot));
      const x = point.x / 100 * 360, y = point.y / 100 * 1780;
      button.style.left = x - size / 2 + "px"; button.style.top = y - size / 2 + "px";
      button.classList.remove("clustered", "outside-map");
      if (button.hidden) { button.querySelector("img")?.remove(); continue; }
      const selected = button.getAttribute("aria-pressed") === "true";
      let group = !selected && groups.find(g => !g.selected && Math.hypot(g.x - x, g.y - y) * pixels < 48);
      if (!group) { group = { x, y, selected, items: [] }; groups.push(group); }
      group.items.push({ button, x, y });
    }
    const focusedKey = document.activeElement?.dataset.cluster;
    clusters.replaceChildren();
    for (const group of groups) {
      const x = group.items.reduce((sum, p) => sum + p.x, 0) / group.items.length;
      const y = group.items.reduce((sum, p) => sum + p.y, 0) / group.items.length;
      const sx = state.x + x * state.scale, sy = state.y + y * state.scale;
      const margin = 24 / svg.getScreenCTM().a;
      const outside = sx < -margin || sy < -margin || sx > 360 + margin || sy > svg.viewBox.baseVal.height + margin;
      for (const item of group.items) {
        item.button.classList.toggle("clustered", group.items.length > 1);
        item.button.classList.toggle("outside-map", outside);
        const needsImage = state.scale >= 4 && !outside && group.items.length === 1;
        let thumb = item.button.querySelector("img");
        if (!needsImage) { thumb?.remove(); continue; }
        if (!thumb) {
          const work = window.EXHIBITION_DATA.find(w => w.floor === floor.id && w.slot === Number(item.button.dataset.slot));
          if (work?.image) {
            thumb = document.createElement("img"); thumb.className = "map-thumbnail"; thumb.alt = "";
            thumb.loading = "lazy"; thumb.decoding = "async"; thumb.src = work.image; item.button.prepend(thumb);
          }
        }
      }
      if (group.items.length < 2 || outside) continue;
      const numbers = group.items.map(p => Number(p.button.dataset.slot));
      const button = document.createElement("button"); button.type = "button"; button.className = "map-cluster";
      button.dataset.cluster = numbers.join("-");
      button.style.left = x - size / 2 + "px"; button.style.top = y - size / 2 + "px";
      const count = document.createElement("span"), range = document.createElement("span");
      count.className = "cluster-count"; count.textContent = numbers.length;
      range.className = "cluster-range"; range.textContent = clusterLabel(numbers); button.append(count, range);
      button.setAttribute("aria-label", "Ampliar grupo de " + numbers.length + " obras: " + numbers.join(", "));
      button.addEventListener("click", () => {
        if (blocked()) return;
        zoomAt(state.scale * 2, { x: state.x + x * state.scale, y: state.y + y * state.scale });
        viewport.focus({ preventScroll: true });
      });
      clusters.append(button);
      if (button.dataset.cluster === focusedKey) button.focus({ preventScroll: true });
    }
  }
  function begin() {
    const points = [...pointers.values()];
    if (points.length >= 2) {
      const [a, b] = points, x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      gesture = { kind: "pinch", distance: Math.max(.001, Math.hypot(a.x - b.x, a.y - b.y)), scale: state.scale, wx: (x - state.x) / state.scale, wy: (y - state.y) / state.scale }; moved = true;
    } else if (points.length) gesture = { kind: "pan", start: points[0] };
    else gesture = null;
  }
  svg.addEventListener("pointerdown", event => {
    if (!floor?.realMap || blocked() || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (!pointers.size) { moved = false; tapTarget = event.target.closest(".slot, .map-cluster"); }
    pointers.set(event.pointerId, svgPoint(event)); svg.setPointerCapture(event.pointerId); begin();
  });
  svg.addEventListener("pointermove", event => {
    if (!pointers.has(event.pointerId) || blocked()) return;
    const previous = pointers.get(event.pointerId), point = svgPoint(event);
    pointers.set(event.pointerId, point);
    if (!gesture) return;
    if (gesture.kind === "pinch") {
      const [a, b] = [...pointers.values()];
      state.scale = clamp(gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance, 1, 32);
      state.x = (a.x + b.x) / 2 - gesture.wx * state.scale;
      state.y = (a.y + b.y) / 2 - gesture.wy * state.scale;
    } else {
      if (Math.hypot(point.x - gesture.start.x, point.y - gesture.start.y) * svg.getScreenCTM().a >= 6) moved = true;
      state.x += point.x - previous.x; state.y += point.y - previous.y;
    }
    constrain(); event.preventDefault(); viewport.dataset.dragging = String(moved); schedule();
  });
  function end(event) {
    if (!pointers.has(event.pointerId)) return;
    if (moved || event.type !== "pointerup") ignoreClickUntil = performance.now() + 350;
    pointers.delete(event.pointerId);
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    begin(); if (!pointers.size) viewport.dataset.dragging = "false";
  }
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  svg.addEventListener("lostpointercapture", end);
  svg.addEventListener("click", event => {
    if (!event.detail) return;
    if (performance.now() < ignoreClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (event.target === svg && tapTarget) {
      const target = tapTarget; tapTarget = null;
      event.preventDefault(); event.stopImmediatePropagation(); target.click();
    }
  }, true);
  svg.addEventListener("dragstart", event => event.preventDefault());
  svg.addEventListener("wheel", event => {
    if (!floor?.realMap || blocked() || pointers.size || !event.deltaY) return;
    event.preventDefault();
    const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
    zoomAt(state.scale * Math.exp(-pixels * .002), svgPoint(event));
  }, { passive: false });
  minus.addEventListener("click", () => { if (!blocked()) zoomAt(state.scale / 1.5, center()); });
  plus.addEventListener("click", () => { if (!blocked()) zoomAt(state.scale * 1.5, center()); });
  reset.addEventListener("click", () => { if (!blocked()) fit(); });
  viewport.addEventListener("keydown", event => {
    if (event.target !== viewport || blocked() || !floor?.realMap) return;
    const shifts = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] };
    if (shifts[event.key]) { event.preventDefault(); state.x += shifts[event.key][0]; state.y += shifts[event.key][1]; constrain(); schedule(); }
    if (["+", "=", "-", "0"].includes(event.key)) { event.preventDefault(); if (event.key === "0") fit(); else zoomAt(state.scale * (event.key === "-" ? 1 / 1.5 : 1.5), center()); }
  });
  new ResizeObserver(fit).observe(viewport);
  new MutationObserver(() => { if (blocked()) clearPointers(); schedule(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("explorationchange", schedule);
  window.EXHIBITION_MAP = {
    refresh: schedule,
    setFloor(next) {
      floor = next; clusters.replaceChildren();
      document.getElementById("map-controls").hidden = !floor.realMap;
      viewport.dataset.interactive = String(Boolean(floor.realMap)); fit();
    }
  };
})();
