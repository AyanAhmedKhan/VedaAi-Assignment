import "server-only";
import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";
import type { GeneratedResult, QuestionTypeInput } from "@/types/assignment";
import { pickQuestionsForType } from "./mockBank";
import { getRateStatus, recordRateHit, type RateStatus } from "./rateLimit";

const SYSTEM_PROMPT = `You are an experienced exam paper setter for K-12 classrooms.

You will be given an assignment specification and must produce a structured question paper.

Strict rules:
- Output ONLY valid JSON conforming to the provided schema. No prose, no markdown fences.
- Group questions into sections (A, B, C, ...) — one section per requested question type unless small types merge cleanly.
- Each section gets a clear instruction line (e.g. "Attempt all questions. Each carries 2 marks.").
- Questions must be original, age-appropriate, pedagogically sound, and specific to the subject/grade.
- Spread difficulty across Easy / Moderate / Hard within each section.
- Marks per question must match the requested marks for that question type.
- Set timeMinutes proportional to total marks (roughly 1.5x marks, clamped 30-180).
- totalMarks must equal the sum of marks across all questions.
- Use real, specific question text. Do not write placeholders.
- Use the typeId values exactly as provided.
- For EVERY question, include a concise answerKey (1–3 sentences). For MCQs, write the correct option letter and a short reason; for numericals, show the final answer with units; for short/long answers, write a model answer in 2–4 lines.`;

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
                answerKey: { type: SchemaType.STRING },
              },
              required: ["text", "difficulty", "marks", "typeId", "answerKey"],
            },
          },
        },
        required: ["title", "instruction", "questions"],
      },
    },
  },
  required: ["school", "subject", "grade", "timeMinutes", "totalMarks", "sections"],
};

type Input = {
  subject: string;
  grade: string;
  school: string;
  instructions: string;
  questionTypes: QuestionTypeInput[];
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

export type GenerationOutcome = {
  result: GeneratedResult;
  source: "gemini" | "mock";
  warning?: string;
  rate?: RateStatus;
};

function rateLimitMessage(rate: RateStatus): string {
  const resets = new Date(rate.resetAt).toUTCString().replace(/:\d\d /, " ");
  return `Daily AI limit reached (${rate.limit}/day). Resets at ${resets}. Used the offline generator.`;
}

function shortError(e: unknown): string {
  const msg = (e as Error)?.message ?? String(e);
  if (/429|quota|rate limit/i.test(msg)) {
    return "Gemini free-tier quota exceeded — used the offline generator.";
  }
  if (/401|403|api key|permission/i.test(msg)) {
    return "Gemini auth failed — used the offline generator.";
  }
  if (/network|fetch failed|ENOTFOUND|ECONNREFUSED/i.test(msg)) {
    return "Could not reach Gemini — used the offline generator.";
  }
  return "Gemini call failed — used the offline generator.";
}

export async function generateQuestionPaper(
  input: Input,
  identity: string = "global"
): Promise<GenerationOutcome> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Per-day rate limit. Once exceeded, always fall back to the offline bank.
  const rate = getRateStatus(identity);
  if (!rate.allowed) {
    return {
      result: mockGenerate(input),
      source: "mock",
      warning: rateLimitMessage(rate),
      rate,
    };
  }

  if (!apiKey) {
    return { result: mockGenerate(input), source: "mock", rate };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
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
    const parsed = JSON.parse(text) as GeneratedResult;
    recordRateHit(identity);
    return { result: parsed, source: "gemini", rate: getRateStatus(identity) };
  } catch (e) {
    console.warn("[llm] Gemini call failed, falling back to mock:", (e as Error).message);
    return {
      result: mockGenerate(input),
      source: "mock",
      warning: shortError(e),
      rate,
    };
  }
}

// ---- Single-question regeneration ----

const ONE_QUESTION_SCHEMA: Schema = {
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
    answerKey: { type: SchemaType.STRING },
  },
  required: ["text", "difficulty", "marks", "typeId", "answerKey"],
};

