/**
 * Configuración de analítica Pitch UChile.
 * Reemplaza los placeholders antes de publicar en producción.
 */
window.PITCH_ANALYTICS_CONFIG = {
  /** ID de medición GA4 (ej: G-XXXXXXXXXX). Dejar vacío para solo dataLayer/GTM. */
  ga4MeasurementId: "",
  /** ID contenedor GTM (ej: GTM-XXXXXXX). Dejar vacío si solo usas gtag directo. */
  gtmContainerId: "",
  /** Nombre del evento personalizado en GA4 (recomendado mantener prefijo pitch_) */
  eventPrefix: "pitch",
  /** Activar logs en consola (desarrollo) */
  debug: true,
};
