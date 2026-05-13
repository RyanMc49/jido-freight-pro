import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getTruckProfilesByUserId, getActiveTruckProfile, getDb } from "./db";
import { users, truckProfiles } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { routeRouter } from "./routeRouter";
import { fuelParkingRouter } from "./fuelParkingRouter";
import { alertsReviewsRouter } from "./alertsReviewsRouter";
import { businessMaintenanceRouter } from "./businessMaintenanceRouter";
import { aiAssistantRouter } from "./aiAssistantRouter";
import { subscriptionNotificationsRouter } from "./subscriptionNotificationsRouter";
import { liveFuelRouter } from "./liveFuelRouter";
import { googleMapsRouter } from "./googleMapsRouter";
import { tomtomRouter } from "./tomtomRouter";
import { profileRouter } from "./routers/profile";
import { receiptsRouter } from "./routers/receipts";
import { mapboxRouter } from "./mapboxRouter";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User profile router
  user: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        profilePictureUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, unknown> = {};
        if (input.name) updateData.name = input.name;
        if (input.profilePictureUrl) updateData.profilePictureUrl = input.profilePictureUrl;
        
        if (Object.keys(updateData).length === 0) {
          return ctx.user;
        }
        
        await db.update(users)
          .set(updateData as any)
          .where(eq(users.id, ctx.user.id));
        
        return { ...ctx.user, ...updateData };
      }),
  }),

  // Route planning router
  route: routeRouter,

  // Fuel and parking finder router
  fuelParking: fuelParkingRouter,

  // Live fuel prices router (Apify GasBuddy)
  liveFuel: liveFuelRouter,
  maps: googleMapsRouter,
  tomtom: tomtomRouter,
  mapbox: mapboxRouter,
  profile: profileRouter,
  receipts: receiptsRouter,

  // Alerts and reviews router
  alertsReviews: alertsReviewsRouter,

  // Business and maintenance router
  businessMaintenance: businessMaintenanceRouter,

  // AI assistant router
  ai: aiAssistantRouter,

  // Subscription and notifications router
  subscriptionNotifications: subscriptionNotificationsRouter,

  // Trust score router
  trust: router({
    getScore: protectedProcedure.query(async ({ ctx }) => {
      const { getTrustScoreBreakdown } = await import("./trustScore");
      return getTrustScoreBreakdown(ctx.user.id);
    }),
  }),

  // Truck profile router
  truckProfile: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTruckProfilesByUserId(ctx.user.id);
    }),
    active: protectedProcedure.query(async ({ ctx }) => {
      return getActiveTruckProfile(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        vehicleHeight: z.string(),
        totalWeight: z.number(),
        numberOfAxles: z.number(),
        trailerType: z.enum(["dry_van", "flatbed", "tanker", "reefer", "oversized"]),
        carryHazmat: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(truckProfiles).values({
          userId: ctx.user.id,
          name: input.name,
          vehicleHeight: input.vehicleHeight,
          totalWeight: input.totalWeight,
          numberOfAxles: input.numberOfAxles,
          trailerType: input.trailerType,
          carryHazmat: input.carryHazmat,
        });
        
        return { 
          id: result[0].insertId, 
          userId: ctx.user.id, 
          name: input.name,
          vehicleHeight: input.vehicleHeight,
          totalWeight: input.totalWeight,
          numberOfAxles: input.numberOfAxles,
          trailerType: input.trailerType,
          carryHazmat: input.carryHazmat,
          isActive: true, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        vehicleHeight: z.string().optional(),
        totalWeight: z.number().optional(),
        numberOfAxles: z.number().optional(),
        trailerType: z.enum(["dry_van", "flatbed", "tanker", "reefer", "oversized"]).optional(),
        carryHazmat: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...updateData } = input;
        const filteredUpdate: Record<string, unknown> = {};
        
        if (updateData.name !== undefined) filteredUpdate.name = updateData.name;
        if (updateData.vehicleHeight !== undefined) filteredUpdate.vehicleHeight = updateData.vehicleHeight;
        if (updateData.totalWeight !== undefined) filteredUpdate.totalWeight = updateData.totalWeight;
        if (updateData.numberOfAxles !== undefined) filteredUpdate.numberOfAxles = updateData.numberOfAxles;
        if (updateData.trailerType !== undefined) filteredUpdate.trailerType = updateData.trailerType;
        if (updateData.carryHazmat !== undefined) filteredUpdate.carryHazmat = updateData.carryHazmat;
        
        if (Object.keys(filteredUpdate).length === 0) {
          return { id, userId: ctx.user.id, ...updateData };
        }
        
        await db.update(truckProfiles)
          .set(filteredUpdate as any)
          .where(and(eq(truckProfiles.id, id), eq(truckProfiles.userId, ctx.user.id)));
        
        return { id, userId: ctx.user.id, ...updateData };
      }),
    setActive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Deactivate all other profiles
        await db.update(truckProfiles)
          .set({ isActive: false } as any)
          .where(eq(truckProfiles.userId, ctx.user.id));
        
        // Activate the selected profile
        await db.update(truckProfiles)
          .set({ isActive: true } as any)
          .where(and(eq(truckProfiles.id, input.id), eq(truckProfiles.userId, ctx.user.id)));
        
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(truckProfiles)
          .where(and(eq(truckProfiles.id, input.id), eq(truckProfiles.userId, ctx.user.id)));
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
