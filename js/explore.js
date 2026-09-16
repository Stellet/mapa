"use strict";

(() => {
  const shell = document.getElementById("navigation-shell");
  const header = shell.querySelector("header");
  const nav = document.getElementById("sub-nav");
  const viewport = document.getElementById("map-viewport");
  const filters = document.getElementById("filter-panel");
  const toggle = document.getElementById("filter-toggle");
  const mapView = document.getElementById("map-view");
  const sentinel = document.getElementById("map-top-sentinel");
  let layoutFrame = 0, topObserver = null, observerMargin = "";
  const stickyBottom = () => (filters.hidden ? nav : filters).getBoundingClientRect().bottom;
  function observeTop() {
    if (mapView.hidden || document.body.classList.contains("sheet-open")) {
      topObserver?.disconnect(); observerMargin = ""; return;
    }
    // Histerese: só expandir quando o topo voltou alguns pixels à zona visível.
    const boundary = Math.max(0, stickyBottom() + (shell.dataset.compact === "true" ? 4 : -4));
    const margin = `-${Math.round(boundary)}px 0px 0px 0px`;
    if (margin === observerMargin) return;
    topObserver?.disconnect(); observerMargin = margin;
    topObserver = new IntersectionObserver(entries => {
      if (mapView.hidden || document.body.classList.contains("sheet-open")) return;
      const entry = entries[entries.length - 1];
      if (entry.isIntersecting) setCompact(false);
      else if (entry.boundingClientRect.bottom <= entry.rootBounds.top) setCompact(true);
    }, { rootMargin: margin, threshold: 0 });
    topObserver.observe(sentinel);
  }
  function measure() {
    layoutFrame = 0;
    if (!mapView.hidden) {
      const height = window.visualViewport?.height || window.innerHeight;
      const top = Math.max(stickyBottom(), 0);
      const summary = document.getElementById("results-status").offsetHeight + document.getElementById("speech-status").offsetHeight;
      viewport.style.setProperty("--map-height", Math.max(0, height - top - summary) + "px");
    }
    observeTop();
  }
  function queueMeasure() { if (!layoutFrame) layoutFrame = requestAnimationFrame(measure); }
  function setCompact(value) {
    if (document.body.classList.contains("sheet-open") || shell.dataset.compact === String(value)) return;
    // Reserva só durante esta atualização síncrona: evita limitar scrollY quando
    // o header encolhe antes de a área do mapa ganhar a altura correspondente.
    if (!mapView.hidden) shell.style.minHeight = shell.offsetHeight + "px";
    shell.dataset.compact = String(value);
    if (value) { filters.hidden = true; toggle.setAttribute("aria-expanded", "false"); }
    measure(); shell.style.removeProperty("min-height"); queueMeasure();
  }
  function onScroll() {
    if (mapView.hidden) {
      if (window.scrollY > 24) setCompact(true);
      else if (window.scrollY <= 2) setCompact(false);
    }
    queueMeasure();
  }
  new ResizeObserver(queueMeasure).observe(shell);
  new ResizeObserver(queueMeasure).observe(document.getElementById("results-status"));
  new ResizeObserver(queueMeasure).observe(document.getElementById("speech-status"));
  new MutationObserver(queueMeasure).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", queueMeasure);
  window.visualViewport?.addEventListener("resize", queueMeasure);
  document.addEventListener("explorationchange", queueMeasure);
  queueMeasure();
  const button = document.getElementById("speak-screen");
  const status = document.getElementById("speech-status");
  const sheet = document.getElementById("work-sheet");
  const synthesis = window.speechSynthesis;
  let voice = null, speaking = false, generation = 0;
  function stop(message = "") {
    generation++;
    if (synthesis) synthesis.cancel();
    speaking = false;
    button.textContent = "OUVIR ESTA TELA";
    button.setAttribute("aria-pressed", "false");
    if (!button.disabled) status.textContent = message;
  }
  function loadVoices() {
    if (!synthesis || !("SpeechSynthesisUtterance" in window)) {
      button.disabled = true;
      status.textContent = "Leitura por voz indisponível neste navegador.";
      return;
    }
    const local = synthesis.getVoices().filter(item => item.localService);
    voice = local.find(item => /^pt[-_]BR$/i.test(item.lang)) || local.find(item => /^pt/i.test(item.lang)) || local[0];
    button.disabled = !voice;
    if (!speaking) status.textContent = voice ? "" : "Nenhuma voz local disponível. A leitura depende das vozes instaladas no dispositivo.";
  }
  function screenText() {
    const text = id => document.getElementById(id).textContent.trim();
    const parts = [document.querySelector("h1").textContent];
    if (!sheet.hidden) {
      parts.push(text("work-number"), text("work-heading"), text("work-artist"));
      if (sheet.dataset.state === "expanded") parts.push(text("work-description"), text("audio-heading"), text("audio-note"), text("reading-heading"), text("work-reading"), document.querySelector(".interest-button").textContent, text("interest-note"));
    } else {
      const mapMode = !document.getElementById("map-view").hidden;
      parts.push(mapMode ? "Modo mapa" : "Modo lista", text("results-status"));
      if (!document.getElementById("filter-panel").hidden) {
        for (const select of document.querySelectorAll("#filter-panel select")) parts.push(select.parentElement.firstChild.textContent, select.selectedOptions[0].textContent);
      }
      if (mapMode) parts.push(text("map-instructions"));
      const selector = mapMode ? "#slots .slot:not([hidden])" : "#work-list .list-work";
      for (const work of document.querySelectorAll(selector)) parts.push(work.getAttribute("aria-label"));
    }
    return parts.filter(Boolean).join(". ");
  }
  button.addEventListener("click", () => {
    if (speaking) { stop("Leitura interrompida."); return; }
    if (!voice) return;
    document.getElementById("work-audio").pause();
    stop();
    speaking = true;
    button.textContent = "PARAR LEITURA";
    button.setAttribute("aria-pressed", "true");
    status.textContent = "Lendo o conteúdo textual da tela.";
    const token = generation;
    let remaining = screenText();
    function next() {
      if (token !== generation) return;
      if (!remaining) { stop("Leitura concluída."); return; }
      let length = Math.min(220, remaining.length);
      if (length < remaining.length) length = remaining.lastIndexOf(" ", length) || length;
      const utterance = new SpeechSynthesisUtterance(remaining.slice(0, length));
      remaining = remaining.slice(length).trim();
      utterance.lang = "pt-BR";
      utterance.voice = voice;
      utterance.onend = next;
      utterance.onerror = () => { if (token === generation) stop("Não foi possível concluir a leitura neste dispositivo."); };
      synthesis.speak(utterance);
    }
    next();
  });
  document.addEventListener("explorationchange", () => stop());
  document.getElementById("work-audio").addEventListener("play", () => stop());
  new MutationObserver(() => stop()).observe(sheet, { attributes: true, attributeFilter: ["hidden", "data-state"] });
  window.addEventListener("pagehide", () => stop());
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  if (synthesis) synthesis.addEventListener("voiceschanged", loadVoices);
  loadVoices();
})();




