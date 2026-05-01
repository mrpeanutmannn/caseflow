const revealItems = document.querySelectorAll("[data-animate]");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const headerActions = document.querySelector(".header-actions");
const yearNode = document.getElementById("year");
const intakeForm = document.getElementById("intake-form");
const formNote = document.getElementById("form-note");
const wordTrack = document.querySelector(".word-rotator-track");
const wordRotator = document.querySelector(".word-rotator");
const isSafari =
  /^((?!chrome|chromium|crios|fxios|edg|opr|android).)*safari/i.test(
    navigator.userAgent
  ) && /apple/i.test(navigator.vendor || "");

if (isSafari) {
  document.documentElement.classList.add("is-safari");
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (menuToggle && siteNav && headerActions) {
  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("is-open", isOpen);
    headerActions.classList.toggle("is-open", isOpen);
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  [...siteNav.querySelectorAll("a"), ...headerActions.querySelectorAll("a")].forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
}

if (intakeForm && formNote) {
  const pages = Array.from(intakeForm.querySelectorAll("[data-form-page]"));
  const track = intakeForm.querySelector(".intake-form-track");
  const currentStepNode = intakeForm.querySelector("[data-form-step-current]");
  const conditionalToggles = Array.from(
    intakeForm.querySelectorAll("[data-conditional-toggle]")
  );
  const statePickers = Array.from(intakeForm.querySelectorAll("[data-state-picker]"));
  const stateOptions = [
    ["AL", "Alabama"],
    ["AK", "Alaska"],
    ["AZ", "Arizona"],
    ["AR", "Arkansas"],
    ["CA", "California"],
    ["CO", "Colorado"],
    ["CT", "Connecticut"],
    ["DE", "Delaware"],
    ["DC", "District of Columbia"],
    ["FL", "Florida"],
    ["GA", "Georgia"],
    ["HI", "Hawaii"],
    ["ID", "Idaho"],
    ["IL", "Illinois"],
    ["IN", "Indiana"],
    ["IA", "Iowa"],
    ["KS", "Kansas"],
    ["KY", "Kentucky"],
    ["LA", "Louisiana"],
    ["ME", "Maine"],
    ["MD", "Maryland"],
    ["MA", "Massachusetts"],
    ["MI", "Michigan"],
    ["MN", "Minnesota"],
    ["MS", "Mississippi"],
    ["MO", "Missouri"],
    ["MT", "Montana"],
    ["NE", "Nebraska"],
    ["NV", "Nevada"],
    ["NH", "New Hampshire"],
    ["NJ", "New Jersey"],
    ["NM", "New Mexico"],
    ["NY", "New York"],
    ["NC", "North Carolina"],
    ["ND", "North Dakota"],
    ["OH", "Ohio"],
    ["OK", "Oklahoma"],
    ["OR", "Oregon"],
    ["PA", "Pennsylvania"],
    ["RI", "Rhode Island"],
    ["SC", "South Carolina"],
    ["SD", "South Dakota"],
    ["TN", "Tennessee"],
    ["TX", "Texas"],
    ["UT", "Utah"],
    ["VT", "Vermont"],
    ["VA", "Virginia"],
    ["WA", "Washington"],
    ["WV", "West Virginia"],
    ["WI", "Wisconsin"],
    ["WY", "Wyoming"]
  ];
  let activePage = 0;

  statePickers.forEach((select) => {
    const selectedValue = select.value;

    stateOptions.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    });

    select.value = selectedValue;
  });

  const normalizeFormValue = (value) =>
    String(value || "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const getActiveControls = () =>
    Array.from(
      pages[activePage]?.querySelectorAll("input, select, textarea") || []
    ).filter((control) => !control.disabled);

  const validateActivePage = () => {
    const invalidControl = getActiveControls().find(
      (control) => !control.checkValidity()
    );

    if (!invalidControl) return true;

    invalidControl.reportValidity();
    return false;
  };

  const collectSafeFormData = () => {
    const formData = new FormData(intakeForm);
    const payload = {};

    formData.forEach((value, key) => {
      payload[key] = normalizeFormValue(value);
    });

    return payload;
  };

  const setControlTabState = (page, isActive) => {
    page.querySelectorAll("input, select, textarea, button").forEach((control) => {
      if (!isActive) {
        if (!control.hasAttribute("data-original-tabindex")) {
          control.dataset.originalTabindex = control.getAttribute("tabindex") || "";
        }
        control.setAttribute("tabindex", "-1");
        return;
      }

      if (control.hasAttribute("data-original-tabindex")) {
        const originalTabindex = control.dataset.originalTabindex;
        if (originalTabindex) {
          control.setAttribute("tabindex", originalTabindex);
        } else {
          control.removeAttribute("tabindex");
        }
        delete control.dataset.originalTabindex;
      } else {
        control.removeAttribute("tabindex");
      }
    });
  };

  const syncFormPage = (nextPage, shouldFocus = true) => {
    activePage = Math.max(0, Math.min(nextPage, pages.length - 1));
    intakeForm.dataset.activePage = String(activePage);
    intakeForm.style.setProperty("--active-page", activePage);

    pages.forEach((page, index) => {
      const isActive = index === activePage;
      page.classList.toggle("is-active", isActive);
      page.setAttribute("aria-hidden", String(!isActive));
      page.inert = !isActive;
      setControlTabState(page, isActive);
    });

    if (currentStepNode) {
      currentStepNode.textContent = String(activePage + 1);
    }

    formNote.textContent =
      activePage === 0
        ? "Start with the basics. The next step asks about attorney and funding details if you have them."
        : "Add attorney and funding details if they apply, then submit the preview application.";

    if (!shouldFocus) return;

    window.setTimeout(() => {
      const focusTarget = pages[activePage]?.querySelector(
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button"
      );
      focusTarget?.focus();
    }, 240);
  };

  const syncConditionalField = (toggle) => {
    const targetName = toggle.dataset.conditionalToggle;
    const field = intakeForm.querySelector(`[data-conditional-field="${targetName}"]`);
    if (!field) return;

    const shouldShow = toggle.value === "yes";
    field.hidden = !shouldShow;
    field.querySelectorAll("input, select, textarea").forEach((control) => {
      control.disabled = !shouldShow;
      if (!shouldShow) control.value = "";
    });
  };

  intakeForm.querySelector("[data-form-next]")?.addEventListener("click", () => {
    if (!validateActivePage()) return;
    syncFormPage(activePage + 1);
  });

  intakeForm.querySelector("[data-form-back]")?.addEventListener("click", () => {
    syncFormPage(activePage - 1);
  });

  conditionalToggles.forEach((toggle) => {
    syncConditionalField(toggle);
    toggle.addEventListener("change", () => syncConditionalField(toggle));
  });

  syncFormPage(0, false);

  intakeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateActivePage()) return;

    if (activePage < pages.length - 1) {
      syncFormPage(activePage + 1);
      return;
    }

    intakeForm.safePreviewPayload = collectSafeFormData();
    formNote.textContent =
      "Preview mode: this build does not submit yet, but the finished site can route these details directly to Caseflow.";
  });
}

