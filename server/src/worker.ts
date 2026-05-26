import { Worker } from "bullmq";
import { redis } from "./redis";
import { QUEUE_NAME } from "./config";
import { connectMongo } from "./db";
import { Assignment } from "./models/Assignment";
import { generateQuestionPaper } from "./services/llm";
import { publishAssignmentEvent } from "./lib/publish";
import type { GenerationJobData } from "./queue";

async function main() {
  await connectMongo();

  const worker = new Worker<GenerationJobData>(
    QUEUE_NAME,
    async (job) => {
      const { assignmentId } = job.data;
      const doc = await Assignment.findById(assignmentId);
      if (!doc) throw new Error(`Assignment ${assignmentId} not found`);

      doc.status = "processing";
      await doc.save();
      await publishAssignmentEvent(assignmentId, "assignment:status", { status: "processing" });

      const result = await generateQuestionPaper({
        subject: doc.subject || "General",
        grade: doc.grade || "Class 5",
        school: doc.school || "",
        instructions: doc.instructions || "",
        questionTypes: doc.questionTypes.map((t: any) => ({
          id: t.id,
          label: t.label,
          count: t.count,
          marks: t.marks,
        })),
      });

      doc.result = result as any;
      doc.status = "ready";
      doc.error = "";
      await doc.save();

      await redis.del(`assignment:${assignmentId}`);
      await publishAssignmentEvent(assignmentId, "assignment:ready", {
        status: "ready",
        result,
      });

      return { ok: true };
    },
    { connection: redis, concurrency: 2 }
  );

  worker.on("failed", async (job, err) => {
    if (!job) return;
    console.error("[worker] job failed", job.id, err.message);
    const assignmentId = job.data.assignmentId;
    try {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: "failed",
        error: err.message,
      });
      await publishAssignmentEvent(assignmentId, "assignment:failed", {
        status: "failed",
        error: err.message,
      });
    } catch (e) {
      console.error("[worker] failure handler error", (e as Error).message);
    }
  });

  worker.on("ready", () => console.log("[worker] ready"));
}

main().catch((e) => {
  console.error("[worker] fatal", e);
  process.exit(1);
});
