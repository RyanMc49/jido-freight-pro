/**
 * JIDO FREIGHT PRO — Production Server
 * Serves built frontend + tRPC API from a single port.
 * Run: node prod-server.mjs
 */
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./server/appRouter.ts";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Serve built frontend
app.use(express.static("dist"));

// tRPC API
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({ user: null }),
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "JIDO FREIGHT PRO", version: "2.0.0", uptime: process.uptime() });
});

// SPA fallback — all non-API/trpc routes serve index.html
app.use((_req, res, next) => {
  if (_req.path.startsWith("/trpc") || _req.path.startsWith("/api")) return next();
  res.sendFile("dist/index.html", { root: "." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚛 JIDO FREIGHT PRO running on port ${PORT}`);
  console.log(`📍 http://0.0.0.0:${PORT}`);
});
