"use client";
import { useEffect } from "react";
import { useAssignmentStore } from "@/store/assignment";
import { api } from "@/lib/api";

/**
 * Subscribes to an assignment's status updates.
 * - If NEXT_PUBLIC_API_BASE is set, uses Socket.IO against the external backend.
 * - Otherwise polls the internal Next.js API every 1.5s until status is ready/failed.
 */
export function useAssignmentSocket(id: string | null) {
  const { setCurrent, setStatus, setResult, setError } = useAssignmentStore();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const useExternal = !!process.env.NEXT_PUBLIC_API_BASE;

    // initial load
    api
      .getAssignment(id)
      .then((doc) => {
        if (!cancelled) setCurrent(doc);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    if (useExternal) {
      let socket: import("socket.io-client").Socket | null = null;
      let stop = false;
      (async () => {
        const { io } = await import("socket.io-client");
        if (stop) return;
        socket = io(process.env.NEXT_PUBLIC_API_BASE!, {
          transports: ["websocket", "polling"],
        });
        const sub = () => socket!.emit("subscribe", id);
        if (socket.connected) sub();
        socket.on("connect", sub);
        socket.on("assignment:status", (d: { status: string }) => setStatus(d.status as never));
        socket.on("assignment:ready", (d: { result: never }) => setResult(d.result));
        socket.on("assignment:failed", (d: { error: string }) => setError(d.error));
      })();
      return () => {
        stop = true;
        cancelled = true;
        if (socket) {
          socket.emit("unsubscribe", id);
          socket.disconnect();
        }
      };
    }

    // polling fallback
    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const doc = await api.getAssignment(id);
        setCurrent(doc);
        if (doc.status === "ready" || doc.status === "failed") {
          clearInterval(interval);
        }
      } catch (e) {
        setError((e as Error).message);
        clearInterval(interval);
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, setCurrent, setStatus, setResult, setError]);
}
