import { Router } from "express";
import { Assignment } from "../models/Assignment";
import { CreateAssignmentInput } from "../lib/schemas";
import { generationQueue } from "../queue";
import { redis } from "../redis";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = CreateAssignmentInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "ValidationError", details: parsed.error.flatten() });
  }

  const doc = await Assignment.create({ ...parsed.data, status: "pending" });
  const job = await generationQueue.add("generate", { assignmentId: String(doc._id) });
  doc.jobId = String(job.id);
  await doc.save();

  res.status(201).json({ id: String(doc._id), jobId: doc.jobId, status: doc.status });
});

router.get("/:id", async (req, res) => {
  const cacheKey = `assignment:${req.params.id}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  const doc = await Assignment.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: "NotFound" });
  if (doc.status === "ready") {
    await redis.set(cacheKey, JSON.stringify(doc), "EX", 60 * 60);
  }
  res.json(doc);
});

router.post("/:id/regenerate", async (req, res) => {
  const doc = await Assignment.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "NotFound" });
  doc.status = "pending";
  doc.error = "";
  doc.result = null;
  await doc.save();
  await redis.del(`assignment:${req.params.id}`);
  const job = await generationQueue.add("generate", { assignmentId: String(doc._id) });
  doc.jobId = String(job.id);
  await doc.save();
  res.json({ id: String(doc._id), jobId: doc.jobId, status: doc.status });
});

router.get("/", async (_req, res) => {
  const list = await Assignment.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json(list);
});

export default router;
