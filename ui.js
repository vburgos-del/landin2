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
    ".value-grid, .route-grid, .prize-boards, .alliance-grid, .gallery-grid, .testimonial-grid, .stats-grid"
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
})();
