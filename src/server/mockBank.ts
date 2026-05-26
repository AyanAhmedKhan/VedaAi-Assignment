import "server-only";
import type { Difficulty, QuestionTypeInput } from "@/types/assignment";

type Pool = Record<string, { Easy: string[]; Moderate: string[]; Hard: string[] }>;

// Plausible Class-8 / Grade-8 sample questions. Used by the offline generator
// when the real LLM is unavailable — keeps the demo paper looking realistic.
const BANK: Pool = {
  Science: {
    Easy: [
      "Define photosynthesis. Name the gas released during the process.",
      "What is friction? Give one example where friction is useful.",
      "State Newton's first law of motion in your own words.",
      "Name the three states of matter and give one example of each.",
      "What is the unit of electric current? Who is the unit named after?",
      "Why do we shiver when we feel cold?",
      "Name any two natural sources and two artificial sources of light.",
    ],
    Moderate: [
      "Differentiate between conductors and insulators of electricity with two examples each.",
      "Explain the role of chlorophyll in plants with the help of a balanced equation.",
      "A force of 20 N is applied on a body of mass 4 kg. Calculate the acceleration produced.",
      "Describe an experiment to show that air exerts pressure.",
      "Why does an iron nail rust when left in moist air? Suggest two ways to prevent rusting.",
      "What is sound? Explain how it travels through different media.",
    ],
    Hard: [
      "A car covers 60 km in the first 30 minutes and 90 km in the next hour. Find its average speed for the whole journey.",
      "Draw a labelled diagram of the human respiratory system and briefly explain the function of any two parts.",
      "Explain the difference between voluntary and involuntary muscles with one example each. Why is the heart called an involuntary muscle?",
      "Two resistors of 4 Ω and 6 Ω are connected in series across a 10 V battery. Find the current flowing through the circuit and the voltage across each resistor.",
    ],
  },
  Maths: {
    Easy: [
      "Find the value of x if 2x + 7 = 19.",
      "Express 0.625 as a fraction in its simplest form.",
      "Find the perimeter of a rectangle whose length is 12 cm and breadth is 7 cm.",
      "Write the additive inverse of -3/8.",
      "Convert 5/8 into a decimal.",
    ],
    Moderate: [
      "Solve the linear equation: 3(x - 4) + 5 = 2x + 1.",
      "Find the area of a trapezium whose parallel sides are 14 cm and 10 cm and the distance between them is 6 cm.",
      "If the cost of 7 metres of cloth is ₹ 1,470, find the cost of 1 metre. Use unitary method.",
      "Factorise: x² + 7x + 12.",
      "The sum of three consecutive integers is 72. Find the integers.",
    ],
    Hard: [
      "A sum of money becomes ₹ 6,272 in 2 years at the rate of 12% per annum compound interest. Find the principal.",
      "The volume of a cube is 729 cm³. Find the total surface area of the cube.",
      "If (a + b) = 10 and ab = 21, find the value of a² + b².",
      "Construct a quadrilateral PQRS in which PQ = 4 cm, QR = 5 cm, RS = 6 cm, SP = 4.5 cm, and diagonal PR = 7 cm.",
    ],
  },
  English: {
    Easy: [
      "Identify the noun in the following sentence: \"The children played in the garden.\"",
      "Use the word 'punctual' in a sentence of your own.",
      "Write the past tense of: run, swim, write, sing.",
      "Give one synonym and one antonym for the word 'brave'.",
      "Re-arrange the words to form a meaningful sentence: lake / a / there / near / is / forest / the.",
    ],
    Moderate: [
      "Change the following into indirect speech: She said, \"I will come tomorrow.\"",
      "Combine the sentences using a relative pronoun: I met a girl. She speaks four languages.",
      "Read the passage and answer: \"Honesty is a virtue. It earns respect from everyone.\" — What does the writer mean by 'virtue'?",
      "Write a short paragraph (60–80 words) on 'A book that changed my view of the world.'",
    ],
    Hard: [
      "Write a formal letter to the principal of your school requesting permission to organise a science exhibition. (120 words)",
      "Read the following extract and answer: identify the figure of speech and explain it — \"The wind whispered secrets through the leaves.\"",
      "Write a story in about 150 words beginning with: \"As I opened the dusty old box, I could not believe what I saw…\"",
    ],
  },
  Social: {
    Easy: [
      "Who was the founder of the Mughal dynasty in India?",
      "Name the three branches of the Indian government.",
      "What is the capital of Australia?",
      "Define the term 'democracy' in one sentence.",
    ],
    Moderate: [
      "Explain any two causes of the Revolt of 1857.",
      "How does the Constitution of India protect the rights of minorities? Give two examples.",
      "Describe any two features of the Industrial Revolution that changed daily life.",
    ],
    Hard: [
      "\"Independence brought political freedom but not economic freedom.\" Discuss with reference to India's situation in 1947.",
      "Compare the working of the Lok Sabha and the Rajya Sabha under four headings.",
    ],
  },
};

