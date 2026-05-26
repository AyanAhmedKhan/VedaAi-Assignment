"use client";
import { create } from "zustand";
import { z } from "zod";
import type { QuestionTypeInput } from "@/types/assignment";

const FormSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(80),
  grade: z.string().trim().min(1, "Class / Grade is required").max(40),
  school: z.string().trim().max(120).optional(),
  dueDate: z
    .string()
    .trim()
    .regex(/^(\d{2}-\d{2}-\d{4})?$/, "Use DD-MM-YYYY")
    .optional(),
  instructions: z.string().max(2000).optional(),
  questionTypes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1, "Label required"),
        count: z.number().int().min(1, "Min 1").max(50),
        marks: z.number().int().min(1, "Min 1").max(50),
      })
    )
    .min(1, "Add at least one question type"),
});

export type AssignmentFormErrors = Partial<Record<string, string>>;

const defaultTypes: QuestionTypeInput[] = [
  { id: "mcq", label: "Multiple Choice Questions", count: 4, marks: 1 },
  { id: "short", label: "Short Questions", count: 3, marks: 2 },
  { id: "diagram", label: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
  { id: "numerical", label: "Numerical Problems", count: 5, marks: 5 },
];

type State = {
  subject: string;
  grade: string;
  school: string;
  dueDate: string;
  fileName: string;
  instructions: string;
  questionTypes: QuestionTypeInput[];
  errors: AssignmentFormErrors;
  submitting: boolean;
  setField: <K extends keyof Omit<State, "errors" | "submitting" | "setField" | "updateType" | "addType" | "removeType" | "validate" | "reset">>(
    k: K,
    v: State[K]
  ) => void;
  updateType: (i: number, patch: Partial<QuestionTypeInput>) => void;
  addType: () => void;
  removeType: (i: number) => void;
  validate: () => { ok: boolean; errors: AssignmentFormErrors };
  reset: () => void;
  setSubmitting: (b: boolean) => void;
};

export const useAssignmentForm = create<State>((set, get) => ({
  subject: "Science",
  grade: "Class 8",
  school: "Delhi Public School",
  dueDate: "",
  fileName: "",
  instructions: "",
  questionTypes: defaultTypes,
  errors: {},
  submitting: false,
  setField: (k, v) => set({ [k]: v } as any),
  updateType: (i, patch) =>
    set((s) => ({
      questionTypes: s.questionTypes.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    })),
  addType: () =>
    set((s) => ({
      questionTypes: [
        ...s.questionTypes,
        {
          id: `t-${Date.now()}`,
          label: "Untitled question type",
          count: 1,
          marks: 1,
        },
      ],
    })),
  removeType: (i) =>
    set((s) => ({ questionTypes: s.questionTypes.filter((_, idx) => idx !== i) })),
  validate: () => {
    const s = get();
    const result = FormSchema.safeParse({
      subject: s.subject,
      grade: s.grade,
      school: s.school,
      dueDate: s.dueDate,
      instructions: s.instructions,
      questionTypes: s.questionTypes,
    });
    if (result.success) {
      set({ errors: {} });
      return { ok: true, errors: {} };
    }
    const errors: AssignmentFormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      errors[key] = issue.message;
    }
    set({ errors });
    return { ok: false, errors };
  },
  reset: () =>
    set({
      subject: "",
      grade: "",
      school: "",
      dueDate: "",
      fileName: "",
      instructions: "",
      questionTypes: defaultTypes,
      errors: {},
      submitting: false,
    }),
  setSubmitting: (b) => set({ submitting: b }),
}));
