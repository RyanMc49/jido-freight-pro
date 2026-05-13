import { useState, useEffect, useMemo, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fuel, MapPin, Navigation, Loader2, TrendingDown, Zap, Crosshair } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import MapboxMap, { MapboxMarker } from "@/components/MapboxMap";
import { useGeolocation } from "@/hooks/useGeolocation";

// ── Chain definitions ───────────────────────────────────────────────────────
const CHAINS = [
  { id: "pilot", name: "Pilot Flying J", shortName: "Pilot", keywords: ["pilot", "flying j", "flyingj"], bg: "bg-[#003087]", logo: <div className="w-full h-full flex flex-col items-center justify-center bg-[#003087] rounded-xl p-2"><div className="text-white font-black text-xl">PILOT</div></div> },
  { id: "petro", name: "Petro / TCA", shortName: "Petro", keywords: ["petro", "ta travel", "travel centers", "tca"], bg: "bg-[#c8102e]", logo: <div className="w-full h-full flex flex-col items-center justify-center bg-[#c8102e] rounded-xl p-2"><div className="text-white font-black text-xl">PETRO</div></div> },
  { id: "loves", name: "Love's", shortName: "Love's", keywords: ["love's", "loves", "love travel"], bg: "bg-[#e31837]", logo: <div className="w-full h-full flex flex-col items-center justify-center bg-[#e31837] rounded-xl p-2"><div className="text-white font-black text-2xl">♥</div></div> },
  { id: "ta", name: "TA", shortName: "TA", keywords: ["ta "], bg: "bg-[#005b96]", logo: <div className="w-full h-full flex flex-col items-center justify-center bg-[#005b96] rounded-xl p-2"><div className="text-white font-black text-xl">TA</div></div> },
];

function detectChain(name: string) { const lower = name.toLowerCase(); return CHAINS.find(c => c.keywords.some(k => lower.includes(k))) ?? null; }

interface FuelStop {
  name: string; brand: string; dieselPrice: number | null; defPrice: number | null;
  address: string; lat: number; lng: number; distFromRoute?: number;
}

