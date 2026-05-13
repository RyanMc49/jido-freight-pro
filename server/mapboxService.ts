/**
 * Mapbox Directions & Geocoding Service
 * Uses Mapbox APIs server-side for route calculation and geocoding.
 */
import { ENV } from "./_core/env";

// Token is resolved lazily so it picks up the value after env injection
function getToken(): string {
  return ENV.mapboxToken || process.env.VITE_MAPBOX_TOKEN || "";
}

export interface MapboxRouteResult {
  distance: number; // miles
  duration: string; // human-readable e.g. "3h 45m"
  durationSeconds: number;
  coordinates: [number, number][]; // [lng, lat] pairs for drawing the route
  legs: Array<{
    steps: Array<{
      instruction: string;
      distance: number; // miles
      duration: number; // seconds
      maneuver: string;
    }>;
  }>;
  warnings: string[];
}

export interface MapboxGeocodeResult {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

/**
 * Get driving directions between two points using Mapbox Directions API.
 * Supports truck-friendly routing via the driving profile.
 */
export async function getMapboxDirections(
  originLng: number,
  originLat: number,
  destLng: number,
  destLat: number
): Promise<MapboxRouteResult | null> {
  const MAPBOX_TOKEN = getToken();
  if (!MAPBOX_TOKEN) {
    console.warn("[Mapbox] VITE_MAPBOX_TOKEN not set");
    return null;
  }

  try {
    const coords = `${originLng},${originLat};${destLng},${destLat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.error("[Mapbox] No routes found:", data.message);
      return null;
    }

    const route = data.routes[0];
    const distanceMiles = route.distance * 0.000621371; // meters to miles
    const durationSec = route.duration;
    const hours = Math.floor(durationSec / 3600);
    const minutes = Math.floor((durationSec % 3600) / 60);
    const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Extract GeoJSON coordinates [lng, lat]
    const coordinates: [number, number][] = route.geometry.coordinates;

    // Extract turn-by-turn steps
    const legs = route.legs.map((leg: any) => ({
      steps: leg.steps.map((step: any) => ({
        instruction: step.maneuver.instruction,
        distance: step.distance * 0.000621371,
        duration: step.duration,
        maneuver: step.maneuver.type,
      })),
    }));

    return {
      distance: distanceMiles,
      duration: durationStr,
      durationSeconds: durationSec,
      coordinates,
      legs,
      warnings: [],
    };
  } catch (error) {
    console.error("[Mapbox] Directions error:", error);
    return null;
  }
}

/**
 * Geocode an address string to coordinates using Mapbox Geocoding API.
 */
export async function geocodeWithMapbox(address: string): Promise<MapboxGeocodeResult | null> {
  const MAPBOX_TOKEN = getToken();
  if (!MAPBOX_TOKEN) {
    console.warn("[Mapbox] VITE_MAPBOX_TOKEN not set");
    return null;
  }

  try {
    const encoded = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const [lng, lat] = feature.center;

    return {
      address: feature.place_name,
      latitude: lat,
      longitude: lng,
      placeId: feature.id,
    };
  } catch (error) {
    console.error("[Mapbox] Geocoding error:", error);
    return null;
  }
}
