import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./appRouter";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "JIDO FREIGHT PRO", version: "2.0.0" });
});

app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext: () => ({ user: null }) }));

app.listen(PORT, () => {
  console.log(`\n🚛 JIDO FREIGHT PRO API on port ${PORT}`);
  console.log(`🔗 tRPC: http://localhost:${PORT}/trpc\n`);
});