document.querySelectorAll(".faq-item").forEach((item) => {
  const summary = item.querySelector("summary");
  const answer = item.querySelector(".faq-answer");
  if (!summary || !answer) return;

  const transitionFallbackMs = 560;
  let animationId = 0;
  let fallbackTimer = 0;
  let transitionCleanup = null;

  const setExpanded = (isExpanded) => {
    summary.setAttribute("aria-expanded", String(isExpanded));
  };

  const clearPendingTransition = () => {
    window.clearTimeout(fallbackTimer);

    if (transitionCleanup) {
      transitionCleanup();
      transitionCleanup = null;
    }
  };

  const afterHeightTransition = (id, callback) => {
    const complete = () => {
      if (id !== animationId) return;

      clearPendingTransition();
      callback();
    };

    const handleTransitionEnd = (transitionEvent) => {
      if (transitionEvent.propertyName !== "height") return;
      complete();
    };

    answer.addEventListener("transitionend", handleTransitionEnd);
    transitionCleanup = () => {
      answer.removeEventListener("transitionend", handleTransitionEnd);
    };
    fallbackTimer = window.setTimeout(complete, transitionFallbackMs);
  };

  const finishOpen = () => {
    item.classList.remove("is-opening", "is-closing");
    answer.style.height = "auto";
    setExpanded(true);
  };

  const finishClose = () => {
    item.open = false;
    item.classList.remove("is-opening", "is-closing");
    answer.style.height = "0px";
    setExpanded(false);
  };

  const openItem = () => {
    const id = ++animationId;

    clearPendingTransition();
    item.open = true;
    item.classList.remove("is-closing");
    item.classList.add("is-opening");
    answer.style.height = "0px";
    setExpanded(true);
    void answer.offsetHeight;
    answer.style.height = `${answer.scrollHeight}px`;
    afterHeightTransition(id, finishOpen);
  };

  const closeItem = () => {
    const id = ++animationId;

    clearPendingTransition();
    item.classList.remove("is-opening");
    item.classList.add("is-closing");
    setExpanded(false);
    answer.style.height = `${answer.scrollHeight}px`;
    void answer.offsetHeight;
    answer.style.height = "0px";
    afterHeightTransition(id, finishClose);
  };

  setExpanded(item.open);
  answer.style.height = item.open ? "auto" : "0px";

  summary.addEventListener("click", (event) => {
    event.preventDefault();

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      clearPendingTransition();
      animationId++;

      if (item.open) {
        finishClose();
      } else {
        item.open = true;
        finishOpen();
      }

      return;
    }

    if (item.open && !item.classList.contains("is-closing")) {
      closeItem();
      return;
    }

    openItem();
  });
});

if (wordTrack && wordRotator) {
  const words = Array.from(wordTrack.children);
  let activeIndex = 0;
  let wordHeight = 0;
  let rotationTimer = null;

  const setTrackPosition = () => {
    const activeWord = words[activeIndex];
    const y = activeWord ? activeWord.offsetTop : activeIndex * wordHeight;
    wordTrack.style.transform = `translate3d(0, -${y}px, 0)`;
  };

  const setWordMetrics = () => {
    let maxWidth = 0;
    let maxHeight = 0;

    words.forEach((word) => {
      const { width, height } = word.getBoundingClientRect();
      maxWidth = Math.max(maxWidth, width);
      maxHeight = Math.max(maxHeight, height);
    });

    if (!maxHeight) return;

    wordHeight = Math.ceil(maxHeight);
    wordRotator.style.setProperty("--roller-word-height", `${wordHeight}px`);
    wordRotator.style.setProperty("--roller-word-width", `${Math.ceil(maxWidth)}px`);
    setTrackPosition();
  };

  const rotateWords = () => {
    activeIndex = (activeIndex + 1) % words.length;
    setTrackPosition();
  };

  setWordMetrics();
  rotationTimer = window.setInterval(rotateWords, 2200);
  window.addEventListener("resize", setWordMetrics);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => setWordMetrics());
    words.forEach((word) => resizeObserver.observe(word));
  }
}

/**
 * Values marquee — clone the source group until the track is wide enough to
 * cover ultra-wide viewports, then animate by exactly one source-group width.
 * This prevents a blank tail from appearing before the loop resets.
 */
(function initValuesMarquee() {
  const marqueeViewport = document.querySelector(".values-marquee-viewport");
  const marqueeTrack = document.querySelector(".values-marquee-track");
  if (!marqueeViewport || !marqueeTrack) return;

  const sourceGroup = marqueeTrack.querySelector(".values-marquee-group");
  if (!sourceGroup) return;

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  let resizeRaf = 0;

  const syncMarquee = () => {
    const groups = Array.from(
      marqueeTrack.querySelectorAll(".values-marquee-group")
    );

    groups.slice(1).forEach((group) => group.remove());

    const sourceWidth = Math.ceil(sourceGroup.getBoundingClientRect().width);
    if (!sourceWidth) return;

    marqueeTrack.style.setProperty("--marquee-loop-width", `${sourceWidth}px`);

    if (prefersReducedMotion?.matches) return;

    const viewportWidth = Math.ceil(
      marqueeViewport.getBoundingClientRect().width
    );
    const minTrackWidth = viewportWidth + sourceWidth;

    let trackWidth = sourceWidth;
    while (trackWidth < minTrackWidth) {
      const clone = sourceGroup.cloneNode(true);
      clone.dataset.marqueeClone = "true";
      clone.setAttribute("aria-hidden", "true");
      marqueeTrack.appendChild(clone);
      trackWidth += sourceWidth;
    }
  };

  const requestSync = () => {
    if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
    resizeRaf = window.requestAnimationFrame(() => {
      resizeRaf = 0;
      syncMarquee();
    });
  };

  syncMarquee();
  window.addEventListener("resize", requestSync);
  window.addEventListener("load", requestSync);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(requestSync);
    resizeObserver.observe(marqueeViewport);
    resizeObserver.observe(sourceGroup);
  }

  prefersReducedMotion?.addEventListener?.("change", requestSync);
})();

