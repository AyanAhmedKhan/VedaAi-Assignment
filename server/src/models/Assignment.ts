import { Schema, model, InferSchemaType } from "mongoose";

const QuestionTypeSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const GeneratedQuestionSchema = new Schema(
  {
    text: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Moderate", "Hard"], required: true },
    marks: { type: Number, required: true },
    typeId: { type: String, required: true },
  },
  { _id: false }
);

const GeneratedSectionSchema = new Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [GeneratedQuestionSchema], default: [] },
  },
  { _id: false }
);

const ResultSchema = new Schema(
  {
    school: String,
    subject: String,
    grade: String,
    timeMinutes: Number,
    totalMarks: Number,
    sections: { type: [GeneratedSectionSchema], default: [] },
  },
  { _id: false }
);

const AssignmentSchema = new Schema(
  {
    title: { type: String, default: "Untitled Assignment" },
    subject: { type: String, default: "" },
    grade: { type: String, default: "" },
    school: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    questionTypes: { type: [QuestionTypeSchema], default: [] },
    instructions: { type: String, default: "" },
    fileName: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },
    error: { type: String, default: "" },
    jobId: { type: String, default: "" },
    result: { type: ResultSchema, default: null },
  },
  { timestamps: true }
);

export type AssignmentDoc = InferSchemaType<typeof AssignmentSchema>;
export const Assignment = model("Assignment", AssignmentSchema);
