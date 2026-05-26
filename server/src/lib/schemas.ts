import { z } from "zod";

export const QuestionTypeInput = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(120),
  count: z.number().int().positive().max(50),
  marks: z.number().int().positive().max(50),
});

export const CreateAssignmentInput = z.object({
  title: z.string().min(1).max(120).default("Untitled Assignment"),
  subject: z.string().min(1).max(80),
  grade: z.string().min(1).max(40),
  school: z.string().max(120).optional().default(""),
  dueDate: z.string().max(40).optional().default(""),
  questionTypes: z.array(QuestionTypeInput).min(1).max(10),
  instructions: z.string().max(2000).optional().default(""),
  fileName: z.string().max(200).optional().default(""),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentInput>;

export const LLMQuestionSchema = z.object({
  text: z.string().min(1),
  difficulty: z.enum(["Easy", "Moderate", "Hard"]),
  marks: z.number().int().positive(),
  typeId: z.string().min(1),
});

export const LLMSectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(LLMQuestionSchema).min(1),
});

export const LLMResultSchema = z.object({
  school: z.string(),
  subject: z.string(),
  grade: z.string(),
  timeMinutes: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  sections: z.array(LLMSectionSchema).min(1),
});

export type LLMResult = z.infer<typeof LLMResultSchema>;