/**
 * Hero dot grid — an animated field of dots whose per-dot opacity, radius,
 * and color are driven by a sum of traveling sine waves. The waves move at
 * different speeds, frequencies, and directions so their interference creates
 * organic "waves of brightness" rolling across the grid, in the spirit of the
 * Claude Code hero background.
 *
 * Guarantees:
 *  - Respects prefers-reduced-motion (renders a single static frame, no RAF).
 *  - Pauses when the hero scrolls off-screen.
 *  - Degrades to the pre-existing CSS dot grid if anything fails.
 */
(function initHeroDotGrid() {
  const canvas = document.querySelector(".hero-dot-canvas");
  if (!canvas) return;

  if (isSafari) {
    canvas.remove();
    return;
  }

  const backdrop = canvas.parentElement;
  const hero = backdrop && backdrop.closest(".hero");
  if (!backdrop || !hero) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  // Two-tone gray palette. Dots interpolate from a soft slate (trough) to a
  // deeper slate (crest). No brand color — the dots are a texture, not a
  // colorway element.
  const INK = { r: 110, g: 120, b: 130 };  // trough gray — softer
  const INK_DEEP = { r: 52, g: 62, b: 74 }; // crest gray — deeper slate

  // Grid tuning — tighter spacing and smaller dots for a finer, more delicate
  // texture that reads as a subtle field rather than a coarse pattern.
  const SPACING = 16;
  const DOT_BASE_RADIUS = 0.6;   // trough dot size
  const DOT_PEAK_RADIUS = 1.1;   // crest dot size
  const BASE_ALPHA = 0.10;       // baseline dot visibility — never fully gone
  const PEAK_ALPHA = 0.42;       // crest visibility — the bright bands

  // Traveling-wave parameters. Each entry is a plane wave:
  //   contribution = amp * sin(kx*x + ky*y + w*t + phase)
  // Mixing 4 waves at different directions/speeds gives a non-repeating-feeling
  // pattern without resorting to noise textures. Frequencies are chosen so that
  // a typical 1200–1600px-wide hero shows 2–3 bright bands at a time, which
  // reads as "waves rolling across" rather than a single broad pulse. The
  // angular frequencies (w) are a bit over 2× the previous values so the waves
  // visibly travel rather than creeping.
  const WAVES = [
    { kx: 0.0085, ky: 0.0012, w: 0.00092, phase: 0.0, amp: 1.0 },
    { kx: 0.0018, ky: 0.0096, w: 0.00074, phase: 1.3, amp: 0.92 },
    { kx: 0.0060, ky: 0.0055, w: -0.00063, phase: 2.1, amp: 0.85 },
    { kx: 0.0110, ky: -0.0070, w: 0.00118, phase: 4.7, amp: 0.55 }
  ];

  // "Text-safe zone" — attenuates dot alpha inside an ellipse positioned over
  // the hero-copy block so headline/paragraph stay legible. Coordinates are
  // measured each frame from the live hero-copy bounding box; the CSS glow
  // below the copy does the rest of the legibility lift.
  const TEXT_SAFE_MIN_ALPHA = 0.12;  // dots inside the ellipse get this fraction
  const TEXT_SAFE_INNER = 0.35;      // fully attenuated out to this normalized radius
  const TEXT_SAFE_OUTER = 1.05;      // fully unattenuated past this radius
  const heroCopy = hero.querySelector(".hero-copy");

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;
  let running = false;
  let lastFrameTime = 0;
  let elapsed = 0;
  let isVisible = true;

  const setSize = () => {
    const rect = backdrop.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    // Cap DPR at 2 — above that the per-frame pixel work is wasted for
    // something this subtle, and we want the hero to stay buttery on laptops.
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // smoothstep: S-curve from a→b, useful for mapping a wave value to alpha.
  const smoothstep = (a, b, v) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  const drawFrame = (time) => {
    ctx.clearRect(0, 0, width, height);

    // The wave sum range is roughly [-Σamp, +Σamp] ≈ [-3.32, 3.32]. We map a
    // symmetric slice around zero to 0..1 brightness so ~half the field lives
    // above the midpoint at any moment — crests and troughs get equal air.
    const CREST_LO = -1.9;
    const CREST_HI = 1.9;

    // A gentle horizontal phase shift over time to nudge the whole field —
    // keeps things from ever feeling perfectly periodic.
    const drift = time * 0.00009;

    // Measure the text-safe ellipse once per frame from the live hero-copy
    // layout. We use the element's position relative to the hero backdrop so
    // it automatically tracks responsive breakpoints.
    let textCx = 0;
    let textCy = 0;
    let textRx = 0;
    let textRy = 0;
    let hasTextSafe = false;
    if (heroCopy) {
      const backdropRect = backdrop.getBoundingClientRect();
      const copyRect = heroCopy.getBoundingClientRect();
      if (copyRect.width > 0 && copyRect.height > 0) {
        textCx = copyRect.left - backdropRect.left + copyRect.width * 0.5;
        textCy = copyRect.top - backdropRect.top + copyRect.height * 0.5;
        // Inflate slightly past the text box so dots start fading a bit outside
        // the text bounds rather than hard-cropping at them.
        textRx = copyRect.width * 0.62;
        textRy = copyRect.height * 0.62;
        hasTextSafe = true;
      }
    }

    // Precompute vertical vignette once per row (cheap + keeps edges clean).
    // We fade the top 14% and bottom 10% of the field, so the dots feel like
    // they emerge from / recede into the cream background rather than hit a
    // hard edge against the hero padding.
    // Loop is column-major inside row-major to keep memory access predictable.
    for (let gy = 0; gy < height + SPACING; gy += SPACING) {
      const v = gy / height;
      const verticalFade =
        smoothstep(0.0, 0.16, v) * smoothstep(1.0, 0.9, v);
      if (verticalFade <= 0.001) continue;

      for (let gx = -SPACING; gx < width + SPACING; gx += SPACING) {
        // Stagger odd rows by half-spacing for a hexagonal-ish feel — looks
        // more organic under traveling waves than a strict square lattice.
        const offsetX = ((gy / SPACING) & 1) ? SPACING * 0.5 : 0;
        const x = gx + offsetX;
        const y = gy;

        // Sum of traveling waves.
        let f = 0;
        for (let i = 0; i < WAVES.length; i++) {
          const wv = WAVES[i];
          f += wv.amp * Math.sin(
            wv.kx * (x + drift * 900) +
            wv.ky * y +
            wv.w * time +
            wv.phase
          );
        }

        // Map to a normalized crest intensity 0..1.
        const crest = smoothstep(CREST_LO, CREST_HI, f);

        // Alpha: subtle base + sharper peak ramp (pow 1.8) so bright dots feel
        // like they're "lighting up" rather than linearly fading in.
        let alpha = BASE_ALPHA + (PEAK_ALPHA - BASE_ALPHA) * Math.pow(crest, 1.8);
        alpha *= verticalFade;

        // Text-safe attenuation: fade dots down inside the ellipse that sits
        // over the hero headline/paragraph. Uses normalized distance so the
        // ellipse scales with the copy block on resize.
        if (hasTextSafe) {
          const ndx = (x - textCx) / textRx;
          const ndy = (y - textCy) / textRy;
          const nd = Math.sqrt(ndx * ndx + ndy * ndy);
          const tEdge = smoothstep(TEXT_SAFE_INNER, TEXT_SAFE_OUTER, nd);
          const safeMul = TEXT_SAFE_MIN_ALPHA + (1 - TEXT_SAFE_MIN_ALPHA) * tEdge;
          alpha *= safeMul;
        }

        if (alpha < 0.006) continue;

        // Radius also grows slightly on crest — subtle but makes the bright
        // bands feel like the dots physically "wake up".
        const radius =
          DOT_BASE_RADIUS + (DOT_PEAK_RADIUS - DOT_BASE_RADIUS) * crest;

        // Color: lerp between two grays across the crest — softer slate in
        // troughs, deeper slate at crests. No brand color on the dots.
        const mix = Math.pow(crest, 1.4);
        const r = Math.round(INK.r + (INK_DEEP.r - INK.r) * mix);
        const g = Math.round(INK.g + (INK_DEEP.g - INK.g) * mix);
        const b = Math.round(INK.b + (INK_DEEP.b - INK.b) * mix);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }
    }
  };

  const frame = (now) => {
    if (!running) return;
    // Throttle to ~60fps max — raf is usually 60, but on 120Hz displays this
    // is what prevents us from doing twice the work for no visible gain.
    if (!lastFrameTime) lastFrameTime = now;
    const dt = now - lastFrameTime;
    if (dt >= 1000 / 62) {
      elapsed += dt;
      lastFrameTime = now;
      drawFrame(elapsed);
    }
    rafId = window.requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    lastFrameTime = 0;
    rafId = window.requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  // Resize handling — debounced via rAF coalescing.
  let resizePending = false;
  const handleResize = () => {
    if (resizePending) return;
    resizePending = true;
    window.requestAnimationFrame(() => {
      resizePending = false;
      setSize();
      if (!running) {
        // If we're paused (reduced motion or off-screen), repaint a single
        // static frame so the grid doesn't vanish after a resize.
        drawFrame(elapsed);
      }
    });
  };

  // Off-screen gating — stop drawing when the hero isn't visible.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
        }
        if (prefersReducedMotion && prefersReducedMotion.matches) return;
        if (isVisible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(hero);
  }

  window.addEventListener("resize", handleResize, { passive: true });

  // Reduced-motion: render one static frame and never animate.
  const applyMotionPreference = () => {
    if (prefersReducedMotion && prefersReducedMotion.matches) {
      stop();
      // Use a fixed "time" so the static frame still has a pleasing field.
      drawFrame(8000);
    } else if (isVisible) {
      start();
    }
  };

  if (prefersReducedMotion) {
    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", applyMotionPreference);
    } else if (typeof prefersReducedMotion.addListener === "function") {
      // Safari < 14 fallback
      prefersReducedMotion.addListener(applyMotionPreference);
    }
  }

  // Kick things off.
  try {
    setSize();
    backdrop.classList.add("has-canvas-dots");
    canvas.classList.add("is-ready");
    applyMotionPreference();
    // Always paint an immediate frame so there's no blank gap before rAF fires.
    drawFrame(elapsed);
  } catch (err) {
    // On any failure, quietly bail out — the CSS fallback dot grid stays.
    backdrop.classList.remove("has-canvas-dots");
    canvas.remove();
  }
})();

