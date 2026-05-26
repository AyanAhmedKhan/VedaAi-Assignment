import { NextResponse } from "next/server";
import { store } from "@/server/store";

export const runtime = "nodejs";

export async function GET() {
  const items = store.list();
  const total = items.length;
  const byStatus = items.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const bySubject = items.reduce<Record<string, number>>((acc, a) => {
    const k = a.subject || "Unspecified";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const byGrade = items.reduce<Record<string, number>>((acc, a) => {
    const k = a.grade || "Unspecified";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  let totalQuestions = 0;
  let totalMarks = 0;
  let easy = 0,
    moderate = 0,
    hard = 0;
  items.forEach((a) => {
    a.result?.sections.forEach((s) =>
      s.questions.forEach((q) => {
        totalQuestions += 1;
        totalMarks += q.marks;
        if (q.difficulty === "Easy") easy += 1;
        else if (q.difficulty === "Moderate") moderate += 1;
        else hard += 1;
      })
    );
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      count: items.filter((a) => (a.createdAt ?? "").slice(0, 10) === key).length,
    };
  });

  return NextResponse.json({
    total,
    byStatus,
    bySubject,
    byGrade,
    totalQuestions,
    totalMarks,
    difficultyMix: { Easy: easy, Moderate: moderate, Hard: hard },
    last7Days,
  });
}
