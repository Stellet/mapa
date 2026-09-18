"use strict";

(() => {
  const shell = document.getElementById("navigation-shell");
  const header = shell.querySelector("header");
  const nav = document.getElementById("sub-nav");
  const viewport = document.getElementById("map-viewport");
  const footer = document.getElementById("site-footer");
  const sponsors = document.querySelector(".sponsors-strip");
  const mapView = document.getElementById("map-view");
  const sentinel = document.getElementById("map-top-sentinel");
  let layoutFrame = 0, topObserver = null, observerMargin = "";
  let mapAtStart = true, mapTopVisible = true;
  const stickyBottom = () => nav.getBoundingClientRect().bottom;
  function updateMapCompact() {
    if (!mapView.hidden) setCompact(!mapAtStart || window.scrollY > 2 || (!mapTopVisible && window.scrollY > 0));
  }
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
      if (entry.isIntersecting) mapTopVisible = true;
      else if (entry.boundingClientRect.bottom <= entry.rootBounds.top) mapTopVisible = false;
      updateMapCompact();
    }, { rootMargin: margin, threshold: 0 });
    topObserver.observe(sentinel);
  }
  function measure() {
    layoutFrame = 0;
    const metaHeight = footer.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--meta-footer-height", metaHeight + "px");
    const footerHeight = metaHeight + sponsors.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--footer-height", footerHeight + "px");
    if (!mapView.hidden) {
      const height = window.innerHeight;
      const top = Math.max(stickyBottom(), 0);
      const summary = document.getElementById("results-status").offsetHeight + document.getElementById("speech-status").offsetHeight;
      viewport.style.setProperty("--map-height", Math.max(0, height - top - summary - footerHeight) + "px");
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
    measure(); shell.style.removeProperty("min-height"); queueMeasure();
  }
  function onScroll() {
    if (mapView.hidden) {
      if (window.scrollY > 24) setCompact(true);
      else if (window.scrollY <= 2) setCompact(false);
    } else updateMapCompact();
    queueMeasure();
  }
  new ResizeObserver(queueMeasure).observe(shell);
  new ResizeObserver(queueMeasure).observe(footer);
  new ResizeObserver(queueMeasure).observe(sponsors);
  new ResizeObserver(queueMeasure).observe(document.getElementById("results-status"));
  new ResizeObserver(queueMeasure).observe(document.getElementById("speech-status"));
  new MutationObserver(queueMeasure).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", queueMeasure);
  window.visualViewport?.addEventListener("resize", queueMeasure);
  document.addEventListener("mapnavigationchange", event => {
    mapAtStart = event.detail.atStart;
    updateMapCompact();
  });
  document.addEventListener("explorationchange", onScroll);
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
    button.textContent = "OUVIR TELA";
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
    const heading = document.querySelector("h1");
    const parts = [heading.querySelector("img")?.alt || heading.textContent];
    if (!sheet.hidden) {
      parts.push(text("work-number"), text("work-heading"), text("work-artist"));
      if (sheet.dataset.state === "expanded") {
        parts.push(text("work-description"));
        if (!document.getElementById("work-audio-section").hidden) parts.push(text("audio-heading"));
        if (!document.getElementById("work-reading-section").hidden) parts.push(text("reading-heading"), text("work-reading"));
        parts.push(document.querySelector(".interest-button").textContent);
      }
    } else {
      const mapMode = !document.getElementById("map-view").hidden;
      const spokenSummary = text("results-status")
        .replace("Andar 1: 88 obras.", "Andar 1: oitenta e oito obras.")
        .replace("Andar 2: 15 obras.", "Andar 2: quinze obras.");
      parts.push(mapMode ? "Modo mapa" : "Modo lista", spokenSummary);
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