/**
 * Hero chevron mark — stagger-reveal the three bars of the brand mark once
 * the page has painted. Using rAF-then-timeout gives the browser a clean
 * frame to lay out before the animation kicks in, so the first frame of the
 * stagger is always on-screen (no jank from mid-paint triggers).
 */
(function initHeroChevronMark() {
  const mark = document.querySelector(".hero-mark");
  if (!mark) return;

  let didReveal = false;
  const revealNow = () => {
    if (didReveal) return;
    didReveal = true;
    mark.classList.add("is-revealed");
  };

  const reveal = () => {
    const revealAfterPositionReady = () => {
      // One more rAF lets the cursor-derived transforms commit before
      // opacity starts, preventing the mark from fading in and then jumping.
      requestAnimationFrame(revealNow);
    };

    if (mark.classList.contains("is-position-ready")) {
      revealAfterPositionReady();
      return;
    }

    // Give the liquid/parallax setup enough time to prime on slower paints.
    // If it still cannot report position readiness, reveal rather than
    // leaving the mark hidden.
    const fallback = window.setTimeout(revealAfterPositionReady, 900);
    mark.addEventListener(
      "hero-chevron-position-ready",
      () => {
        window.clearTimeout(fallback);
        revealAfterPositionReady();
      },
      { once: true }
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reveal, { once: true });
  } else {
    reveal();
  }
})();