const GENERIC: Record<Difficulty, string[]> = {
  Easy: [
    "State the definition of the topic and give one everyday example.",
    "List any two key terms related to the topic and write their meanings.",
    "Identify the components shown in the diagram. (Draw a simple diagram and label it.)",
  ],
  Moderate: [
    "Compare and contrast the two ideas studied in this chapter. Use a table for clarity.",
    "Explain the working of the process with the help of a labelled diagram.",
    "Give two reasons why the phenomenon occurs and one real-life application.",
  ],
  Hard: [
    "A practical scenario is described. Apply the concepts you have learned to predict the outcome and justify your answer.",
    "Solve the following problem step by step, clearly stating any assumptions you make.",
    "Write a short note (about 100 words) analysing the long-term impact of the topic on society or daily life.",
  ],
};

function bestSubjectKey(subject: string): keyof typeof BANK | null {
  const s = subject.toLowerCase();
  if (/(science|physic|chem|bio)/.test(s)) return "Science";
  if (/(math|algebra|geometr|arith)/.test(s)) return "Maths";
  if (/(english|language|literat|gramma)/.test(s)) return "English";
  if (/(social|history|civic|geograph|polit|economic)/.test(s)) return "Social";
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TYPE_PREFIX: Record<string, (text: string, i: number) => string> = {
  mcq: (text) =>
    `${text}\n   a) Option A   b) Option B   c) Option C   d) Option D`,
  "true-false": (text) => `${text} (True / False)`,
  "fill-blanks": (text) => `Fill in the blank: ${text.replace(/[.?]$/, " ____.")}`,
  match: (text) =>
    `Match the following with respect to: ${text} (Column A ↔ Column B)`,
  "case-study": (text) =>
    `Case Study — Read the situation and answer briefly:\n   ${text}`,
};

export function pickQuestionsForType({
  subject,
  type,
  index,
}: {
  subject: string;
  type: QuestionTypeInput;
  index: number; // section index (for variety)
}): { text: string; difficulty: Difficulty; answerKey: string }[] {
  const key = bestSubjectKey(subject);
  const easyPool = key ? BANK[key].Easy : GENERIC.Easy;
  const modPool = key ? BANK[key].Moderate : GENERIC.Moderate;
  const hardPool = key ? BANK[key].Hard : GENERIC.Hard;

  // Distribute difficulty roughly: 40% easy, 40% moderate, 20% hard.
  const distribution: Difficulty[] = [];
  for (let i = 0; i < type.count; i++) {
    const r = (i + index) % 5;
    if (r < 2) distribution.push("Easy");
    else if (r < 4) distribution.push("Moderate");
    else distribution.push("Hard");
  }

  const easy = shuffle(easyPool);
  const mod = shuffle(modPool);
  const hard = shuffle(hardPool);
  const counts = { Easy: 0, Moderate: 0, Hard: 0 };
  const decorate = TYPE_PREFIX[type.id];

  return distribution.map((d, i) => {
    const pool = d === "Easy" ? easy : d === "Moderate" ? mod : hard;
    const raw = pool[counts[d]++ % pool.length];
    const text = decorate ? decorate(raw, i) : raw;
    return {
      text,
      difficulty: d,
      answerKey:
        "Model answer: address the key concept in 2–4 lines, mention any relevant formula or example, and conclude with the final result or definition.",
    };
  });
}
