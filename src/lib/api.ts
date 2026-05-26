import type { Assignment, QuestionTypeInput } from "@/types/assignment";

// If NEXT_PUBLIC_API_BASE is set, use that (external Express backend).
// Otherwise call the Next.js internal /api routes via a relative URL.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export type CreateAssignmentPayload = {
  title?: string;
  subject: string;
  grade: string;
  school?: string;
  dueDate?: string;
  questionTypes: QuestionTypeInput[];
  instructions?: string;
  fileName?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {}
    throw new Error(
      `API ${res.status}: ${
        body && typeof body === "object" && "error" in body
          ? (body as { error: string }).error
          : res.statusText
      }`
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  createAssignment(payload: CreateAssignmentPayload) {
    return request<{ id: string; jobId: string; status: string }>("/api/assignments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  listAssignments() {
    return request<Assignment[]>("/api/assignments");
  },
  getAssignment(id: string) {
    return request<Assignment>(`/api/assignments/${id}`);
  },
  deleteAssignment(id: string) {
    return request<{ ok: boolean }>(`/api/assignments/${id}`, { method: "DELETE" });
  },
  regenerate(id: string) {
    return request<{ id: string; jobId: string; status: string }>(
      `/api/assignments/${id}/regenerate`,
      { method: "POST" }
    );
  },
  regenerateQuestion(id: string, section: number, q: number) {
    return request<{
      ok: boolean;
      question: import("@/types/assignment").GeneratedQuestion;
      source: "gemini" | "mock";
      warning?: string;
    }>(`/api/assignments/${id}/questions/${section}/${q}`, { method: "POST" });
  },
  patchQuestion(
    id: string,
    section: number,
    q: number,
    patch: {
      text?: string;
      difficulty?: "Easy" | "Moderate" | "Hard";
      marks?: number;
      answerKey?: string;
    }
  ) {
    return request<{
      ok: boolean;
      question: import("@/types/assignment").GeneratedQuestion;
      totalMarks: number;
    }>(`/api/assignments/${id}/questions/${section}/${q}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
  duplicate(id: string) {
    return request<{ id: string; status: string }>(`/api/assignments/${id}/duplicate`, {
      method: "POST",
    });
  },
  getShare(id: string) {
    return request<{
      _id: string;
      title: string;
      subject: string;
      grade: string;
      school: string;
      result: import("@/types/assignment").GeneratedResult;
      createdAt?: string;
    }>(`/api/share/${id}`);
  },
  notifications() {
    return request<{
      items: {
        id: string;
        title: string;
        body: string;
        assignmentId?: string;
        read: boolean;
        createdAt: string;
      }[];
      unread: number;
    }>("/api/notifications");
  },
  markNotificationsRead() {
    return request<{ ok: boolean; unread: number }>("/api/notifications", {
      method: "POST",
    });
  },
  analytics() {
    return request<{
      total: number;
      byStatus: Record<string, number>;
      bySubject: Record<string, number>;
      byGrade: Record<string, number>;
      totalQuestions: number;
      totalMarks: number;
      difficultyMix: { Easy: number; Moderate: number; Hard: number };
      last7Days: { date: string; count: number }[];
    }>("/api/analytics");
  },
};
