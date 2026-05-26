import type { GeneratedResult } from "@/types/assignment";

const TYPE_LABEL: Record<string, string> = {
  mcq: "MCQ",
  "true-false": "T/F",
  "fill-blanks": "Fill-Up",
  short: "Short",
  long: "Long",
  diagram: "Diagram",
  numerical: "Numerical",
  "case-study": "Case Study",
  match: "Match",
  essay: "Essay",
};

export function paperToMarkdown(result: GeneratedResult, includeAnswers = false): string {
  const lines: string[] = [];
  lines.push(`# ${result.school || "Question Paper"}`);
  lines.push("");
  lines.push(`**Subject:** ${result.subject}  `);
  lines.push(`**Class:** ${result.grade}  `);
  lines.push(`**Time:** ${result.timeMinutes} minutes  `);
  lines.push(`**Maximum Marks:** ${result.totalMarks}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("**Note:** Answer all questions. All sections are compulsory unless stated otherwise.");
  lines.push("");

  result.sections.forEach((sec) => {
    lines.push(`## ${sec.title}`);
    lines.push(`_${sec.instruction}_`);
    lines.push("");
    sec.questions.forEach((q, i) => {
      const typeLabel = TYPE_LABEL[q.typeId] ?? q.typeId;
      lines.push(
        `${i + 1}. **[${q.difficulty} · ${typeLabel} · ${q.marks} marks]** ${q.text}`
      );
      if (includeAnswers && q.answerKey) {
        lines.push(`   - _Answer:_ ${q.answerKey}`);
      }
    });
    lines.push("");
  });

  lines.push("---");
  lines.push("**End of Question Paper**");
  return lines.join("\n");
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
