import express from "express";
import cors from "cors";
import http from "http";
import { config } from "./config";
import { connectMongo } from "./db";
import { initSocket } from "./socket";
import assignmentsRouter from "./routes/assignments";

async function main() {
  await connectMongo();

  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/assignments", assignmentsRouter);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[api] error", err);
    res.status(500).json({ error: "InternalError", message: err.message });
  });

  const server = http.createServer(app);
  initSocket(server);

  server.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}`);
  });
}

main().catch((e) => {
  console.error("[api] fatal", e);
  process.exit(1);
});
