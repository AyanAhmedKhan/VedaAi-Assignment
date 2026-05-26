import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { redis } from "./redis";
import { config } from "./config";

let io: IOServer | null = null;

export function initSocket(httpServer: HTTPServer) {
  io = new IOServer(httpServer, {
    cors: { origin: config.corsOrigin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.on("subscribe", (assignmentId: string) => {
      if (typeof assignmentId === "string" && assignmentId.length > 0) {
        socket.join(`assignment:${assignmentId}`);
      }
    });
    socket.on("unsubscribe", (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });
  });

  // Cross-process bridge: the worker (a separate process) publishes via Redis,
  // the API process broadcasts via Socket.IO.
  const sub = redis.duplicate();
  sub.subscribe("assignment-events", (err) => {
    if (err) console.error("[socket] redis subscribe failed", err.message);
  });
  sub.on("message", (_channel, payload) => {
    try {
      const evt = JSON.parse(payload) as { assignmentId: string; event: string; data: unknown };
      io?.to(`assignment:${evt.assignmentId}`).emit(evt.event, evt.data);
    } catch (e) {
      console.error("[socket] bad event payload", e);
    }
  });

  console.log("[socket] initialized");
  return io;
}

export function getIO() {
  return io;
}
