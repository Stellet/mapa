"use strict";

// Camada isolada: remover este arquivo, #curatorial-intro e #open-curatorial para desativar.
(() => {
  const intro = document.getElementById("curatorial-intro");
  const openButton = document.getElementById("open-curatorial");
  if (!intro || !openButton) return;
  const stage = document.getElementById("intro-stage");
  const copy = document.getElementById("intro-copy");
  const pauseButton = document.getElementById("intro-pause");
  const closeButton = document.getElementById("intro-close");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation = null;
  let duration = 0;
  let travel = 0;
  let leaving = false;
  let resizeFrame = 0;
  let startFrame = 0;
  let background = [];
  let previousTouchY = null;
  let touchTravel = 0;
  let suppressClickUntil = 0;

  function closeIntro() {
    if (intro.hidden || leaving) return;
    leaving = true;
    cancelAnimationFrame(startFrame);
    cancelAnimationFrame(resizeFrame);
    if (animation) {
      animation.onfinish = null;
      animation.cancel();
      animation = null;
    }
    intro.classList.add("is-leaving");
    const complete = () => {
      intro.hidden = true;
      intro.classList.remove("is-leaving");
      document.body.classList.remove("intro-open");
      for (const item of background) item.element.inert = item.inert;
      background = [];
      openButton.setAttribute("aria-expanded", "false");
      openButton.focus({ preventScroll: true });
      leaving = false;
    };
    if (motionPreference.matches) complete();
    else window.setTimeout(complete, 380);
  }

  function updatePauseButton() {
    const paused = animation?.playState === "paused";
    pauseButton.textContent = paused ? "CONTINUAR" : "PAUSAR";
    pauseButton.setAttribute("aria-pressed", String(paused));
  }

  function togglePause() {
    if (!animation || leaving) return;
    if (animation.playState === "paused") animation.play();
    else animation.pause();
    updatePauseButton();
  }

  function moveCrawl(deltaY) {
    if (!animation || leaving || intro.classList.contains("is-reduced") || !deltaY) return;
    animation.pause();
    const next = Number(animation.currentTime) + deltaY / travel * duration;
    if (next >= duration) { closeIntro(); return; }
    animation.currentTime = Math.max(0, next);
    updatePauseButton();
  }

  function lastLineAtTop(startY) {
    const lastParagraph = copy.querySelector("p:last-of-type");
    const walker = document.createTreeWalker(lastParagraph || copy, NodeFilter.SHOW_TEXT);
    let node = null;
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) node = walker.currentNode;
    }
    if (!node) return -copy.offsetHeight;
    const end = node.textContent.trimEnd().length;
    const range = document.createRange();
    range.setStart(node, end - 1);
    range.setEnd(node, end);
    const target = stage.getBoundingClientRect().top;
    let lower = -copy.offsetHeight - stage.clientHeight;
    let upper = startY;
    for (let i = 0; i < 18; i++) {
      const middle = (lower + upper) / 2;
      copy.style.transform = `translate3d(0, ${middle}px, 0)`;
      if (range.getBoundingClientRect().top > target) upper = middle;
      else lower = middle;
    }
    copy.style.removeProperty("transform");
    return (lower + upper) / 2;
  }

  function startAnimation(progress = 0, paused = false) {
    const startY = stage.clientHeight * .95;
    const endY = lastLineAtTop(startY);
    travel = startY - endY;
    duration = Math.max(32000, travel / 28 * 1000);
    animation = copy.animate([
      { transform: `translate3d(0, ${startY}px, 0)` },
      { transform: `translate3d(0, ${endY}px, 0)` }
    ], { duration, easing: "linear", fill: "forwards" });
    animation.currentTime = progress * duration;
    if (paused) animation.pause();
    animation.onfinish = closeIntro;
    updatePauseButton();
  }

  function openIntro() {
    if (!intro.hidden || leaving) return;
    background = [...document.body.children]
      .filter(element => element !== intro && element.tagName !== "SCRIPT")
      .map(element => ({ element, inert: element.inert }));
    for (const item of background) item.element.inert = true;
    document.body.classList.add("intro-open");
    intro.hidden = false;
    const reduced = motionPreference.matches || !copy.animate;
    intro.classList.toggle("is-reduced", reduced);
    pauseButton.hidden = reduced;
    stage.tabIndex = reduced ? 0 : -1;
    stage.scrollTop = 0;
    openButton.setAttribute("aria-expanded", "true");
    closeButton.focus({ preventScroll: true });
    if (!reduced) startFrame = requestAnimationFrame(() => {
      if (!intro.hidden && !leaving) startAnimation();
    });
  }

  openButton.addEventListener("click", openIntro);
  closeButton.addEventListener("click", closeIntro);
  pauseButton.addEventListener("click", togglePause);
  copy.addEventListener("click", () => {
    if (Date.now() >= suppressClickUntil) togglePause();
  });
  intro.addEventListener("wheel", event => {
    if (intro.classList.contains("is-reduced")) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
    moveCrawl(event.deltaY * unit);
  }, { passive: false });
  stage.addEventListener("touchstart", event => {
    previousTouchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    touchTravel = 0;
  }, { passive: true });
  stage.addEventListener("touchmove", event => {
    if (intro.classList.contains("is-reduced")) return;
    event.preventDefault();
    if (event.touches.length !== 1 || previousTouchY === null) {
      previousTouchY = null;
      return;
    }
    const currentY = event.touches[0].clientY;
    const deltaY = previousTouchY - currentY;
    previousTouchY = currentY;
    touchTravel += Math.abs(deltaY);
    if (touchTravel > 4) suppressClickUntil = Date.now() + 400;
    moveCrawl(deltaY);
  }, { passive: false });
  stage.addEventListener("touchend", () => { previousTouchY = null; });
  stage.addEventListener("touchcancel", () => { previousTouchY = null; });
  intro.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.preventDefault(); closeIntro(); return; }
    if (event.key !== "Tab") return;
    const controls = pauseButton.hidden ? [closeButton, stage] : [pauseButton, closeButton];
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener("resize", () => {
    if (intro.hidden || leaving || !animation) return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const progress = Math.min(1, Number(animation.currentTime) / duration || 0);
      const paused = animation.playState === "paused";
      animation.onfinish = null;
      animation.cancel();
      startAnimation(progress, paused);
    });
  });
})();