export default function FuelFinder() {
  const [, navigate] = useLocation();
  const { geo, coords: currentLocation, retry: retryLocation } = useGeolocation(true);
  const [query, setQuery] = useState("");
  const [prices, setPrices] = useState<FuelStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [mpg, setMpg] = useState("");
  const [activeChain, setActiveChain] = useState<string | null>(null);

  // Auto-fill GPS coordinates
  useEffect(() => {
    if (geo.status === "success" && currentLocation && !query) {
      setQuery(`${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`);
    }
  }, [geo.status, currentLocation, query]);

  const doSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setPrices([]);
    try {
      // Geocode the query
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      const geoData = await geoRes.json();
      if (!geoData[0]) { toast.error("Location not found"); setLoading(false); return; }
      const { lat, lng, label } = geoData[0];
      setLocationName(label || searchQuery);

      // Fetch live prices
      const priceRes = await fetch(`/api/live-prices?lat=${lat}&lng=${lng}&radius=50`);
      const priceData = await priceRes.json();
      const stops: FuelStop[] = (priceData.prices || []).map((p: any) => ({
        name: p.name || "Unknown",
        brand: p.brand || "",
        dieselPrice: p.dieselPrice ?? null,
        defPrice: null,
        address: p.address || "",
        lat: p.lat || 0,
        lng: p.lng || 0,
      }));
      setPrices(stops);
    } catch (e: any) {
      toast.error("Failed to load fuel prices");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  const handleSearch = () => doSearch(query);
  const useCurrentLocation = () => {
    if (geo.status === "success" && currentLocation) {
      const coordStr = `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
      setQuery(coordStr);
      doSearch(coordStr);
    } else {
      retryLocation();
    }
  };

  // GPS is requested only when user taps the crosshair button

  // Sort by cheapest
  const sorted = useMemo(() => [...prices].sort((a, b) => (a.dieselPrice ?? 999) - (b.dieselPrice ?? 999)), [prices]);
  const cheapest = sorted[0] ?? null;
  const mostExpensive = sorted[sorted.length - 1] ?? null;

  // Savings
  const savings = mpg && cheapest && mostExpensive
    ? ((((mostExpensive.dieselPrice ?? 0) - (cheapest.dieselPrice ?? 0)) * 500) / Number(mpg)).toFixed(2)
    : null;

  // Chain summaries
  const chainSummaries = useMemo(() => CHAINS.map(chain => {
    const matches = sorted.filter(s => detectChain(s.name)?.id === chain.id);
    return { chain, cheapest: matches[0] ?? null, count: matches.length };
  }), [sorted]);

  // Filtered by chain
  const displayPrices = useMemo(() => {
    if (!activeChain) return sorted;
    const chain = CHAINS.find(c => c.id === activeChain);
    return chain ? sorted.filter(s => detectChain(s.name)?.id === chain.id) : sorted;
  }, [sorted, activeChain]);

  // Map markers
  const mapMarkers = useMemo<MapboxMarker[]>(() => {
    const m: MapboxMarker[] = [];
    if (currentLocation) m.push({ id: "me", lat: currentLocation.lat, lng: currentLocation.lng, icon: "truck", popup: "You" });
    displayPrices.forEach((s, i) => {
      if (s.lat && s.lng) m.push({ id: `f-${i}`, lat: s.lat, lng: s.lng, icon: "fuel", color: i === 0 ? "#22c55e" : undefined, popup: `<b>${s.name}</b><br>$${s.dieselPrice?.toFixed(2)}/gal` });
    });
    return m;
  }, [currentLocation, displayPrices]);

  const mapCenter = useMemo<[number, number]>(() => currentLocation ? [currentLocation.lng, currentLocation.lat] : [-98.5795, 39.8283], [currentLocation]);

  return (
    <AppLayout>
      <DashboardHeader title="Fuel Finder" showNotifications={false} />
      <div className="p-4 space-y-4 pb-24">
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
            <Input type="text" placeholder="City, ZIP, or address..." value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()} className="pl-9 h-10" />
          </div>
          <Button size="sm" variant="outline" onClick={useCurrentLocation} disabled={geo.status === "loading"} className="h-10 flex-shrink-0" title="Use GPS">
            <Crosshair size={14} className={geo.status === "success" ? "text-accent" : ""} />
          </Button>
          <Button onClick={handleSearch} disabled={loading} className="bg-accent text-white h-10 flex-shrink-0 font-semibold">
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Location badge */}
        {locationName && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10}/> {locationName} • {prices.length} stations found</p>}

        {/* Map */}
        <div className="w-full h-40 rounded-xl overflow-hidden border border-border"><MapboxMap center={mapCenter} zoom={currentLocation ? 10 : 4} markers={mapMarkers} className="w-full h-full" /></div>

        {/* Chain cards */}
        {prices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Zap size={14} className="text-accent" />Closest & Cheapest by Chain</h3>
              {activeChain && <button onClick={() => setActiveChain(null)} className="text-xs text-accent underline">Show All</button>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {chainSummaries.map(({ chain, cheapest: c, count }) => (
                <button key={chain.id} onClick={() => setActiveChain(activeChain === chain.id ? null : chain.id)}
                  className={`rounded-xl border-2 transition-all overflow-hidden ${activeChain === chain.id ? "border-accent shadow-lg" : "border-border hover:border-accent/50"}`}>
                  <div className="w-full aspect-square">{chain.logo}</div>
                  <div className="p-2 bg-card">
                    <div className="text-[10px] font-semibold text-muted-foreground truncate">{chain.shortName}</div>
                    {c ? <><div className="text-base font-black text-accent">${c.dieselPrice?.toFixed(2)}</div><div className="text-[9px] text-muted-foreground">{count} stop{count !== 1 ? "s" : ""}</div></>
                      : <div className="text-[10px] text-muted-foreground mt-0.5">{searched ? "None nearby" : "Search to find"}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Savings */}
        {cheapest && mpg && (
          <Card className="p-3 bg-accent/5 border-accent/20">
            <div className="flex items-center gap-2"><TrendingDown size={14} className="text-accent" /><h3 className="text-sm font-semibold">Savings</h3></div>
            {savings && <p className="text-xs text-muted-foreground mt-1">Save <span className="font-bold text-accent">${savings}</span> per 500 miles by choosing <span className="font-semibold">{cheapest.name}</span></p>}
          </Card>
        )}

        {/* Loading */}
        {loading && <div className="text-center py-16"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-accent/40" /><p className="text-sm text-muted-foreground">Searching fuel prices...</p></div>}

        {/* Idle */}
        {!loading && !searched && (
          <div className="text-center py-16">
            <Fuel size={48} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">{geo.status === "success" ? "Searching nearby..." : "Enter a city or tap the crosshair for nearby diesel prices"}</p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && prices.length === 0 && (
          <div className="text-center py-16"><Fuel size={32} className="mx-auto mb-2 opacity-20" /><p className="text-sm text-muted-foreground">No stations found. Try expanding your search.</p></div>
        )}

        {/* Price list */}
        {!loading && displayPrices.map((s, i) => {
          const chain = detectChain(s.name);
          return (
            <Card key={i} className={`p-3 ${i === 0 ? "border-green-500/50 bg-green-500/5" : ""}`}>
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">{chain ? chain.logo : <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg"><Fuel size={16} className="text-muted-foreground" /></div>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin size={10}/>{s.address}</p>
                    </div>
                    <div className="text-right flex-shrink-0"><p className="text-xl font-black text-accent">${s.dieselPrice?.toFixed(2)}</p><p className="text-[10px] text-muted-foreground">diesel/gal</p></div>
                  </div>
                  <Button size="sm" className="mt-2 bg-accent text-white h-7 text-xs" onClick={() => navigate(`/navigation?dest=${encodeURIComponent(s.address || s.name)}`)}><Navigation size={12} className="mr-1"/>Route Here</Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
