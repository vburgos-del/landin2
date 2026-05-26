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
    ".value-grid, .countdown-grid, .route-grid, .prize-boards, .winners-grid, .winners-carousel__track, .faq-accordion"
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

  const countdownRoot = document.querySelector(".countdown-grid");
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

  const carousel = document.querySelector(".winners-carousel");
  if (carousel) {
    const viewport = carousel.querySelector(".winners-carousel__viewport");
    const track = carousel.querySelector(".winners-carousel__track");
    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");
    const slides = track ? [...track.children] : [];
    let currentIndex = 0;
    let autoTimer = null;

    const getStep = () => {
      if (!slides.length || !viewport) return 0;
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
        behavior: "smooth",
      });
    };

    const next = () => scrollToIndex(currentIndex + 1);
    const prev = () => scrollToIndex(currentIndex - 1);

    prevBtn?.addEventListener("click", prev);
    nextBtn?.addEventListener("click", next);

    const startAuto = () => {
      if (autoTimer || slides.length < 2) return;
      autoTimer = window.setInterval(next, 4500);
    };
    const stopAuto = () => {
      if (!autoTimer) return;
      window.clearInterval(autoTimer);
      autoTimer = null;
    };

    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);
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

})();
