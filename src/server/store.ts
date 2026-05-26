import "server-only";
import type { Assignment } from "@/types/assignment";

declare global {
  // eslint-disable-next-line no-var
  var __vedaai_store: Map<string, Assignment> | undefined;
  // eslint-disable-next-line no-var
  var __vedaai_notifs: Notification[] | undefined;
}

const assignments: Map<string, Assignment> =
  globalThis.__vedaai_store ?? (globalThis.__vedaai_store = new Map());

export const store = {
  list(): Assignment[] {
    return [...assignments.values()].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );
  },
  get(id: string): Assignment | undefined {
    return assignments.get(id);
  },
  set(a: Assignment): Assignment {
    assignments.set(a._id, a);
    return a;
  },
  update(id: string, patch: Partial<Assignment>): Assignment | undefined {
    const existing = assignments.get(id);
    if (!existing) return undefined;
    const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    assignments.set(id, next);
    return next;
  },
  delete(id: string): boolean {
    return assignments.delete(id);
  },
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  assignmentId?: string;
  read: boolean;
  createdAt: string;
};

const notifs: Notification[] = globalThis.__vedaai_notifs ?? (globalThis.__vedaai_notifs = []);

export const notifications = {
  list(): Notification[] {
    return [...notifs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  unreadCount(): number {
    return notifs.filter((n) => !n.read).length;
  },
  push(n: Omit<Notification, "id" | "createdAt" | "read">): Notification {
    const created: Notification = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
      ...n,
    };
    notifs.unshift(created);
    while (notifs.length > 50) notifs.pop();
    return created;
  },
  markAllRead() {
    notifs.forEach((n) => (n.read = true));
  },
};