/**
 * Chevron liquid field — five brand-colored radial blobs plus one pale-mint
 * lead highlight. Every blob has:
 *   - a base position in viewBox units (bx, by)
 *   - its own ambient sine/cosine orbit (ax/ay amplitudes, fx/fy frequencies,
 *     px/py phases) so the centre traces a non-repeating path
 *   - a cursor coupling (cx, cy) in viewBox units — positive coefficients
 *     mean the blob follows the cursor, negative means it parallaxes in the
 *     opposite direction. Different magnitudes + mixed signs across blobs
 *     make the field deform as the cursor moves rather than translating
 *     rigidly.
 *
 * Cursor is read from window mousemove and normalised against the viewport
 * (range [-1, 1]) — so any mouse movement anywhere on the page shifts the
 * field, not just movement over the mark. The mouse value is itself lerped
 * so sudden jumps feel fluid.
 */
(function initHeroChevronLiquid() {
  const mark = document.querySelector(".hero-mark");
  if (!mark) return;
  const svg = mark.querySelector(".hero-chevron");
  if (!svg) return;

  if (isSafari) {
    mark.classList.add("is-position-ready");
    mark.dispatchEvent(new CustomEvent("hero-chevron-position-ready"));
    return;
  }

  // Gradient choreography. Frequencies (freqX/freqY) are relatively prime-ish
  // so the overall motion never locks into a visible cycle. cursorX/cursorY
  // are coupling coefficients in viewBox units — how far the blob shifts per
  // unit of normalised cursor travel.
  //
  // For the lead highlight (#hcg-shine) specifically, base position sits at
  // x=6 (left-of-centre on the 18.09-wide viewBox) and the x-coupling keeps
  // it biased left even when the cursor is far right. fxOffsetX/Y declare
  // the fx/fy focal-point offset from cx/cy — set only on the shine so its
  // gradient reads as "light angled from the left" while the blob radials
  // stay symmetric.
  // Cursor couplings span a wide range of magnitudes AND signs so mouse
  // motion produces visibly different trajectories per blob: some drift
  // strongly with the cursor, others parallax against it, a couple scoot
  // laterally while others respond mostly vertically. That "different
  // directions" behaviour is what keeps the field from feeling like one
  // rigid mass translating uniformly.
  // All blob base positions (bx/by) sit OUTSIDE the 0–18.09 × 0–29.727
  // visible viewBox so the bright radial CORES never enter the clipped
  // bar region — only the soft 0.4–0.7 offset band of each gradient
  // reaches the bars. This is the single biggest change that makes the
  // field read as a real flowing liquid rather than "a handful of dots
  // moving inside a mask": in real water/ink/smoke visuals you rarely
  // see the peak of a colour mass; you see its currents.
  //
  // Ambient orbit amplitudes (ax/ay) and cursor couplings are sized so
  // that the worst-case excursion (orbit + cursor both at peak) keeps
  // each core outside the viewBox by a comfortable margin — so even at
  // corner cursor positions no "eye of the radial" emerges.
  const defs = [
    // Greens — bright puddles on screen blend. Cores live just past the
    // left edge / right edge / far corners of the viewBox.
    { id: "hcg-blob-g1", bx: -4.0, by:  6.0, ax: 2.5, ay: 3.0, freqX: 0.55, freqY: 0.71, phaseX: 0.00, phaseY: 0.50, cursorX:  4.0, cursorY:  3.0 },
    { id: "hcg-blob-g2", bx: 22.0, by: 20.0, ax: 2.5, ay: 3.0, freqX: 0.77, freqY: 0.43, phaseX: 1.30, phaseY: 2.10, cursorX: -4.0, cursorY: -3.0 },
    { id: "hcg-blob-g3", bx: -4.0, by: 28.0, ax: 3.0, ay: 2.5, freqX: 0.63, freqY: 0.89, phaseX: 2.70, phaseY: 0.80, cursorX:  4.5, cursorY: -3.0 },
    { id: "hcg-blob-g4", bx: 23.0, by:  5.0, ax: 3.0, ay: 3.0, freqX: 0.37, freqY: 0.67, phaseX: 4.50, phaseY: 2.70, cursorX: -4.0, cursorY:  3.5 },
    // Navys — shadow puddles on multiply blend. Cores above, left-middle, below-right.
    { id: "hcg-blob-n1", bx:  9.0, by: -4.0, ax: 3.0, ay: 2.5, freqX: 0.91, freqY: 0.51, phaseX: 0.70, phaseY: 3.30, cursorX: -3.5, cursorY:  3.5 },
    { id: "hcg-blob-n2", bx: -4.0, by: 16.0, ax: 3.0, ay: 3.0, freqX: 0.46, freqY: 0.83, phaseX: 3.80, phaseY: 1.40, cursorX:  4.0, cursorY: -3.0 },
    { id: "hcg-blob-n3", bx: 22.0, by: 26.0, ax: 3.0, ay: 3.0, freqX: 0.81, freqY: 0.41, phaseX: 1.90, phaseY: 4.10, cursorX: -4.0, cursorY: -3.5 },
    // Lead highlight — core parked just off the left edge so only a soft
    // mint luminous sweep enters the mark; fxOffset keeps the focal
    // point pinned relative to that moving centre so the angled-light
    // character rides along with it.
    { id: "hcg-shine",   bx:  3.0, by: 18.0, ax: 2.5, ay: 4.0, freqX: 0.50, freqY: 0.36, phaseX: 0.20, phaseY: 1.90, cursorX:  4.0, cursorY:  5.0, fxOffsetX: -4.0, fxOffsetY: -3.0 },
  ];

  const nodes = [];
  for (const d of defs) {
    const el = svg.querySelector("#" + d.id);
    if (el) nodes.push({ ...d, el, x: d.bx, y: d.by });
  }
  if (!nodes.length) return;

  // Reduced motion — park everything at base positions and bail out.
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    for (const n of nodes) {
      n.el.setAttribute("cx", n.bx.toFixed(3));
      n.el.setAttribute("cy", n.by.toFixed(3));
    }
    mark.classList.add("is-position-ready");
    mark.dispatchEvent(new CustomEvent("hero-chevron-position-ready"));
    return;
  }

  // Viewport-normalised cursor, clamped to [-1, 1]; 0 = centre = neutral.
  // Starting at (0, 0) means the initial render matches a "cursor at
  // viewport centre" pose until the first mousemove.
  let targetMX = 0, targetMY = 0;
  let curMX = 0, curMY = 0;

  const onMove = (event) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    targetMX = Math.max(-1, Math.min(1, (event.clientX / w) * 2 - 1));
    targetMY = Math.max(-1, Math.min(1, (event.clientY / h) * 2 - 1));
  };
  window.addEventListener("mousemove", onMove, { passive: true });

  const LERP = 0.045;    // position ease per frame
  const M_LERP = 0.035;  // cursor ease — slower than position so the field
                         // trails the cursor slightly (feels responsive but
                         // not jittery).

  // Per-bar parallax — each of the three chevrons drifts with its own
  // coupling to the cursor, so they don't translate as one rigid block.
  // Units are viewBox units (the SVG is 18.09 × 29.727) — at max cursor
  // deflection a bar shifts up to ~0.25 vb-units, which at the rendered
  // size (~390px wide) lands around 5–6px of travel. Subtle but clearly
  // visible when the cursor swings across the viewport.
  // Each parallax entry owns both the bar's visible fill wrapper
  // (.hcg-parallax[data-parallax=N]) AND the matching polygon inside the
  // clipPath ([data-parallax-clip=N]). We transform BOTH together so the
  // clip that bounds the blob/shine/grain field tracks the bar instead of
  // leaving behind a static silhouette — otherwise a parallaxed bar exposes
  // a "ghost edge" where the clip used to be. Couplings are in viewBox
  // units per unit of normalised cursor travel; kept deliberately subtle
  // (~0.18 vb ≈ 4px at render size) so the parallax reads as "alive" rather
  // than "sliding around".
  const parallaxDefs = [
    { barSel: ".hcg-parallax[data-parallax='1']", clipSel: "polygon[data-parallax-clip='1']", cursorX:  0.20, cursorY:  0.14 },
    { barSel: ".hcg-parallax[data-parallax='2']", clipSel: "polygon[data-parallax-clip='2']", cursorX: -0.16, cursorY:  0.23 },
    { barSel: ".hcg-parallax[data-parallax='3']", clipSel: "polygon[data-parallax-clip='3']", cursorX:  0.25, cursorY: -0.18 },
  ];
  const parallaxNodes = [];
  for (const pd of parallaxDefs) {
    const barEl = svg.querySelector(pd.barSel);
    const clipEl = svg.querySelector(pd.clipSel);
    // Each chevron also has a matching WebGL slot (div that wraps the
    // masked canvas) that needs to receive the SAME parallax translation
    // via a CSS transform so the liquid gradient drifts per-chevron just
    // like the original SVG bars did. We translate in CSS pixels
    // (viewBox units × vbToPx) so the motion amplitude reads the same as
    // the old SVG parallax regardless of the mark's current rendered
    // width. Transform goes on the slot (not the canvas) so it moves the
    // shadow filter AND the masked canvas together as one unit.
    const chevIdx = pd.barSel.match(/\d/)[0];
    const glSlotEl = mark.querySelector(`.hcg-chev-slot[data-gl-chev='${chevIdx}']`);
    if (barEl) parallaxNodes.push({ ...pd, barEl, clipEl, glSlotEl, x: 0, y: 0 });
  }

  // Cached viewBox-unit → CSS-pixel conversion. Re-measured on resize so
  // the canvas transforms track the mark's rendered width (clamped in
  // CSS between 260px and 390px).
  let vbToPx = 0;
  const measureVbToPx = () => {
    const rect = mark.getBoundingClientRect();
    vbToPx = rect.width / 18.09;
  };
  measureVbToPx();
  window.addEventListener("resize", measureVbToPx, { passive: true });

  let didPrimePosition = false;
  const signalPositionReady = () => {
    if (didPrimePosition) return;
    didPrimePosition = true;
    mark.classList.add("is-position-ready");
    mark.dispatchEvent(new CustomEvent("hero-chevron-position-ready"));
  };

  const tick = (now) => {
    const isFirstFrame = !didPrimePosition;

    if (isFirstFrame) {
      curMX = targetMX;
      curMY = targetMY;
    } else {
      curMX += (targetMX - curMX) * M_LERP;
      curMY += (targetMY - curMY) * M_LERP;
    }

    // Per-chevron parallax — the same eased cursor signal feeds both the
    // SVG bar transforms (used when WebGL is unavailable / the fallback is
    // visible) and the three WebGL canvases (one per chevron, each masked
    // to a single polygon). Because each canvas already owns its own mask
    // region, translating it in CSS just shifts that window around —
    // neighbour chevrons don't follow.
    const glActive = mark.classList.contains("has-gl-liquid");
    for (const p of parallaxNodes) {
      // Target deflection in viewBox units. When GL is ACTIVE the SVG
      // bars are hidden (via CSS), so we zero their transform; the
      // canvases handle the visible motion. When GL is INACTIVE we drive
      // the SVG bars + clipPath polygons (the legacy fallback).
      const txVb = p.cursorX * curMX;
      const tyVb = p.cursorY * curMY;
      const tx = glActive ? 0 : txVb;
      const ty = glActive ? 0 : tyVb;
      if (isFirstFrame) {
        p.x = tx;
        p.y = ty;
      } else {
        p.x += (tx - p.x) * LERP;
        p.y += (ty - p.y) * LERP;
      }
      const transform = `translate(${p.x.toFixed(3)} ${p.y.toFixed(3)})`;
      p.barEl.setAttribute("transform", transform);
      if (p.clipEl) p.clipEl.setAttribute("transform", transform);

      // Drive the matching GL slot via CSS transform regardless of
      // glActive — slots are only visible when GL is active anyway, and
      // the style update is cheap. The slot wraps the masked canvas AND
      // carries the drop-shadow filter, so moving it translates both the
      // liquid fill and its shadow in lockstep.
      if (p.glSlotEl && vbToPx > 0) {
        const cx = (glActive ? txVb : 0) * vbToPx;
        const cy = (glActive ? tyVb : 0) * vbToPx;
        // Separate lerp state for the slot so its easing isn't
        // coupled to the SVG-only path above.
        if (isFirstFrame) {
          p.slotX = cx;
          p.slotY = cy;
        } else {
          p.slotX = (p.slotX || 0) + (cx - (p.slotX || 0)) * LERP;
          p.slotY = (p.slotY || 0) + (cy - (p.slotY || 0)) * LERP;
        }
        p.glSlotEl.style.transform = `translate3d(${p.slotX.toFixed(2)}px, ${p.slotY.toFixed(2)}px, 0)`;
      }
    }

    // Time scale: 0.00014 means a full 2π takes ~45s at f=1.0; with per-blob
    // frequencies of 0.4–0.9, the ambient orbits take ~50–110s to complete.
    const t = now * 0.00014;

    for (const n of nodes) {
      // Mixing sin for x and cos for y produces circular-ish orbits rather
      // than diagonal line segments.
      const orbitX = n.ax * Math.sin(t * n.freqX + n.phaseX);
      const orbitY = n.ay * Math.cos(t * n.freqY + n.phaseY);
      const tx = n.bx + orbitX + n.cursorX * curMX;
      const ty = n.by + orbitY + n.cursorY * curMY;
      if (isFirstFrame) {
        n.x = tx;
        n.y = ty;
      } else {
        n.x += (tx - n.x) * LERP;
        n.y += (ty - n.y) * LERP;
      }
      const cxStr = n.x.toFixed(3);
      const cyStr = n.y.toFixed(3);
      n.el.setAttribute("cx", cxStr);
      n.el.setAttribute("cy", cyStr);
      // For gradients with an explicit focal-point offset (the shine), keep
      // fx/fy offset from cx/cy every frame so the angled character rides
      // along with the moving highlight rather than distorting as cx moves
      // away from a fixed fx.
      if (n.fxOffsetX !== undefined) {
        n.el.setAttribute("fx", (n.x + n.fxOffsetX).toFixed(3));
        n.el.setAttribute("fy", (n.y + n.fxOffsetY).toFixed(3));
      }
    }

    signalPositionReady();
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
})();

