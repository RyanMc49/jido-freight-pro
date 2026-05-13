import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getMapboxDirections, geocodeWithMapbox } from "./mapboxService";

export const mapboxRouter = router({
  /**
   * Get driving directions between two coordinate pairs.
   * Returns route geometry (coordinates array) for drawing on Mapbox map,
   * plus turn-by-turn steps.
   */
  getDirections: publicProcedure
    .input(
      z.object({
        originLng: z.number(),
        originLat: z.number(),
        destLng: z.number(),
        destLat: z.number(),
      })
    )
    .query(async ({ input }) => {
      const result = await getMapboxDirections(
        input.originLng,
        input.originLat,
        input.destLng,
        input.destLat
      );
      return result;
    }),

  /**
   * Geocode an address string to lat/lng coordinates.
   */
  geocode: publicProcedure
    .input(z.object({ address: z.string().min(1) }))
    .query(async ({ input }) => {
      const result = await geocodeWithMapbox(input.address);
      return result;
    }),
});
