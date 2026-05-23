/**
 * Pitch UChile — capa de analítica compatible con GA4 y GTM.
 * Eventos estándar: pitch_cta_click, pitch_section_view, pitch_form_*, pitch_faq_open, pitch_experiment_*
 */
(function () {
  const config = window.PITCH_ANALYTICS_CONFIG || {};
  const PREFIX = config.eventPrefix || "pitch";
  const DEBUG = config.debug !== false;

  window.dataLayer = window.dataLayer || [];
  const eventLog = [];
  window.__pitchAnalytics = eventLog;

  function loadGtag() {
    const id = config.ga4MeasurementId;
    if (!id || window.gtag) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: true });
  }

  function loadGtm() {
    const id = config.gtmContainerId;
    if (!id || document.querySelector(`script[data-gtm="${id}"]`)) return;

    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    script.setAttribute("data-gtm", id);
    document.head.appendChild(script);

    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
  }

  /**
   * @param {string} action - nombre corto del evento (sin prefijo)
   * @param {Record<string, unknown>} params
   */
  function track(action, params = {}) {
    const eventName = `${PREFIX}_${action}`;
    const payload = {
      event: eventName,
      page_path: window.location.pathname,
      page_title: document.title,
      timestamp: new Date().toISOString(),
      ...params,
    };

    eventLog.push(payload);
    window.dataLayer.push(payload);

    if (typeof window.gtag === "function" && config.ga4MeasurementId) {
      window.gtag("event", action, {
        send_to: config.ga4MeasurementId,
        event_category: "pitch_landing",
        ...params,
      });
    }

    if (DEBUG) {
      console.info("[PitchAnalytics]", eventName, params);
    }
  }

  window.PitchAnalytics = { track, trackCTA, trackSection, trackFAQ, trackForm, trackExperiment };

  function trackCTA(el) {
    track("cta_click", {
      cta_id: el.dataset.trackClick || "unknown",
      cta_location: el.dataset.trackLocation || "unknown",
      cta_text: (el.textContent || "").trim().slice(0, 80),
      hero_variant: document.body.dataset.heroVariant || "default",
    });
  }

  function trackSection(sectionId) {
    track("section_view", {
      section_id: sectionId,
      hero_variant: document.body.dataset.heroVariant || "default",
    });
  }

  function trackFAQ(faqId) {
    track("faq_open", { faq_id: faqId });
  }

  function trackForm(stage, formId) {
    track(stage === "start" ? "form_start" : "form_submit", {
      form_id: formId,
      hero_variant: document.body.dataset.heroVariant || "default",
    });
  }

  function trackExperiment(name, variant) {
    track("experiment", { experiment_name: name, variant });
    document.body.dataset.heroVariant = variant;
  }

  loadGtag();
  loadGtm();

  document.querySelectorAll("[data-track-click]").forEach((el) => {
    el.addEventListener("click", () => trackCTA(el));
  });

  const viewed = new Set();
  const viewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.dataset.trackView;
        if (!id || viewed.has(id)) return;
        viewed.add(id);
        trackSection(id);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll("[data-track-view]").forEach((s) => viewObserver.observe(s));

  document.querySelectorAll("[data-track-faq]").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) trackFAQ(item.dataset.trackFaq);
    });
  });

  const form = document.querySelector("[data-track-form]");
  if (form) {
    let started = false;
    form.addEventListener("focusin", () => {
      if (started) return;
      started = true;
      trackForm("start", form.dataset.trackForm);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      trackForm("submit", form.dataset.trackForm);
      const msg = form.querySelector(".form-success");
      if (msg) msg.hidden = false;
    });
  }

  const counters = document.querySelectorAll(".number[data-target]");
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.target);
        let value = 0;
        const step = Math.max(1, Math.floor(target / 60));
        const timer = setInterval(() => {
          value += step;
          if (value >= target) {
            value = target;
            clearInterval(timer);
          }
          el.textContent = `+${value.toLocaleString("es-CL")}`;
        }, 20);
        obs.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  function onReady() {
    setTimeout(() => {
      track("page_ready", {
        hero_variant: document.body.dataset.heroVariant || "pending",
      });
    }, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
