// Mantiene la pantalla encendida mientras hay una sesión de Gym abierta (Screen Wake Lock API).
// El sistema suelta el bloqueo al ocultar la app; se vuelve a pedir al regresar. Si el navegador no lo
// soporta (o el modo ahorro lo impide), no pasa nada: la sesión funciona igual.
let lock = null, want = false;
async function acquire() {
  if (!want || lock || typeof navigator === "undefined" || !("wakeLock" in navigator) || document.visibilityState !== "visible") return !!lock;
  try { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); }
  catch { lock = null; }
  return !!lock;
}
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => { if (want) acquire(); });
export async function keepAwake(on) {
  want = !!on;
  if (want) return acquire();
  if (lock) { try { await lock.release(); } catch {} lock = null; }
  return false;
}
export const isAwake = () => !!lock;
