/**
 * A/B test — Hero Pitch UChile
 * Variante A: enfoque transformación (control)
 * Variante B: enfoque experiencia / escenario (challenger)
 */
(function () {
  const EXPERIMENT = "hero_pitch_2025";
  const STORAGE_KEY = "pitch_ab_hero_variant";

  const variants = {
    a: {
      eyebrow: "Programa de emprendimiento con impacto",
      title: "Convierte tu idea en un proyecto con impacto real",
      subtitle:
        "Participa en Pitch UChile y accede a formación práctica, mentorías, redes y visibilidad para llevar tu emprendimiento al siguiente nivel.",
      ctaPrimary: "Postula aquí",
      ctaSecondary: "Conoce cómo funciona",
    },
    b: {
      eyebrow: "De la idea al escenario",
      title: "Transforma tu idea en una oportunidad real",
      subtitle:
        "Aprende, conecta y presenta tu proyecto ante expertos. Más que un concurso: bootcamp, mentorías y DemoDay.",
      ctaPrimary: "Quiero postular",
      ctaSecondary: "Ver el proceso",
    },
  };

  function assignVariant() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "a" || stored === "b") return stored;
    const v = Math.random() < 0.5 ? "a" : "b";
    localStorage.setItem(STORAGE_KEY, v);
    return v;
  }

  function applyVariant(key) {
    const copy = variants[key];
    if (!copy) return;

    document.body.dataset.heroVariant = key;

    const eyebrow = document.querySelector("[data-ab-eyebrow]");
    const title = document.querySelector("[data-ab-title]");
    const subtitle = document.querySelector("[data-ab-subtitle]");
    const ctaPrimary = document.querySelector("[data-ab-cta-primary]");
    const ctaSecondary = document.querySelector("[data-ab-cta-secondary]");

    if (eyebrow) eyebrow.textContent = copy.eyebrow;
    if (title) title.textContent = copy.title;
    if (subtitle) subtitle.textContent = copy.subtitle;
    if (ctaPrimary) ctaPrimary.textContent = copy.ctaPrimary;
    if (ctaSecondary) ctaSecondary.textContent = copy.ctaSecondary;

    if (window.PitchAnalytics) {
      window.PitchAnalytics.trackExperiment(EXPERIMENT, key);
    }
  }

  function init() {
    applyVariant(assignVariant());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
