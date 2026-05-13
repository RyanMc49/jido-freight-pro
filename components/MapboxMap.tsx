import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set the Mapbox access token
mapboxgl.accessToken = (import.meta as any).env?.VITE_MAPBOX_TOKEN || "";

export interface MapboxMarker {
  id: string;
  lat: number;
  lng: number;
  color?: string;
  popup?: string;
  icon?: "fuel" | "parking" | "alert" | "truck" | "default";
}

export interface MapboxRoute {
  coordinates: [number, number][];
  color?: string;
}

interface MapboxMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MapboxMarker[];
  route?: MapboxRoute;
  style?: string;
  className?: string;
  onMapReady?: (map: mapboxgl.Map) => void;
  onMarkerClick?: (markerId: string) => void;
  interactive?: boolean;
  showTraffic?: boolean;
}

const ICON_COLORS: Record<string, string> = {
  fuel: "#f97316",   // orange
  parking: "#3b82f6", // blue
  alert: "#ef4444",  // red
  truck: "#22c55e",  // green
  default: "#6366f1", // indigo
};

export default function MapboxMap({
  center = [-98.5795, 39.8283], // Center of USA
  zoom = 4,
  markers = [],
  route,
  style = "mapbox://styles/mapbox/dark-v11",
  className = "w-full h-full",
  onMapReady,
  onMarkerClick,
  interactive = true,
  showTraffic = false,
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style,
      center,
      zoom,
      interactive,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    if (interactive) {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "top-right"
      );
    }

    map.on("load", () => {
      if (showTraffic) {
        map.addLayer({
          id: "traffic",
          type: "line",
          source: {
            type: "vector",
            url: "mapbox://mapbox.mapbox-traffic-v1",
          },
          "source-layer": "traffic",
          paint: {
            "line-width": 2,
            "line-color": [
              "match",
              ["get", "congestion"],
              "low", "#22c55e",
              "moderate", "#f59e0b",
              "heavy", "#ef4444",
              "severe", "#7f1d1d",
              "#aaaaaa",
            ],
          },
        });
      }
      onMapReady?.(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center/zoom when props change
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center, zoom, duration: 1200 });
  }, [center[0], center[1], zoom]);

  // Manage markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove old markers not in new list
    const newIds = new Set(markers.map((m) => m.id));
    markersRef.current.forEach((marker, id) => {
      if (!newIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        popupsRef.current.get(id)?.remove();
        popupsRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach((m) => {
      const color = m.color ?? ICON_COLORS[m.icon ?? "default"] ?? ICON_COLORS.default;

      if (markersRef.current.has(m.id)) {
        // Update position
        markersRef.current.get(m.id)!.setLngLat([m.lng, m.lat]);
      } else {
        // Create marker element
        const el = document.createElement("div");
        el.className = "mapbox-custom-marker";
        el.style.cssText = `
          width: 28px;
          height: 28px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          border: 2px solid white;
          transform: rotate(-45deg);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        `;

        const popup = m.popup
          ? new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(`<div style="color:#111;font-size:13px;padding:4px 6px;">${m.popup}</div>`)
          : undefined;

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([m.lng, m.lat]);

        if (popup) {
          marker.setPopup(popup);
          popupsRef.current.set(m.id, popup);
        }

        if (onMarkerClick) {
          el.addEventListener("click", () => onMarkerClick(m.id));
        }

        marker.addTo(map);
        markersRef.current.set(m.id, marker);
      }
    });
  }, [markers, onMarkerClick]);

  // Draw or update route
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const addRoute = () => {
      // Remove existing route layer/source
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getLayer("route-casing")) map.removeLayer("route-casing");
      if (map.getSource("route")) map.removeSource("route");

      if (!route || route.coordinates.length < 2) return;

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route.coordinates,
          },
        },
      });

      // Casing (outline)
      map.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#000",
          "line-width": 8,
          "line-opacity": 0.4,
        },
      });

      // Main route line
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": route.color ?? "#f97316",
          "line-width": 5,
        },
      });

      // Fit map to route bounds
      const bounds = route.coordinates.reduce(
        (b, coord) => b.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(route.coordinates[0], route.coordinates[0])
      );
      map.fitBounds(bounds, { padding: 60, duration: 1000 });
    };

    if (map.isStyleLoaded()) {
      addRoute();
    } else {
      map.once("load", addRoute);
    }
  }, [route]);

  // No token? Show placeholder
  if (!mapboxgl.accessToken || mapboxgl.accessToken.length < 10) {
    return (
      <div className={`${className} bg-muted rounded-xl border border-border flex items-center justify-center`} style={{ minHeight: "200px" }}>
        <div className="text-center px-4">
          <div className="text-3xl mb-2">🗺️</div>
          <p className="text-sm text-muted-foreground">
            {markers.length > 0 ? `${markers.length} stops nearby` : "Map ready"}
          </p>
          <p className="text-xs text-muted-foreground/50 mt-1">Add Mapbox token for interactive map</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className={className}
      style={{ minHeight: "300px" }}
    />
  );
}
