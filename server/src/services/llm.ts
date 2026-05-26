import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";
import { config } from "../config";
import { LLMResultSchema, type LLMResult } from "../lib/schemas";

type Input = {
  subject: string;
  grade: string;
  school: string;
  instructions: string;
  questionTypes: { id: string; label: string; count: number; marks: number }[];
};

const SYSTEM_PROMPT = `You are an experienced exam paper setter for K-12 classrooms.

You will be given an assignment specification and must produce a structured question paper.

Strict rules:
- Output ONLY valid JSON conforming to the provided schema. No prose, no markdown fences.
- Group questions into sections (A, B, C, ...) — one section per requested question type unless a type is very small and merges cleanly.
- Each section gets a clear instruction line (e.g. "Attempt all questions. Each carries 2 marks.").
- Questions must be original, age-appropriate, pedagogically sound, and specific to the subject/grade.
- Spread difficulty across Easy / Moderate / Hard within each section.
- Marks per question must match the requested marks for that question type.
- Set timeMinutes proportional to total marks (roughly 1.5x marks, clamped 30-180).
- totalMarks must equal the sum of marks across all questions.
- Use real, specific question text. Do not write placeholders like "Question 1".
- Use the typeId values exactly as provided in the input.`;

const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    school: { type: SchemaType.STRING },
    subject: { type: SchemaType.STRING },
    grade: { type: SchemaType.STRING },
    timeMinutes: { type: SchemaType.INTEGER },
    totalMarks: { type: SchemaType.INTEGER },
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          instruction: { type: SchemaType.STRING },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: { type: SchemaType.STRING },
                difficulty: {
                  type: SchemaType.STRING,
                  enum: ["Easy", "Moderate", "Hard"],
                  format: "enum",
                },
                marks: { type: SchemaType.INTEGER },
                typeId: { type: SchemaType.STRING },
              },
              required: ["text", "difficulty", "marks", "typeId"],
            },
          },
        },
        required: ["title", "instruction", "questions"],
      },
    },
  },
  required: ["school", "subject", "grade", "timeMinutes", "totalMarks", "sections"],
};

function buildUserPrompt(input: Input): string {
  const lines = [
    `Subject: ${input.subject}`,
    `Grade / Class: ${input.grade}`,
    input.school ? `School: ${input.school}` : "",
    `Question type breakdown:`,
    ...input.questionTypes.map(
      (t, i) =>
        `  ${String.fromCharCode(65 + i)}. ${t.label} — ${t.count} questions × ${t.marks} marks (typeId: "${t.id}")`
    ),
    input.instructions ? `Additional instructions from teacher: ${input.instructions}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export async function generateQuestionPaper(input: Input): Promise<LLMResult> {
  if (!config.geminiApiKey) {
    return mockGenerate(input);
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: config.geminiModel,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const result = await model.generateContent(buildUserPrompt(input));
  const text = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Gemini returned invalid JSON: ${(e as Error).message}`);
  }

  const validated = LLMResultSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Gemini JSON failed schema: ${validated.error.message}`);
  }
  return validated.data;
}

function mockGenerate(input: Input): LLMResult {
  const sectionLabels = ["A", "B", "C", "D", "E"];
  const difficulties: ("Easy" | "Moderate" | "Hard")[] = ["Easy", "Moderate", "Hard"];
  const sections = input.questionTypes.map((t, idx) => ({
    title: `Section ${sectionLabels[idx] ?? idx + 1}`,
    instruction: `Attempt all questions. Each question carries ${t.marks} ${
      t.marks === 1 ? "mark" : "marks"
    }.`,
    questions: Array.from({ length: t.count }, (_, i) => ({
      text: `Sample ${t.label.toLowerCase()} #${i + 1} on ${input.subject} for ${input.grade}.`,
      difficulty: difficulties[i % 3],
      marks: t.marks,
      typeId: t.id,
    })),
  }));
  const totalMarks = sections.reduce(
    (s, sec) => s + sec.questions.reduce((a, q) => a + q.marks, 0),
    0
  );
  return {
    school: input.school || "Sample Public School",
    subject: input.subject,
    grade: input.grade,
    timeMinutes: Math.min(180, Math.max(30, Math.round(totalMarks * 1.5))),
    totalMarks,
    sections,
  };
}
