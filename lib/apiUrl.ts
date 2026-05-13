/**
 * API URL resolver — works across all deployment targets:
 * - Dev (Vite):       /trpc → proxied to localhost:3002
 * - Vercel (web):     /trpc → proxied to backend via vercel.json
 * - Capacitor (APK):  Absolute URL to live backend
 */

// @ts-ignore — Capacitor is available at runtime in the APK
const isCapacitor = typeof (window as any)?.Capacitor !== "undefined";

function getBaseUrl(): string {
  if (isCapacitor) {
    // APK — use live backend URL
    return "https://api.jidofreight.com";
  }
  // Web/dev — relative URL works everywhere
  return "";
}

export const API_BASE = getBaseUrl();
