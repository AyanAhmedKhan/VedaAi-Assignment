"use client";
import { create } from "zustand";
import type { Assignment, AssignmentStatus, GeneratedResult } from "@/types/assignment";

type State = {
  current: Assignment | null;
  status: AssignmentStatus | "idle";
  error: string;
  setCurrent: (a: Assignment) => void;
  setStatus: (s: AssignmentStatus) => void;
  setResult: (r: GeneratedResult) => void;
  setError: (e: string) => void;
  clear: () => void;
};

export const useAssignmentStore = create<State>((set) => ({
  current: null,
  status: "idle",
  error: "",
  setCurrent: (a) => set({ current: a, status: a.status, error: a.error ?? "" }),
  setStatus: (s) => set({ status: s }),
  setResult: (r) =>
    set((st) => ({
      status: "ready",
      current: st.current ? { ...st.current, status: "ready", result: r } : st.current,
    })),
  setError: (e) => set({ status: "failed", error: e }),
  clear: () => set({ current: null, status: "idle", error: "" }),
}));
