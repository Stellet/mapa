"use strict";

// Controla apenas a altura, os gestos e o bloqueio de rolagem do painel.
(() => {
  const sheet = document.getElementById("work-sheet");
  const header = document.getElementById("sheet-header");
  const content = document.getElementById("sheet-content");
  const handle = document.getElementById("sheet-handle");
  let locked = false;
  let savedScroll = 0;
  let touch = null;
  let mouse = null;
  let suppressClick = false;
  let wheel = null;
  let wheelTimer;

  function setState(state) {
    sheet.dataset.state = state;
    const expanded = state === "expanded";
    if (!expanded) {
      if (content.contains(document.activeElement)) handle.focus({ preventScroll: true });
      content.scrollTop = 0;
    }
    content.inert = !expanded;
    handle.setAttribute("aria-expanded", String(expanded));
    handle.setAttribute("aria-label", expanded ? "Recolher painel" : "Expandir painel");
    document.dispatchEvent(new CustomEvent("sheetstatechange", { detail: { expanded } }));
  }

  function resetGestures() {
    touch = null;
    mouse = null;
    wheel = null;
    clearTimeout(wheelTimer);
  }

  window.EXHIBITION_SHEET = {
    openPartial() {
      resetGestures();
      if (!locked) {
        savedScroll = window.scrollY;
        document.body.style.top = "-" + savedScroll + "px";
        document.body.classList.add("sheet-open");
        locked = true;
      }
      setState("partial");
      sheet.hidden = false;
    },
    close() {
      resetGestures();
      sheet.hidden = true;
      setState("partial");
      if (locked) {
        document.body.classList.remove("sheet-open");
        document.body.style.removeProperty("top");
        window.scrollTo(0, savedScroll);
        locked = false;
      }
    }
  };

  handle.addEventListener("click", () => {
    if (suppressClick) { suppressClick = false; return; }
    setState(sheet.dataset.state === "expanded" ? "partial" : "expanded");
  });

  document.getElementById("sheet-more").addEventListener("click", () => {
    setState("expanded");
    content.focus({ preventScroll: true });
  });

  // Um gesto pertence ao painel OU ao scroll nativo até terminar.
  // Chegar ao topo durante a rolagem exige um novo puxão para recolher.
  sheet.addEventListener("touchstart", event => {
    if (event.touches.length !== 1 || event.target.closest("audio, #close-sheet, .sheet-partial-actions")) {
      touch = null;
      return;
    }
    touch = {
      x: event.touches[0].clientX, y: event.touches[0].clientY,
      partial: sheet.dataset.state === "partial",
      onHeader: header.contains(event.target),
      atTop: content.scrollTop <= 1,
      owner: null
    };
  }, { passive: true });

  sheet.addEventListener("touchmove", event => {
    if (!touch || event.touches.length !== 1) return;
    const dy = event.touches[0].clientY - touch.y;
    const dx = event.touches[0].clientX - touch.x;
    if (!touch.owner) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (Math.abs(dx) > Math.abs(dy)) { touch.owner = "native"; return; }
      touch.owner = touch.partial || touch.onHeader || (touch.atTop && dy > 0) ? "sheet" : "native";
    }
    if (touch.owner !== "sheet") return;
    if (event.cancelable) event.preventDefault();
    if (!touch.changed && Math.abs(dy) >= 36) {
      if (touch.partial && dy < 0) setState("expanded");
      else if (!touch.partial && dy > 0) setState("partial");
      touch.changed = true;
    }
  }, { passive: false });
  sheet.addEventListener("touchend", () => { touch = null; });
  sheet.addEventListener("touchcancel", () => { touch = null; });

  // Mouse: arraste pelo cabeçalho. Touch utiliza os eventos acima.
  header.addEventListener("pointerdown", event => {
    if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("#close-sheet, .sheet-partial-actions")) return;
    suppressClick = false;
    mouse = { y: event.clientY, partial: sheet.dataset.state === "partial", changed: false };

  });
  header.addEventListener("pointermove", event => {
    if (!mouse) return;
    const dy = event.clientY - mouse.y;
    if (Math.abs(dy) >= 8 && !header.hasPointerCapture(event.pointerId)) header.setPointerCapture(event.pointerId);
    if (!mouse.changed && Math.abs(dy) >= 36) {
      if (mouse.partial && dy < 0) setState("expanded");
      else if (!mouse.partial && dy > 0) setState("partial");
      mouse.changed = true;
      suppressClick = true;
    }
  });
  header.addEventListener("pointerup", () => { mouse = null; setTimeout(() => { suppressClick = false; }, 0); });
  header.addEventListener("pointercancel", () => { mouse = null; });

  sheet.addEventListener("wheel", event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (!wheel) wheel = { owner: sheet.dataset.state === "partial" || (content.scrollTop <= 1 && event.deltaY < 0) ? "sheet" : "native", total: 0, changed: false };
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheel = null; }, 180);
    if (wheel.owner !== "sheet") return;
    event.preventDefault();
    wheel.total += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? content.clientHeight : 1);
    if (!wheel.changed && Math.abs(wheel.total) >= 24) {
      if (wheel.total > 0) setState("expanded");
      else setState("partial");
      wheel.changed = true;
    }
  }, { passive: false });
})();


