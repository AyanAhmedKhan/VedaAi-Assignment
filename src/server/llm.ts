import "server-only";
import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";
import type { GeneratedResult, QuestionTypeInput } from "@/types/assignment";
import { pickQuestionsForType } from "./mockBank";
import { getRateStatus, recordRateHit, type RateStatus } from "./rateLimit";

const SYSTEM_PROMPT = `You are an experienced exam paper setter for K-12 schools. Your output is consumed by software, so you MUST follow the schema and counts exactly.

OUTPUT FORMAT
- Return ONLY a single JSON object that conforms to the provided responseSchema. No prose, no markdown fences, no comments.

STRUCTURE
- Produce one section per requested question type, in the order the teacher provided them.
- Section titles are "Section A", "Section B", "Section C", … in order.
- Each section gets a one-line instruction (e.g. "Attempt all questions. Each carries 2 marks.").
- Inside each section, every question MUST use the typeId of that section's question type, exactly as given.

COUNTS — these are non-negotiable
- For every question type, produce EXACTLY the requested number of questions with EXACTLY the requested marks per question.
- totalMarks MUST equal the sum of marks across all questions you generate.
- timeMinutes ≈ 1.5 × totalMarks, clamped to [30, 180].

QUALITY
- Questions must be original, age-appropriate for the stated grade, pedagogically sound, and specific to the stated subject.
- Spread Easy / Moderate / Hard difficulty across each section (roughly 40% / 40% / 20%).
- Do NOT write placeholders like "Question 1" — write the actual question text.
- For MCQs, write the question, then list four options inline as: "a) … b) … c) … d) …".
- For numerical problems, include the specific values needed to solve them.
- Respect any "Additional instructions from teacher" — they override defaults (e.g. exam duration, syllabus chapter, language).

ANSWER KEY (required for every question)
- MCQ → state the correct option letter and one-sentence reason.
- True/False → "True" or "False" plus a one-sentence justification.
- Fill-in-the-blanks → the exact missing word(s).
- Numerical → show the final numeric answer with units (and one line of working if helpful).
- Short / Long / Essay / Diagram / Case Study → 2-4 line model answer covering the key points expected.

OUTPUT FIELDS
- school: echo the teacher's school name. If blank, use "School".
- subject: echo verbatim.
- grade: echo verbatim.`;

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
  title?: string;
  dueDate?: string;
  fileName?: string;
};

function buildUserPrompt(input: Input): string {
  const totalQuestions = input.questionTypes.reduce((s, t) => s + t.count, 0);
  const totalMarks = input.questionTypes.reduce((s, t) => s + t.count * t.marks, 0);
  const timeMinutes = Math.min(180, Math.max(30, Math.round(totalMarks * 1.5)));

  const lines: string[] = [
    "# Assignment specification",
    "",
    `- Subject: ${input.subject}`,
    `- Grade / Class: ${input.grade}`,
    input.school ? `- School: ${input.school}` : "",
    input.title && input.title !== "Untitled Assignment" ? `- Paper title: ${input.title}` : "",
    input.dueDate ? `- Due date (context, not for printing): ${input.dueDate}` : "",
    input.fileName
      ? `- Reference material the teacher uploaded (filename only, content not provided): ${input.fileName}. Use the filename as a hint about the chapter/topic if relevant.`
      : "",
    "",
    "# Sections to produce (one per item, in this order)",
    ...input.questionTypes.map((t, i) => {
      const sec = String.fromCharCode(65 + i);
      return `${sec}. typeId="${t.id}" · label="${t.label}" · COUNT=${t.count} · MARKS_EACH=${t.marks} · SECTION_TOTAL=${t.count * t.marks}`;
    }),
    "",
    "# Expected totals (must match exactly)",
    `- Total questions: ${totalQuestions}`,
    `- Total marks: ${totalMarks}`,
    `- timeMinutes target: ${timeMinutes}`,
    "",
  ];

  if (input.instructions && input.instructions.trim()) {
    lines.push("# Additional instructions from teacher (highest priority — override defaults)");
    lines.push(input.instructions.trim());
    lines.push("");
  }

  lines.push(
    "Return the JSON now. Make sure each section has exactly the requested number of questions with the requested marks. Use the typeId values verbatim."
  );

  return lines.filter(Boolean).join("\n");
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
  const rate = await getRateStatus(identity);
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

    const userPrompt = buildUserPrompt(input);
    if (process.env.NODE_ENV !== "production") {
      console.log("[llm] === user prompt ===\n" + userPrompt + "\n===================");
    }
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const parsed = JSON.parse(text) as GeneratedResult;
    await recordRateHit(identity);
    return { result: parsed, source: "gemini", rate: await getRateStatus(identity) };
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
  instructions?: string;
  school?: string;
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

  const rate = await getRateStatus(identity);
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

# Single-question regeneration mode
You are rewriting ONE question for an existing paper. You MUST keep:
- difficulty exactly = "${input.question.difficulty}"
- marks exactly = ${input.question.marks}
- typeId exactly = "${input.question.typeId}"

Write something materially different from the AVOID list below, but still fitting the section and the teacher's original instructions. Output exactly one JSON object matching the responseSchema (text, difficulty, marks, typeId, answerKey).`;

  const userLines: string[] = [
    `Subject: ${input.subject}`,
    `Grade / Class: ${input.grade}`,
    input.school ? `School: ${input.school}` : "",
    `Section: ${input.sectionTitle}`,
    `Section instruction: ${input.sectionInstruction}`,
    `Question type label: ${input.question.typeId}`,
    "",
  ];

  if (input.instructions && input.instructions.trim()) {
    userLines.push("Teacher's original instructions (preserve their intent):");
    userLines.push(input.instructions.trim());
    userLines.push("");
  }

  userLines.push("Existing question being replaced:");
  userLines.push(`- ${input.question.text}`);
  userLines.push("");
  userLines.push("Avoid producing anything similar to these existing questions in the same section:");
  for (const t of input.avoidTexts) {
    userLines.push(`- ${t}`);
  }

  const user = userLines.join("\n");
  if (process.env.NODE_ENV !== "production") {
    console.log("[llm] === regen-one prompt ===\n" + user + "\n========================");
  }

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
    await recordRateHit(identity);
    return {
      question: {
        ...parsed,
        marks: input.question.marks,
        typeId: input.question.typeId,
        difficulty: input.question.difficulty,
      },
      source: "gemini",
      rate: await getRateStatus(identity),
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
