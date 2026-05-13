import { useState, useEffect, useCallback } from "react";

export type GeoState =
  | { status: "idle" }
  | { status: "loading"; startedAt: number }
  | { status: "success"; lat: number; lng: number }
  | { status: "denied" }
  | { status: "unavailable" }
  | { status: "timeout" };

/**
 * Shared geolocation hook.
 * - Does NOT throw error toasts — callers decide how to present the state.
 * - Returns `retry` so the user can try again after granting permission.
 */
export function useGeolocation(autoRequest = true) {
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setGeo({ status: "unavailable" });
      return;
    }
    setGeo({ status: "loading", startedAt: Date.now() });
    
    // Fallback timeout: if browser silently blocks GPS, show timeout after 8s
    const fallbackTimer = setTimeout(() => {
      setGeo(current => {
        if (current.status === "loading") return { status: "timeout" };
        return current;
      });
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallbackTimer);
        setGeo({
          status: "success",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        clearTimeout(fallbackTimer);
        if (err.code === err.PERMISSION_DENIED) {
          setGeo({ status: "denied" });
        } else if (err.code === err.TIMEOUT) {
          setGeo({ status: "timeout" });
        } else {
          setGeo({ status: "unavailable" });
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (autoRequest) request();
  }, [autoRequest, request]);

  const coords =
    geo.status === "success" ? { lat: geo.lat, lng: geo.lng } : null;

  return { geo, coords, retry: request };
}