/**
 * initHeroLiquidGL
 * ---------------------------------------------------------------------------
 * WebGL fragment shader that produces a wavy liquid colour gradient inside
 * the three chevron bars. Replaces the SVG blob field when WebGL is
 * available; if init fails (no WebGL, shader compile error, lost context),
 * the canvas is removed and the SVG fallback (.hcg-legacy-liquid) stays
 * visible.
 *
 * Shader technique: **domain-warped fBm** — the standard pattern for
 * "mesh gradient" animations on the web (used by Stripe's header, Jordan
 * Giberson's whatamesh, countless Shadertoy flow shaders). Two passes of
 * fractional-Brownian-motion noise are used as offsets to warp the
 * coordinates fed into a third pass — which produces slow, organic,
 * continent-like colour masses that drift over time. Cursor position is
 * added into the warp offset so the field deforms as the user moves the
 * mouse, not just translates.
 *
 * Palette: four brand stops (deep navy → navy → brand green → mint) mixed
 * via smoothstep ramps. Canvas is opaque and stacked above the SVG bars;
 * a CSS mask-image clips it to the chevron polygons.
 *
 * All dependencies are hand-rolled (no three.js, no gl-matrix, no
 * external noise library) so the footprint is ~4KB of JS + shader text.
 */
(function initHeroLiquidGL() {
  const mark = document.querySelector(".hero-mark");
  if (!mark) return;
  const canvases = Array.from(mark.querySelectorAll(".hcg-liquid-gl"));
  if (!canvases.length) return;

  if (isSafari) {
    canvases.forEach((canvas) => canvas.remove());
    return;
  }

  // Respect reduced-motion: still render a single static frame so the mark
  // has its colour story, but skip the rAF loop.
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Try WebGL1 first (broadest support); fall back to experimental-webgl on
  // older browsers that need the prefix. If it fails on ANY canvas we bail
  // out of the whole GL path — partial WebGL (2 chevrons of 3) would look
  // broken. The SVG legacy liquid remains visible in that case.
  const glOpts = { premultipliedAlpha: true, antialias: true, alpha: true };
  const getGL = (cv) =>
    cv.getContext("webgl", glOpts) || cv.getContext("experimental-webgl", glOpts);
  const gls = canvases.map(getGL);
  if (gls.some((g) => !g)) {
    canvases.forEach((c) => c.remove());
    return;
  }

  // --- Shaders ---------------------------------------------------------
  const vertSrc = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  // Fragment shader — domain-warped fBm pattern. Decisions:
  //
  //   * 2 octaves of fBm (vs. 4 in the original). Visually identical
  //     at this motion speed because the noise only drives a binary-
  //     ish navy/green mix; high-frequency detail is never resolved
  //     by the colour ramp.
  //   * Two domain-warp passes — the second pass feeds the first back
  //     in with different phases and a partially negated time term so
  //     the field genuinely swirls instead of just translating. With
  //     the speed bumped to t*0.038 the swirl is visible without feeling busy.
  //   * Per-chevron parallax is applied as a CSS transform on the
  //     slot wrapping the canvas, so the shader itself doesn't need a
  //     u_mouse uniform — the field translates in lockstep with the
  //     drop-shadow filter living on the same parent.
  //   * No per-pixel grain (moved to a CSS overlay, see style.css).
  //   * mediump precision retained — lowp distorts the simplex noise
  //     distribution enough to skew the navy/green ratio noticeably.
  //
  // Cost: 10 noise samples/pixel (5 fbm calls × 2 octaves), still
  // comfortably below the original 20-sample budget.
  const fragSrc = `
    precision mediump float;
    uniform float u_time;
    uniform vec2  u_resolution;  // canvas size in physical pixels

    // -- Simplex noise 2D (Ashima Arts, public-domain) -------------------
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                             + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                              dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // -- fBm (2 octaves) — fewer samples, same visual outcome -----------
    float fbm(vec2 p) {
      return 0.5 * snoise(p) + 0.25 * snoise(p * 2.0);
    }

    void main() {
      // Aspect-correct UVs so the noise pattern is isotropic across the
      // tall chevron rectangle (not stretched).
      vec2 uv = gl_FragCoord.xy / u_resolution;
      uv.x *= u_resolution.x / u_resolution.y;

      vec2  p = uv * 0.44;        // 20% tighter feature scale for denser detail
      float t = u_time * 0.038;   // slightly quicker idle colour movement

      // Two-pass domain warp. q deforms the input into organic blobs;
      // r feeds q back into another fbm sample with different phases /
      // time signs so the field swirls like a slow viscous liquid
      // instead of just translating. Cost: 5 fbm calls × 2 octaves =
      // 10 noise samples/pixel (vs. 6 with a single warp), still
      // comfortably under the original 20-sample budget.
      vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + t * 0.80),
        fbm(p + vec2(5.2, 1.3) + t * 0.70)
      );
      vec2 r = vec2(
        fbm(p + 0.55 * q + vec2(1.7, 9.2) - t * 0.55),
        fbm(p + 0.55 * q + vec2(8.3, 2.8) + t * 0.45)
      );
      float n = fbm(p + 0.55 * r);
      n = smoothstep(-0.9, 0.9, n);

      // Two-colour brand mix. Smoothstep range tuned empirically to
      // keep the navy/green ratio at ~75%/25%.
      vec3 col = mix(
        vec3(0.102, 0.169, 0.227),   // #1A2B3A — brand navy
        vec3(0.000, 0.576, 0.322),   // #009352 — brand green
        smoothstep(0.68, 0.95, n)
      );
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // --- Per-context compile / link / bind -------------------------------
  // Each canvas gets its own WebGL context, program, VBO, and uniform
  // locations (WebGL handles are bound to the context that created them,
  // so nothing can be shared cross-context). We compile the same shader
  // text three times; the overhead is negligible (~ms at page load) and
  // it keeps the code straightforward — no FBO/ImageBitmap plumbing.
  const compileIn = (g, type, source) => {
    const sh = g.createShader(type);
    g.shaderSource(sh, source);
    g.compileShader(sh);
    if (!g.getShaderParameter(sh, g.COMPILE_STATUS)) {
      console.error("[hero-liquid-gl] shader compile failed:", g.getShaderInfoLog(sh));
      g.deleteShader(sh);
      return null;
    }
    return sh;
  };

  const units = [];  // { canvas, gl, program, uTime, uMouse, uRes }

  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const gl = gls[i];

    const vs = compileIn(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compileIn(gl, gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) {
      canvases.forEach((c) => c.remove());
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[hero-liquid-gl] program link failed:", gl.getProgramInfoLog(program));
      canvases.forEach((c) => c.remove());
      return;
    }
    gl.useProgram(program);

    // Full-screen quad — two triangles covering clip-space [-1, 1].
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    units.push({
      canvas,
      gl,
      program,
      uTime: gl.getUniformLocation(program, "u_time"),
      uRes: gl.getUniformLocation(program, "u_resolution"),
    });

    // Per-canvas context-loss recovery — if any one drops we fall back
    // so the mark isn't partially-rendered.
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      mark.classList.remove("has-gl-liquid");
    }, false);
  }

  // --- Resize handling -------------------------------------------------
  // Render at REDUCED resolution and let the browser bilinear-upscale
  // the canvas via CSS. The chevron is small (~400px wide) and the
  // colour story is two flat brand stops, so 0.6× internal resolution
  // is visually indistinguishable from native — but cuts fragment
  // shader work to ~36% of "1× CSS pixel size" and ~9% of "2× DPR".
  // The blurred bilinear filter actually helps the liquid feel — a
  // sharp shader render reads as "noise pattern", whereas a softened
  // one reads as a continuous gradient.
  const RENDER_SCALE = 0.6;
  const resize = () => {
    for (const u of units) {
      const rect = u.canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * RENDER_SCALE));
      const h = Math.max(1, Math.floor(rect.height * RENDER_SCALE));
      if (u.canvas.width !== w || u.canvas.height !== h) {
        u.canvas.width = w;
        u.canvas.height = h;
        u.gl.viewport(0, 0, w, h);
        u.gl.useProgram(u.program);
        u.gl.uniform2f(u.uRes, w, h);
      }
    }
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Signal to CSS that WebGL is active — hides .hcg-legacy-liquid AND
  // the SVG bar fills (.hcg-bars), leaves the canvases as the only
  // visible chevron fill. Also turns on the static SVG film-grain
  // overlay (which was previously baked into the shader).
  mark.classList.add("has-gl-liquid");

  // --- Render loop state -----------------------------------------------
  // Cap to ~30 fps — the field motion is still slow enough that
  // 30fps and 60fps look identical, but 30fps halves the GPU work. We
  // keep rAF (not setInterval) so the loop stays on the browser's
  // vsync-aligned beat and gets auto-throttled when the tab loses focus.
  const FRAME_MS = 1000 / 30;
  const start = performance.now();
  let lastDrawn = 0;
  let rafId = 0;

  const renderOnce = (t) => {
    for (const u of units) {
      u.gl.useProgram(u.program);
      u.gl.uniform1f(u.uTime, t);
      u.gl.drawArrays(u.gl.TRIANGLES, 0, 6);
    }
  };

  // --- Visibility gating -----------------------------------------------
  // 1) IntersectionObserver: pause rAF when the hero scrolls off-screen.
  //    Once the user scrolls past the fold the GPU sits idle until they
  //    come back — saves the bulk of rendering cost on long scroll
  //    sessions.
  // 2) document.visibilityState: pause when the tab is backgrounded.
  //    Browsers throttle rAF when hidden anyway, but stopping the loop
  //    ourselves is cleaner and avoids any catch-up frames on resume.
  let onScreen = true;
  let tabVisible = document.visibilityState !== "hidden";
  const isRunning = () => onScreen && tabVisible && !prefersReduced;
  const ensureLoop = () => {
    if (isRunning() && rafId === 0) rafId = requestAnimationFrame(draw);
  };

  const draw = (now) => {
    rafId = 0;
    if (!isRunning()) return;
    if (now - lastDrawn >= FRAME_MS) {
      renderOnce((now - start) / 1000);
      lastDrawn = now;
    }
    rafId = requestAnimationFrame(draw);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      ensureLoop();
    }, { threshold: 0 });
    io.observe(mark);
  }
  document.addEventListener("visibilitychange", () => {
    tabVisible = document.visibilityState !== "hidden";
    ensureLoop();
  });

  // Kick off. For reduced-motion we draw one frame only (time=0) so the
  // mark still shows the colour story without any animation.
  if (prefersReduced) {
    renderOnce(0);
  } else {
    rafId = requestAnimationFrame(draw);
  }
})();
