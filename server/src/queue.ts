import { Queue } from "bullmq";
import { redis } from "./redis";
import { QUEUE_NAME } from "./config";

export type GenerationJobData = { assignmentId: string };

export const generationQueue = new Queue<GenerationJobData>(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});
