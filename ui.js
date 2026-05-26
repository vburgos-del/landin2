/** Animaciones, navegación y micro-interacciones (estilo editorial, sin tema oscuro) */
(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.appendChild(progressBar);

  const nav = document.querySelector(".top-nav");
  const heroVideo = document.querySelector(".hero-video");

  const updateScrollUi = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
    progressBar.style.width = `${progress * 100}%`;
    nav?.classList.toggle("nav-scrolled", scrollTop > 72);

    if (!prefersReducedMotion && heroVideo) {
      heroVideo.style.transform = `translate3d(0, ${scrollTop * 0.12}px, 0) scale(1.04)`;
    }
  };

  window.addEventListener("scroll", updateScrollUi, { passive: true });
  updateScrollUi();

  const reveals = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => revealObserver.observe(el));

  const staggerParents = document.querySelectorAll(
    ".value-grid, .route-grid, .prize-showcase, .faq-accordion, .impact-stats"
  );
  staggerParents.forEach((grid) => {
    [...grid.children].forEach((child, index) => {
      child.classList.add("stagger-item");
      child.style.setProperty("--stagger-delay", `${index * 0.07}s`);
    });
  });

  const formatStat = (value, isMoney) => {
    if (isMoney) {
      return `$${Math.round(value).toLocaleString("es-CL")}`;
    }
    return `+${Math.round(value)}`;
  };

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.target);
        if (!Number.isFinite(target)) return;

        const isMoney = el.classList.contains("money");
        if (prefersReducedMotion) {
          el.textContent = formatStat(target, isMoney);
          statObserver.unobserve(el);
          return;
        }

        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = formatStat(target * eased, isMoney);
          if (t < 1) requestAnimationFrame(tick);
          else statObserver.unobserve(el);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll(".number[data-target]").forEach((el) => statObserver.observe(el));

  const countdownRoot = document.querySelector(".hero-countdown[data-final-date]");
  if (countdownRoot) {
    const deadlineRaw = countdownRoot.getAttribute("data-final-date");
    const deadline = deadlineRaw ? new Date(deadlineRaw).getTime() : NaN;
    const countdownEls = {
      days: countdownRoot.querySelector("[data-countdown='days']"),
      hours: countdownRoot.querySelector("[data-countdown='hours']"),
      minutes: countdownRoot.querySelector("[data-countdown='minutes']"),
      seconds: countdownRoot.querySelector("[data-countdown='seconds']"),
    };

    const paintCountdown = () => {
      if (!Number.isFinite(deadline)) return;
      const now = Date.now();
      const diff = Math.max(0, deadline - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (countdownEls.days) countdownEls.days.textContent = String(days);
      if (countdownEls.hours) countdownEls.hours.textContent = String(hours).padStart(2, "0");
      if (countdownEls.minutes) countdownEls.minutes.textContent = String(minutes).padStart(2, "0");
      if (countdownEls.seconds) countdownEls.seconds.textContent = String(seconds).padStart(2, "0");

      countdownRoot.classList.toggle("is-finished", diff === 0);
    };

    paintCountdown();
    window.setInterval(paintCountdown, 1000);
  }

  const carousel = document.querySelector(".winners-carousel--spotlight");
  if (carousel) {
    const viewport = carousel.querySelector(".winners-carousel__viewport");
    const track = carousel.querySelector(".winners-carousel__track");
    const dotsRoot = carousel.querySelector("[data-carousel-dots]");
    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");
    const slides = track ? [...track.children] : [];
    let currentIndex = 0;
    let autoTimer = null;

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "winners-carousel__dot";
      dot.setAttribute("aria-label", `Ir al ganador ${index + 1}`);
      dot.addEventListener("click", () => scrollToIndex(index));
      dotsRoot?.appendChild(dot);
      return dot;
    });

    const updateDots = () => {
      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === currentIndex);
      });
    };

    const getStep = () => {
      if (!slides.length || !viewport || !track) return 0;
      const slideWidth = slides[0].getBoundingClientRect().width;
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
      return slideWidth + gap;
    };

    const scrollToIndex = (index) => {
      if (!viewport || !slides.length) return;
      currentIndex = (index + slides.length) % slides.length;
      viewport.scrollTo({
        left: getStep() * currentIndex,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      updateDots();
    };

    const next = () => scrollToIndex(currentIndex + 1);
    const prev = () => scrollToIndex(currentIndex - 1);

    prevBtn?.addEventListener("click", prev);
    nextBtn?.addEventListener("click", next);

    viewport?.addEventListener(
      "scroll",
      () => {
        const step = getStep();
        if (!step) return;
        const index = Math.round(viewport.scrollLeft / step);
        if (index !== currentIndex) {
          currentIndex = index;
          updateDots();
        }
      },
      { passive: true }
    );

    const startAuto = () => {
      if (autoTimer || slides.length < 2 || prefersReducedMotion) return;
      autoTimer = window.setInterval(next, 5000);
    };
    const stopAuto = () => {
      if (!autoTimer) return;
      window.clearInterval(autoTimer);
      autoTimer = null;
    };

    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);
    carousel.addEventListener("focusin", stopAuto);
    carousel.addEventListener("focusout", startAuto);
    updateDots();
    startAuto();
  }

  const navLinks = document.querySelectorAll(".top-nav a[href^='#']");
  const sections = [...navLinks]
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = sections.find((s) => s.section === entry.target);
          if (!match) return;
          navLinks.forEach((l) => l.classList.remove("is-active"));
          match.link.classList.add("is-active");
        });
      },
      { threshold: 0.35, rootMargin: "-20% 0px -55% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s.section));
  }

  const stickyCta = document.querySelector(".sticky-cta");
  const postula = document.getElementById("postula");
  if (stickyCta && postula) {
    const ctaObserver = new IntersectionObserver(
      ([entry]) => {
        stickyCta.style.opacity = entry.isIntersecting ? "0" : "1";
        stickyCta.style.pointerEvents = entry.isIntersecting ? "none" : "auto";
      },
      { threshold: 0.15 }
    );
    ctaObserver.observe(postula);
  }

  const faqItems = document.querySelectorAll(".faq-item");
  const setFaqOpen = (item, open) => {
    const button = item.querySelector(".faq-item__button");
    const content = item.querySelector(".faq-item__content");
    if (!button || !content) return;

    button.setAttribute("aria-expanded", open ? "true" : "false");
    content.classList.toggle("is-open", open);
    item.classList.toggle("is-active", open);
  };

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-item__button");
    if (!button) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-active");

      faqItems.forEach((other) => setFaqOpen(other, false));

      if (!isOpen) {
        setFaqOpen(item, true);
        const faqId = item.dataset.trackFaq;
        if (faqId && window.PitchAnalytics?.trackFAQ) {
          window.PitchAnalytics.trackFAQ(faqId);
        }
      }
    });
  });

  // Premios interactivos — barras: retracción + expansión; textos sincronizados
  const BAR_SWITCH_MS = 400;
  const premiosSwitch = document.querySelector("[data-premios-podio]");
  const premiosSection = premiosSwitch?.closest("#premios-detalle");
  const premiosPanel = document.getElementById("premios-console-panel");
  const prefersReducedMotionPremios =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (premiosSwitch && premiosSection && premiosPanel) {
    const tabs = [...premiosSwitch.querySelectorAll("[data-premios-category]")];

    const amtFirst = document.getElementById("premios-amt-first");
    const amtSecond = document.getElementById("premios-amt-second");
    const amtThird = document.getElementById("premios-amt-third");
    const amtFourth = document.getElementById("premios-amt-fourth");
    const amtMention = document.getElementById("premios-amt-mention");
    const reqMaturity = document.getElementById("premios-req-maturity");
    const reqCap = document.getElementById("premios-req-cap");
    const reqFormat = document.getElementById("premios-req-format");

    const cardFourth = document.getElementById("premios-card-fourth");

    const fills = {
      first: premiosSwitch.querySelector(".premios-console__fill--first"),
      second: premiosSwitch.querySelector(".premios-console__fill--second"),
      third: premiosSwitch.querySelector(".premios-console__fill--third"),
      fourth: premiosSwitch.querySelector(".premios-console__fill--fourth"),
      mention: premiosSwitch.querySelector(".premios-console__fill--mention"),
    };

    const widthsByCategory = {
      idea: { first: "100%", second: "76%", third: "56%", fourth: "44%", mention: "100%" },
      prototipo: {
        first: "100%",
        second: "76%",
        third: "56%",
        fourth: "0%",
        mention: "100%",
      },
    };

    const dataPremios = {
      idea: {
        first: "$800.000",
        second: "$600.000",
        third: "$400.000",
        fourth: "$250.000",
        mention: "$150.000",
        maturity: "Idea en etapa inicial",
        cap: "$800.000 CLP",
        format: "Pitch en vivo + DemoDay",
      },
      prototipo: {
        first: "$2.000.000",
        second: "$1.500.000",
        third: "$1.000.000",
        fourth: null,
        mention: "$500.000",
        maturity: "Prototipo funcional o validacion tecnica",
        cap: "$2.000.000 CLP",
        format: "Pitch en vivo + DemoDay",
      },
    };

    const setActiveTab = (category) => {
      tabs.forEach((t) => {
        const isActive = t.dataset.premiosCategory === category;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      premiosSection.setAttribute("data-premios-current", category);
    };

    const setFillWidth = (key, value) => {
      const el = fills[key];
      if (el) el.style.width = value;
    };

    const retractAllBars = () => {
      ["first", "second", "third", "fourth", "mention"].forEach((k) => setFillWidth(k, "0%"));
    };

    const expandBars = (category) => {
      const widths = widthsByCategory[category];
      if (!widths) return;
      setFillWidth("first", widths.first);
      setFillWidth("second", widths.second);
      setFillWidth("third", widths.third);
      setFillWidth("fourth", widths.fourth);
      setFillWidth("mention", widths.mention);
    };

    let premiosSwitchTimerId;

    const applyCategoryPayload = (category) => {
      const data = dataPremios[category];
      if (!data) return;

      if (amtFirst) amtFirst.textContent = data.first;
      if (amtSecond) amtSecond.textContent = data.second;
      if (amtThird) amtThird.textContent = data.third;
      if (amtMention) amtMention.textContent = data.mention;
      if (amtFourth) amtFourth.textContent = data.fourth ?? "";
      if (reqMaturity) reqMaturity.textContent = data.maturity;
      if (reqCap) reqCap.textContent = data.cap;
      if (reqFormat) reqFormat.textContent = data.format;

      if (cardFourth) {
        if (data.fourth) {
          cardFourth.classList.remove("premios-console__row--collapsed");
          cardFourth.removeAttribute("aria-hidden");
        } else {
          cardFourth.classList.add("premios-console__row--collapsed");
          cardFourth.setAttribute("aria-hidden", "true");
        }
      }

      expandBars(category);
    };

    const setPremiosCategory = (category, { animateBars = false } = {}) => {
      const payload = dataPremios[category];
      if (!payload) return;

      if (premiosSwitchTimerId != null) {
        window.clearTimeout(premiosSwitchTimerId);
        premiosSwitchTimerId = undefined;
      }

      const run = () => {
        applyCategoryPayload(category);
        premiosPanel.classList.remove("is-premios-data-fading");
      };

      if (!animateBars || prefersReducedMotionPremios) {
        run();
        return;
      }

      premiosPanel.classList.add("is-premios-data-fading");
      retractAllBars();
      void premiosSwitch.offsetHeight;

      premiosSwitchTimerId = window.setTimeout(() => {
        premiosSwitchTimerId = undefined;
        run();
        void premiosSwitch.offsetHeight;
      }, BAR_SWITCH_MS);
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const category = tab.dataset.premiosCategory;
        const current = premiosSection.getAttribute("data-premios-current");
        if (!category || category === current) return;
        setActiveTab(category);
        setPremiosCategory(category, { animateBars: true });
      });
    });

    const active = tabs.find((t) => t.classList.contains("is-active")) || tabs[0];
    const initialCategory = active?.dataset.premiosCategory || "idea";
    setActiveTab(initialCategory);
    setPremiosCategory(initialCategory, { animateBars: false });
  }

})();