type OneInput = {
  subject: string;
  grade: string;
  sectionTitle: string;
  sectionInstruction: string;
  question: GeneratedResult["sections"][number]["questions"][number];
  avoidTexts: string[];
};

export async function regenerateQuestion(
  input: OneInput,
  identity: string = "global"
): Promise<{
  question: GeneratedResult["sections"][number]["questions"][number];
  source: "gemini" | "mock";
  warning?: string;
  rate?: RateStatus;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const rate = getRateStatus(identity);
  if (!rate.allowed) {
    return {
      question: mockOneQuestion(input),
      source: "mock",
      warning: rateLimitMessage(rate),
      rate,
    };
  }

  if (!apiKey) {
    return { question: mockOneQuestion(input), source: "mock", rate };
  }

  const sys = `${SYSTEM_PROMPT}

You are rewriting ONE question. Keep:
- The same difficulty: ${input.question.difficulty}
- The same marks: ${input.question.marks}
- The same typeId: ${input.question.typeId}
Make it materially different from the AVOID list, but still fitting the section.`;

  const user = [
    `Subject: ${input.subject}`,
    `Grade / Class: ${input.grade}`,
    `Section: ${input.sectionTitle}`,
    `Section instruction: ${input.sectionInstruction}`,
    "",
    "Avoid producing anything similar to these existing questions:",
    ...input.avoidTexts.map((t) => `- ${t}`),
  ].join("\n");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: sys,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ONE_QUESTION_SCHEMA,
        temperature: 0.9,
        maxOutputTokens: 600,
      },
    });
    const r = await model.generateContent(user);
    const text = r.response.text();
    const parsed = JSON.parse(text) as GeneratedResult["sections"][number]["questions"][number];
    recordRateHit(identity);
    return {
      question: {
        ...parsed,
        marks: input.question.marks,
        typeId: input.question.typeId,
        difficulty: input.question.difficulty,
      },
      source: "gemini",
      rate: getRateStatus(identity),
    };
  } catch (e) {
    console.warn("[llm] regenerateQuestion failed:", (e as Error).message);
    return {
      question: mockOneQuestion(input),
      source: "mock",
      warning: shortError(e),
      rate,
    };
  }
}

function mockOneQuestion(input: OneInput): GeneratedResult["sections"][number]["questions"][number] {
  const variants = [
    `Alternative ${input.question.typeId} question on ${input.subject} for ${input.grade}. Reframe the concept and ask the learner to apply it in a new context.`,
    `Re-worded ${input.question.typeId} question: ${input.question.text.split(/[.?]/)[0]}? Consider a different real-life example.`,
    `Fresh ${input.question.typeId} prompt — explore an everyday situation related to ${input.subject} for ${input.grade}.`,
  ];
  const text = variants[Math.floor(Math.random() * variants.length)];
  return {
    ...input.question,
    text,
    answerKey: "Model answer: provide a clear, concise response of 2–4 lines covering the key concept.",
  };
}

export function mockGenerate(input: Input): GeneratedResult {
  const labels = ["A", "B", "C", "D", "E"];
  const sections = input.questionTypes.map((t, idx) => {
    const picked = pickQuestionsForType({
      subject: input.subject,
      type: t,
      index: idx,
    });
    return {
      title: `Section ${labels[idx] ?? idx + 1}`,
      instruction: `Attempt all questions. Each question carries ${t.marks} ${
        t.marks === 1 ? "mark" : "marks"
      }.`,
      questions: picked.map((q) => ({
        text: q.text,
        difficulty: q.difficulty,
        marks: t.marks,
        typeId: t.id,
        answerKey: q.answerKey,
      })),
    };
  });
  const totalMarks = sections.reduce(
    (s, sec) => s + sec.questions.reduce((a, q) => a + q.marks, 0),
    0
  );
  return {
    school: input.school || "Delhi Public School",
    subject: input.subject,
    grade: input.grade || "Class 8",
    timeMinutes: Math.min(180, Math.max(30, Math.round(totalMarks * 1.5))),
    totalMarks,
    sections,
  };
}
