import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";

// Stub routers for all Manus frontend tRPC calls
// Returns mock data so pages render without crashing

export const liveFuelRouter = router({
  fetchPrices: publicProcedure
    .input(z.object({ location: z.string(), radiusMiles: z.number() }))
    .mutation(async () => ({
      prices: [
        { stationName: "Pilot Flying J #412", address: "1200 Trucker Blvd, Dallas, TX", dieselPrice: 3.89, defPrice: 2.15, latitude: 32.7767, longitude: -96.7970, lastUpdated: new Date().toISOString(), chain: "pilot" },
        { stationName: "Love's Travel Stop #287", address: "850 I-35, Dallas, TX", dieselPrice: 3.94, defPrice: 2.25, latitude: 32.7800, longitude: -96.7900, lastUpdated: new Date().toISOString(), chain: "loves" },
        { stationName: "Petro Stopping Center #76", address: "2100 Commerce St, Dallas, TX", dieselPrice: 3.82, defPrice: 2.10, latitude: 32.7700, longitude: -96.8000, lastUpdated: new Date().toISOString(), chain: "petro" },
        { stationName: "TA Travel Center #103", address: "500 Great Trinity Forest, Dallas, TX", dieselPrice: 3.99, defPrice: 2.30, latitude: 32.7600, longitude: -96.7850, lastUpdated: new Date().toISOString(), chain: "ta" },
      ],
      cached: false,
    })),
  getCached: publicProcedure
    .input(z.object({ location: z.string(), radiusMiles: z.number() }))
    .query(async () => ({ prices: [] })),
});

export const fuelParkingRouter = router({
  parking: router({
    nearby: publicProcedure
      .input(z.object({ latitude: z.number(), longitude: z.number(), radiusMiles: z.number() }))
      .query(async () => [
        { id: 1, name: "Pilot Flying J #412", latitude: 32.78, longitude: -96.79, availableSpaces: 12, totalSpaces: 40, starRating: 4.2, price: 0, locationType: "truck_stop", amenities: ["showers","food"], distance: 2.1 },
        { id: 2, name: "Rest Area I-35 MM 158", latitude: 32.79, longitude: -96.81, availableSpaces: 8, totalSpaces: 25, starRating: 3.0, price: 0, locationType: "rest_area", amenities: ["restrooms"], distance: 4.5 },
      ]),
    getParkingLogs: publicProcedure.query(async () => []),
    logParking: publicProcedure.input(z.object({ parkingLocationId: z.number(), locationName: z.string(), latitude: z.number(), longitude: z.number() })).mutation(async () => ({ id: 1 })),
    checkOutParking: publicProcedure.input(z.object({ logId: z.number() })).mutation(async () => ({})),
  }),
});

export const alertsReviewsRouter = router({
  alerts: router({
    getAll: publicProcedure.query(async () => [
      { id: 1, title: "Construction on I-5 North", description: "Right lane closed for 3 miles", alertType: "construction", severity: "medium", latitude: 34.05, longitude: -118.24, upvotes: 12, downvotes: 1, verified: true },
      { id: 2, title: "High Winds Advisory", description: "Gusts up to 55mph", alertType: "weather", severity: "high", latitude: 35.20, longitude: -111.65, upvotes: 8, downvotes: 0, verified: true },
    ]),
    nearby: publicProcedure.input(z.object({ latitude: z.number(), longitude: z.number(), radiusMiles: z.number() })).query(async () => []),
    report: publicProcedure.input(z.object({ alertType: z.string(), title: z.string(), description: z.string(), latitude: z.number(), longitude: z.number(), severity: z.string(), expiresIn: z.number() })).mutation(async () => ({ id: 1 })),
    upvote: publicProcedure.input(z.object({ alertId: z.number() })).mutation(async () => ({})),
    downvote: publicProcedure.input(z.object({ alertId: z.number() })).mutation(async () => ({})),
  }),
});

export const truckProfileRouter = router({
  getProfile: publicProcedure.query(async () => ({ height: 13.5, weight: 80000, axles: 5, trailerType: "dry_van", hazmat: false })),
});

export const routeRouter = router({
  planRoute: publicProcedure.input(z.object({ origin: z.string(), destination: z.string(), truckHeight: z.number().optional(), truckWeight: z.number().optional(), hazmat: z.boolean().optional() })).query(async () => ({ distance: 1438, duration: "24 hrs", coordinates: [], fuelCost: 450, tolls: 35 })),
});

export const businessMaintenanceRouter = router({
  maintenance: router({
    getAll: publicProcedure.query(async () => []),
    create: publicProcedure.input(z.object({ item: z.string(), mileage: z.number(), cost: z.number(), date: z.string() })).mutation(async () => ({ id: 1 })),
  }),
  expenses: router({
    getAll: publicProcedure.query(async () => []),
    create: publicProcedure.input(z.object({ category: z.string(), amount: z.number(), date: z.string() })).mutation(async () => ({ id: 1 })),
  }),
  trips: router({
    getAll: publicProcedure.query(async () => []),
  }),
});
