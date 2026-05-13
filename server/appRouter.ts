import { router } from "./_core/trpc";
import { mapboxRouter } from "./mapboxRouter";
import { liveFuelRouter, fuelParkingRouter, alertsReviewsRouter, truckProfileRouter, routeRouter, businessMaintenanceRouter } from "./stubRouters";

export const appRouter = router({
  mapbox: mapboxRouter,
  liveFuel: liveFuelRouter,
  fuelParking: fuelParkingRouter,
  alertsReviews: alertsReviewsRouter,
  truckProfile: truckProfileRouter,
  route: routeRouter,
  businessMaintenance: businessMaintenanceRouter,
});

export type AppRouter = typeof appRouter;
