export type Difficulty = "Easy" | "Moderate" | "Hard";

export type QuestionTypeInput = {
  id: string;
  label: string;
  count: number;
  marks: number;
};

export type GeneratedQuestion = {
  text: string;
  difficulty: Difficulty;
  marks: number;
  typeId: string;
  answerKey?: string;
};

export type GeneratedSection = {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
};

export type GeneratedResult = {
  school: string;
  subject: string;
  grade: string;
  timeMinutes: number;
  totalMarks: number;
  sections: GeneratedSection[];
};

export type AssignmentStatus = "pending" | "processing" | "ready" | "failed";

export type Assignment = {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  school: string;
  dueDate: string;
  questionTypes: QuestionTypeInput[];
  instructions: string;
  fileName: string;
  status: AssignmentStatus;
  error?: string;
  warning?: string;
  source?: "gemini" | "mock";
  jobId?: string;
  result?: GeneratedResult | null;
  createdAt?: string;
  updatedAt?: string;
};
