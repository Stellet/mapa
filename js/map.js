"use strict";
(() => {
  const viewport = document.getElementById("map-viewport"), svg = document.getElementById("map-svg");
  const content = document.getElementById("map-content"), slots = document.getElementById("slots"), clusters = document.getElementById("map-clusters");
  const fan = document.getElementById("cluster-fan");
  const minus = document.getElementById("zoom-out"), plus = document.getElementById("zoom-in"), reset = document.getElementById("zoom-reset");
  // O viewBox faz fit-width; toda navegação ocorre nas unidades do SVG raiz.
  const state = { x: 0, y: 0, scale: 1 };
  const minScale = 0.2;
  const pointers = new Map();
  let floor, frame = 0, gesture = null, moved = false, tapTarget = null, ignoreClickUntil = 0;
  const blocked = () => document.body.classList.contains("sheet-open");
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const mapHeight = () => Number((floor?.viewBox || "0 0 360 1780").split(/\s+/)[3]);
  let fanTrigger = null;
  function setTriggerOpen(trigger, open) {
    trigger.classList.toggle("is-open", open);
    trigger.querySelector(".cluster-count").textContent = open ? "×" : trigger.dataset.count;
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", (open ? "Fechar" : "Abrir") + " grupo de " + trigger.dataset.count + " obras: " + trigger.dataset.numbers);
    const pixels = svg.getScreenCTM().a * state.scale;
    const diameter = open ? 32 : 44;
    trigger.style.left = Number(trigger.dataset.centerX) - diameter / 2 / pixels + "px";
    trigger.style.top = Number(trigger.dataset.centerY) - diameter / 2 / pixels + "px";
  }
  function closeFan() {
    if (fan.hidden) return;
    fan.hidden = true; fan.replaceChildren(); fan.classList.remove("is-scrollable"); fan.scrollTop = 0;
    if (fanTrigger) setTriggerOpen(fanTrigger, false);
    fanTrigger = null;
  }
  function fanCandidates(centerX, centerY, diameter, step, needed) {
    const positions = [], half = diameter / 2, gap = 6;
    const limit = Math.max(Math.ceil(viewport.clientWidth / step), Math.ceil(viewport.clientHeight / step)) + 1;
    for (let radius = 1; radius <= limit && positions.length < needed; radius++) {
      for (let row = -radius; row <= radius; row++) {
        for (let column = -radius; column <= radius; column++) {
          if (Math.max(Math.abs(row), Math.abs(column)) !== radius) continue;
          const x = centerX + column * step, y = centerY + row * step;
          if (x - half < gap || y - half < gap || x + half > viewport.clientWidth - gap || y + half > viewport.clientHeight - gap) continue;
          if (Math.hypot(x - centerX, y - centerY) < (32 + diameter) / 2 + gap) continue;
          positions.push({ x, y, distance: column * column + row * row });
        }
      }
    }
    positions.sort((a, b) => a.distance - b.distance || a.y - b.y || a.x - b.x);
    return positions;
  }
  function positionFan(trigger) {
    const viewportRect = viewport.getBoundingClientRect(), triggerRect = trigger.getBoundingClientRect();
    const centerX = triggerRect.left + triggerRect.width / 2 - viewportRect.left;
    const centerY = triggerRect.top + triggerRect.height / 2 - viewportRect.top;
    const buttons = [...fan.querySelectorAll(".cluster-fan-item")];
    let diameter = 44, step = 50, positions = fanCandidates(centerX, centerY, diameter, step, buttons.length);
    if (positions.length < buttons.length) {
      diameter = 36; step = 40;
      positions = fanCandidates(centerX, centerY, diameter, step, buttons.length);
    }
    if (positions.length < buttons.length) {
      diameter = 34; step = 38;
      positions = fanCandidates(centerX, centerY, diameter, step, buttons.length);
    }
    fan.style.setProperty("--fan-diameter", diameter + "px");
    fan.classList.toggle("is-scrollable", positions.length < buttons.length);
    buttons.forEach((button, index) => {
      const point = positions[index] || { x: 6 + diameter / 2 + index % Math.max(1, Math.floor((viewport.clientWidth - 12) / step)) * step,
        y: viewport.clientHeight + diameter / 2 + Math.floor((index - positions.length) / Math.max(1, Math.floor((viewport.clientWidth - 12) / step))) * step };
      button.style.left = point.x - diameter / 2 + "px";
      button.style.top = point.y - diameter / 2 + "px";
    });
  }
  function openFan(items, trigger) {
    closeFan();
    const fragment = document.createDocumentFragment();
    [...items].sort((a, b) => Number(a.button.dataset.slot) - Number(b.button.dataset.slot)).forEach(item => {
      const number = item.button.dataset.slot.padStart(2, "0");
      const button = document.createElement("button");
      button.type = "button"; button.className = "cluster-fan-item"; button.textContent = number;
      button.setAttribute("aria-label", item.button.getAttribute("aria-label") || "Abrir obra " + number);
      button.addEventListener("click", () => { closeFan(); item.button.click(); });
      fragment.append(button);
    });
    fan.append(fragment); fan.hidden = false; fanTrigger = trigger;
    setTriggerOpen(trigger, true); positionFan(trigger);
  }
  function svgPoint(event) {
    const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }
  function constrain() {
    const height = svg.viewBox.baseVal.height;
    const mapWidth = 360 * state.scale, scaledHeight = mapHeight() * state.scale;
    state.x = mapWidth <= 360 ? (360 - mapWidth) / 2 : clamp(state.x, 360 - mapWidth, 0);
    state.y = scaledHeight <= height ? (height - scaledHeight) / 2 : clamp(state.y, height - scaledHeight, 0);
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
    state.scale = clamp(scale, minScale, 32);
    state.x = point.x - world.x * state.scale; state.y = point.y - world.y * state.scale;
    constrain(); schedule();
  }
  const center = () => ({ x: 180, y: svg.viewBox.baseVal.height / 2 });
  function render() {
    if (!floor || !viewport.clientWidth || !viewport.clientHeight) return;
    constrain(); content.setAttribute("transform", `translate(${state.x} ${state.y}) scale(${state.scale})`);
    viewport.dataset.zoomed = String(state.scale > 1.001);
    reset.textContent = Math.round(state.scale * 100) + "%";
    document.getElementById("zoom-status").textContent = "Zoom " + reset.textContent;
    minus.disabled = blocked() || state.scale <= minScale; plus.disabled = blocked() || state.scale >= 32; reset.disabled = blocked();
    const pixels = svg.getScreenCTM().a * state.scale;
    content.style.setProperty("--marker-unit", 1 / pixels + "px");
    const size = 44 / pixels, groups = [];
    for (const button of slots.children) {
      const point = floor.slots.find(s => s.number === Number(button.dataset.slot));
      const x = point.x / 100 * 360, y = point.y / 100 * mapHeight();
      button.style.left = x - size / 2 + "px"; button.style.top = y - size / 2 + "px";
      button.classList.remove("clustered", "outside-map");
      if (button.hidden) { button.querySelector("img")?.remove(); continue; }
      const selected = button.getAttribute("aria-pressed") === "true";
      let group = !selected && groups.find(g => !g.selected && Math.hypot(g.x - x, g.y - y) * pixels < 48);
      if (!group) { group = { x, y, selected, items: [] }; groups.push(group); }
      group.items.push({ button, x, y });
    }
    const focusedKey = document.activeElement?.dataset.cluster;
    const openKey = fanTrigger?.dataset.cluster;
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
      button.dataset.count = numbers.length;
      button.dataset.numbers = numbers.join(", ");
      button.dataset.centerX = x; button.dataset.centerY = y;
      const count = document.createElement("span"); count.className = "cluster-count";
      button.append(count);
      setTriggerOpen(button, button.dataset.cluster === openKey);
      button.setAttribute("aria-haspopup", "true");
      button.addEventListener("click", () => {
        if (blocked()) return;
        if (fanTrigger?.dataset.cluster === button.dataset.cluster) closeFan();
        else openFan(group.items, button);
      });
      clusters.append(button);
      if (button.dataset.cluster === focusedKey) button.focus({ preventScroll: true });
    }
    if (openKey) {
      const current = [...clusters.children].find(button => button.dataset.cluster === openKey);
      if (current) { fanTrigger = current; positionFan(current); }
      else closeFan();
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
  document.addEventListener("pointerdown", event => {
    if (!fan.hidden && (event.target === fan || (!fan.contains(event.target) && !event.target.closest(".map-cluster")))) closeFan();
  }, true);
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeFan(); });
  svg.addEventListener("pointermove", event => {
    if (!pointers.has(event.pointerId) || blocked()) return;
    const previous = pointers.get(event.pointerId), point = svgPoint(event);
    pointers.set(event.pointerId, point);
    if (!gesture) return;
    if (gesture.kind === "pinch") {
      const [a, b] = [...pointers.values()];
      state.scale = clamp(gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance, minScale, 32);
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
      floor = next; closeFan(); clusters.replaceChildren();
      document.getElementById("map-controls").hidden = !floor.realMap;
      viewport.dataset.interactive = String(Boolean(floor.realMap)); fit();
    }
  };
})();
