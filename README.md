# Pitch UChile 5.0 — Landing

Réplica y evolución de [pitch2025 | Pregrado FEN](https://pregrado.fen.uchile.cl/pitch2025/) orientada a conversión.

## Cómo ver la página

Abre `index.html` en el navegador o sirve la carpeta con un servidor local:

```bash
npx serve .
```

## Git y deploy (Cloudflare Pages)

1. Crea un repositorio vacío en GitHub (sin README).
2. En esta carpeta:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

3. En [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (recomendado) o **Direct Upload**.
4. Si conectas Git: rama `main`, **Build command** vacío, **Build output directory** `/` (raíz).
5. Antes de producción: edita `analytics.config.js` (`ga4MeasurementId`, `debug: false`) y configura el envío real del formulario.

## Archivos

| Archivo | Rol |
|---------|-----|
| `index.html` | Landing con funnel de conversión |
| `styles.css` | Estilos FEN (azul #003087, morado #420277) |
| `analytics.config.js` | IDs de GA4/GTM (editar antes de producción) |
| `analytics.js` | Eventos `pitch_*` → dataLayer + gtag |
| `ab-test.js` | A/B del hero (variantes A y B) |
| `ui.js` | Animaciones reveal y nav activa |

## Activar GA4 / GTM

Edita `analytics.config.js`:

```js
window.PITCH_ANALYTICS_CONFIG = {
  ga4MeasurementId: "G-XXXXXXXXXX",
  gtmContainerId: "GTM-XXXXXXX",
  eventPrefix: "pitch",
  debug: false,
};
```

### Eventos enviados

| Evento | Cuándo |
|--------|--------|
| `pitch_page_ready` | Página lista (incluye `hero_variant`) |
| `pitch_cta_click` | Clic en cualquier CTA |
| `pitch_section_view` | Sección visible (timeline, testimonios, video, stats) |
| `pitch_faq_open` | Apertura de FAQ |
| `pitch_form_start` | Primer foco en formulario |
| `pitch_form_submit` | Envío del formulario |
| `pitch_experiment` | Asignación A/B del hero |

Inspección en consola: `window.__pitchAnalytics`

## A/B test del hero

- **Variante A (control):** “Convierte tu idea en un proyecto con impacto real”
- **Variante B:** “Transforma tu idea en una oportunidad real”

La variante se guarda en `localStorage` (`pitch_ab_hero_variant`). Para reiniciar el test en tu navegador:

```js
localStorage.removeItem("pitch_ab_hero_variant");
location.reload();
```

## CTAs

- Hero (primario + secundario)
- Banda intermedia
- Sticky flotante
- CTA final → formulario
