import { z } from "zod";

export const QuestionTypeInput = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(120),
  count: z.number().int().positive().max(50),
  marks: z.number().int().positive().max(50),
});

export const CreateAssignmentInput = z.object({
  title: z.string().min(1).max(120).optional(),
  subject: z.string().trim().min(1).max(80),
  grade: z.string().trim().min(1).max(40),
  school: z.string().max(120).optional(),
  dueDate: z.string().max(40).optional(),
  questionTypes: z.array(QuestionTypeInput).min(1).max(10),
  instructions: z.string().max(2000).optional(),
  fileName: z.string().max(200).optional(),
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentInput>;
