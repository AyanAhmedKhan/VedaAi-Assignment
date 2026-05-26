import { redis } from "../redis";

export async function publishAssignmentEvent(
  assignmentId: string,
  event: "assignment:status" | "assignment:ready" | "assignment:failed",
  data: unknown
) {
  await redis.publish(
    "assignment-events",
    JSON.stringify({ assignmentId, event, data })
  );
}
